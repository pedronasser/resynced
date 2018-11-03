import { useState, useEffect } from 'react';
import equal from 'fast-deep-equal'

type UpdateCondition<T> = (nextState: T, prevState: T) => boolean
type UpdateConditionList = [string]
type SyncedHook<T> = (cond?: UpdateCondition<T> | UpdateConditionList) => [T, any]
type SyncedReducerHook<T> = (cond?: UpdateCondition<T> | UpdateConditionList) => [T, Dispatcher]
type SyncedActionsHook<T> = (cond?: UpdateCondition<T> | UpdateConditionList) => [T, any]
type Listener<T> = (nextState: T, prevState: T) => void
type Dispatcher = (payload: any) => void
type Reducer<T> = (prevState: T, action: Action) => any
class Action {
  public type: string;
  public payload: any;
  constructor(type: string) {
    this.type = type
  }
}

function isObject(val: any): boolean {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

export default function syncedState<T = any>(initial: T = {} as T): SyncedHook<T> {
  let sharedState: T = initial

  const listeners: Array<Listener<T>> = []
  const setSharedState = (newstate: T) => {
    listeners.forEach(listener => listener(newstate, sharedState))
    sharedState = newstate
  }

  return function useSyncedState(cond?: UpdateCondition<T> | UpdateConditionList): [T, any] {
    const state = useState(sharedState)
    const localState: T = state[0]
    const setLocalState: any = state[1]

    useEffect(
      () => {
        let listener: Listener<T> = setLocalState

        if (typeof cond === "function") {
          listener = (nextState, prevState) => {
            if (cond(nextState, prevState)) {
              setLocalState(nextState)
            }
          }
        } else if (Array.isArray(cond)) {
          listener = (nextState: any, prevState: any) => {
            if (!isObject(nextState) || isObject(prevState)) {
              setLocalState(nextState)
              return
            }

            for (const c of cond) {
              if (!equal(nextState[c], prevState[c])) {
                return
              }
            }

            setLocalState(nextState)
          }
        }

        const listenerIndex = listeners.push(listener)
        setLocalState.listener = listenerIndex
        return () => {
          listeners.splice(setLocalState.listener, 1)
        }
      }
    )

    return [localState, setSharedState]
  }
}

export function createReducerHook<T = any>(useSyncedState: SyncedHook<T>, reducer: Reducer<T>): SyncedReducerHook<T> {
  return function useReducerHook(cond?: UpdateCondition<T> | UpdateConditionList): [T, Dispatcher] {
    const [state, setState] = useSyncedState(cond)
    const dispatcher: Dispatcher = (action) => {
      setState(reducer(state, action))
    }
    return [state, dispatcher]
  }
} 

export function createActionsHook<T = any>(useSyncedState: SyncedHook<T>, actionMethods: any, prefix?: string): SyncedActionsHook<T> {
  const actions: any = {}

  for (const actionName in actionMethods) {
    if (typeof actionMethods[actionName] === 'function') {
      const type = `${prefix}_${actionName}`;
      actions[type] = actionMethods[actionName]
      actionMethods[actionName] = (payload: any) => {
        return ({
          type,
          payload,
        })
      }
    }
  }

  const reducer = (state: T, action: Action) => {
    if (actions[action.type]) {
      return actions[action.type](state, action.payload)
    }

    return state
  }

  const useReducer = createReducerHook(useSyncedState, reducer)

  return function useActionsHook(cond?: UpdateCondition<T> | UpdateConditionList): [T, any] {
    const [state, dispatch] = useReducer(cond)
    const actionsWithDispatch = { 
      ...actionMethods,
    }

    for (const actionName in actionsWithDispatch) {
      if (typeof actionsWithDispatch[actionName] === 'function') {
        actionsWithDispatch[actionName] = (payload: any) => {
          dispatch(actionMethods[actionName](payload))
        }
      }
    }

    return [state, actionsWithDispatch]
  }
}
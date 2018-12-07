import { useState, useEffect } from 'react';
import equal from 'fast-deep-equal'

type GetStateFunction<T> = () => T
type SetStateFunction<T> = (newState: T) => void
type UpdateCondition<T> = (nextState: T, prevState: T) => boolean
type UpdateConditionList = [string]
type SyncedHook<T> = (cond?: UpdateCondition<T> | UpdateConditionList) => [any, SetStateFunction<T>]
type Listener<T> = (nextState: T) => void
type Effect = () => void

function isObject(val: any): boolean {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

function registerListenerEffect<T>(listeners: Array<Listener<T>>, currentState: any, setState: any, cond?: UpdateCondition<T> | UpdateConditionList): Effect {
  return () => {
    let listener: Listener<T> = setState

    if (typeof cond === "function") {
      listener = (nextState) => {
        if (cond(nextState, currentState)) {
          setState(nextState)
        }
      }
    } else if (Array.isArray(cond)) {
      listener = (nextState: any) => {
        if (!isObject(nextState) || isObject(currentState)) {
          setState(nextState)
          return
        }

        for (const c of cond) {
          if (!equal(nextState[c], currentState[c])) {
            return
          }
        }

        setState(nextState)
      }
    }

    const listenerIndex = listeners.push(listener) - 1
    setState.listener = listenerIndex
    return () => {
      listeners.splice(setState.listener, 1)
    }
  }
}

export function createSynced<T = any>(initial: T = {} as T): [SyncedHook<T>, GetStateFunction<T>, SetStateFunction<T>] {
  let sharedState: T = initial

  let listeners: Array<Listener<T>> = []
  const setSharedState: SetStateFunction<T> = (newState: T) => {
    const currentListeners = Array.from(listeners)
    listeners = []
    currentListeners.forEach(listener => listener(newState))
    sharedState = newState
  }

  const getSharedState: GetStateFunction<T> = () => {
    return sharedState
  }

  const useSyncedState: SyncedHook<T> = (cond) => {
    const state = useState(getSharedState())
    const localState: T = state[0]
    const setLocalState: any = state[1]

    useEffect(registerListenerEffect(listeners, localState, setLocalState, cond))

    return [localState, setSharedState]
  }

  return [useSyncedState, getSharedState, setSharedState]
}

type Dispatcher = (action: any) => any
type ReduxSyncedHook<T> = (cond?: UpdateCondition<T> | UpdateConditionList | undefined) => [any, Dispatcher]
interface ReduxStore<T> {
  dispatch: Dispatcher
  getState: () => T
  subscribe: (listener: any) => any
}

export function createSyncedRedux<T = any>(reduxStore: ReduxStore<T>): [ReduxSyncedHook<T>] {
  let listeners: Array<Listener<T>> = []

  reduxStore.subscribe(() => {
    const newState = reduxStore.getState()
    const currentListeners = Array.from(listeners)
    listeners = []
    currentListeners.forEach(listener => listener(newState))
  })

  const useReduxSynced: ReduxSyncedHook<T> = (cond) => {
    const state = useState(reduxStore.getState())
    const localState: T = state[0]
    const setLocalState: any = state[1]

    useEffect(registerListenerEffect(listeners, localState, setLocalState, cond))

    return [localState, reduxStore.dispatch]
  }

  return [useReduxSynced]
}
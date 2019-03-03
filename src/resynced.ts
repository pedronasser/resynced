import { useState, useLayoutEffect } from 'react'
import equal from 'fast-deep-equal'

export type GetStateFunction<T> = () => T
export type SetStateFunction<T> = (newState: T) => void
export type UpdateCondition<T> = (nextState: T, prevState: T) => boolean
export type UpdateConditionList = string[]
export type SyncedHook<T> = (
  cond?: UpdateCondition<T> | UpdateConditionList
) => [T, SetStateFunction<T>]
export type Listener<T> = (nextState: T) => void
type Effect = () => void

function isObject(val: any): boolean {
  return val != null && typeof val === 'object' && Array.isArray(val) === false
}

function registerListenerEffect<T>(
  listeners: Array<Listener<T>>,
  currentState: any,
  setState: any,
  cond?: UpdateCondition<T> | UpdateConditionList
): Effect {
  return () => {
    let listener: Listener<T> = setState

    if (typeof cond === 'function') {
      listener = nextState => {
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

    listeners.push(listener)
    return () => {
      for (let i = listeners.length - 1; ; --i) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1)
          break
        }
      }
    }
  }
}

export function createSynced<T = any>(
  initial: T = {} as T
): [SyncedHook<T>, GetStateFunction<T>, SetStateFunction<T>] {
  let sharedState: T = initial

  const listeners: Array<Listener<T>> = []
  const setSharedState: SetStateFunction<T> = (newState: T) => {
    const currentListeners = Array.from(listeners)
    currentListeners.forEach(listener => listener(newState))
    sharedState = newState
  }

  const getSharedState: GetStateFunction<T> = () => {
    return sharedState
  }

  const useSyncedState: SyncedHook<T> = cond => {
    const state = useState(getSharedState())
    const localState: T = state[0]
    const setLocalState: any = state[1]

    useLayoutEffect(
      registerListenerEffect(listeners, localState, setLocalState, cond),
      []
    )

    return [localState, setSharedState]
  }

  return [useSyncedState, getSharedState, setSharedState]
}

export type Dispatcher = (action: any) => any
export type ReduxSyncedHook<T> = (
  cond?: UpdateCondition<T> | UpdateConditionList | undefined
) => [T, Dispatcher]
interface ReduxStore<T> {
  dispatch: Dispatcher
  getState: () => T
  subscribe: (listener: any) => any
}

export function createSyncedRedux<T = any>(
  reduxStore: ReduxStore<T>
): [ReduxSyncedHook<T>] {
  const listeners: Array<Listener<T>> = []

  reduxStore.subscribe(() => {
    const newState = reduxStore.getState()
    const currentListeners = Array.from(listeners)
    currentListeners.forEach(listener => listener(newState))
  })

  const useReduxSynced: ReduxSyncedHook<T> = cond => {
    const state = useState(reduxStore.getState())
    const localState: T = state[0]
    const setLocalState: any = state[1]

    useLayoutEffect(
      registerListenerEffect(listeners, localState, setLocalState, cond),
      []
    )

    return [localState, reduxStore.dispatch]
  }

  return [useReduxSynced]
}

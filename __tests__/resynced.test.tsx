import React, { useEffect } from 'react'
import { createStore } from 'redux'
import { createSynced, createSyncedRedux } from '../src/resynced'
import renderer from 'react-test-renderer';

const delay = (ms = 1000) => new Promise((resolve) => {
  setTimeout(() => resolve(), ms)
})

describe('createSynced', () => {
  it('should create a new synced state', () => {
    const [syncedHook] = createSynced()

    expect(syncedHook).toBeDefined()
    expect(typeof syncedHook).toEqual('function')
  })

  it('should return a working SyncedHook', () => {
    const [useSyncedState] = createSynced("Foo")

    const App = () => {
      const [state, setState] = useSyncedState()

      useEffect(() => {
        setState("Bar")
      }, [])

      return (
        <h1>
          {state}
        </h1>
      )
    }

    const component = renderer.create(<App />)
    component.update(<App />)
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('SyncedHook', () => {
  it('should let conditional update using function', () => {
    const [useSyncedState] = createSynced(0)

    const mock = jest.fn(() => {
      return false
    });

    let lastState;
    const App = () => {
      const [state, setState] = useSyncedState(mock)
      lastState = state
      
      useEffect(() => {
        setState(1)
      }, [])

      return null
    }

    const component = renderer.create(<App />)
    component.update(<App />)
    expect(mock).toHaveBeenCalledTimes(1);
    expect(lastState).toBe(0);
  })

  it('should let conditional update using list properties', () => {
    const [useSyncedState] = createSynced({
      x: 0
    })

    let lastState = 0;
    const App = ({ update }) => {
      const [state, setState] = useSyncedState(['x'])
      lastState = state.x
      
      useEffect(() => {
        setState({
          ...state,
          ...update,
        })
      }, [])

      return null
    }

    let component = renderer.create(<App update={{ y: 1 }} />)
    component.update(<App update={{ y: 1 }} />)
    expect(lastState).toBe(0)

    component = renderer.create(<App update={{ x: 1 }} />)
    component.update(<App update={{ x: 1 }} />)
    expect(lastState).toBe(1)
  })
})

describe('createdSyncedRedux', () => {
  it('should create a ReduxSyncedHook', () => {
    const store = createStore(() => ({}))
    const [useSyncedRedux] = createSyncedRedux(store)

    expect(useSyncedRedux).toBeDefined()
    expect(typeof useSyncedRedux).toEqual('function')
  })

  it('should return a working ReduxSyncedHook', () => {
    const initial: any = { x: 0 }
    const store = createStore((state: any = initial) => ({ x: state.x+1 }))
    const [useSyncedRedux] = createSyncedRedux(store)

    const App = () => {
      const [state, dispatch] = useSyncedRedux()

      useEffect(() => {
        dispatch({ type: "" })
      }, [])

      return (
        <h1>
          {state.x}
        </h1>
      )
    }

    const component = renderer.create(<App />)
    component.update(<App />)
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})
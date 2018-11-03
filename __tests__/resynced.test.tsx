import React, { useEffect } from 'react'
import syncedState, { createReducerHook, createActionsHook } from '../src/resynced'
import renderer from 'react-test-renderer';

describe('syncedState', () => {
  it('should create a new synced state', () => {
    const state = syncedState()

    expect(state).toBeDefined()
    expect(typeof state).toEqual('function')
  })

  it('should return a usable hook', () => {
    const useSyncedState = syncedState("Foo")

    const App = () => {
      const [state] = useSyncedState()

      return (
        <h1>
          {state}
        </h1>
      )
    }

    const component = renderer.create(<App />)
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('createReducerHook', () => {
  it('should create a composed hook with a reducer function', () => {
    const useSyncedState = syncedState(0)
    const useSyncedReducerState = createReducerHook(useSyncedState, (state, action) => {
      switch (action.type) {
        case "INC": 
        return state + 1
        default:
        return state
      }
    })

    let lastState;
    const App = () => {
      const [state, dispatch] = useSyncedReducerState()
      lastState = state
      
      useEffect(() => {
        dispatch({
          type: "INC"
        })
      }, [])

      return null
    }

    const component = renderer.create(<App />)
    component.update()
    expect(lastState).toBe(1);
  })
})

describe('createActionsHook', () => {
  it('should create a composed hook with actions', () => {
    const useSyncedState = syncedState(0)
    const useSyncedReducerState = createActionsHook(useSyncedState, {
      inc(state: number): number {
        return state+1
      }
    })

    let lastState;
    const App = () => {
      const [state, { inc }] = useSyncedReducerState()
      lastState = state
      
      useEffect(() => {
        inc()
      }, [])

      return null
    }

    const component = renderer.create(<App />)
    component.update()
    expect(lastState).toBe(1);
  })
})

describe('SyncedHook', () => {
  it('should let conditional update using function', () => {
    const useSyncedState = syncedState(0)

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
    component.update()
    expect(mock).toHaveBeenCalledTimes(1);
    expect(lastState).toBe(0);
  })

  it('should let conditional update using list properties', () => {
    const useSyncedState = syncedState({
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
    component.update()
    expect(lastState).toBe(0)

    component = renderer.create(<App update={{ x: 1 }} />)
    component.update()
    expect(lastState).toBe(1)
  })
})
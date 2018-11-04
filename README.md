# Resynced (experimental)

<p>
  <img src="https://badgen.net/npm/v/resynced" />
  <img src="https://badgen.net/badge/license/MIT/blue" />
</p>

## ❤️ Motivation

This experiment goal is help React devs to build **multiple components** using **multiple synced states** using **no context provider**.

**This package requires the Hooks API available only in React 16.7.0-alpha.0 or later.**

## Example

- [Simple Example](https://codesandbox.io/s/3yyr3w7zym)

## 🔧 Install

```bash
$ yarn add resynced
```

## 🚀 How to Use


```jsx
import syncedState from 'resynced'

// creating synced state with initital value "John"
const useSyncedState = syncedState("John")

const UsingSharedState = () => {
  const [name, setName] = useSyncedState()

  return (
    <div>
      <h1>My name is {name}</h1>
      <button onClick={() => setName("Jorge")}>Change Name</button>
    </div>
  )
}
```


### Conditional updates

#### Using a list of properties

The component local state will only be synced if any of the given properties of the state object changes (only works with object states).

```js
import syncedState from 'resynced'

const useSyncedState = syncedState({
  name: "John"
})

const UsingSharedState = () => {
  const [state, setState] = useSyncedState(["name"])

  return (
    <div>
      <h1>My name is {name}</h1>
      <button onClick={() => setState({ name: "Jorge" })}>Change Name</button>
    </div>
  )
}
```

#### Using functions

The component local state will only be synced if the return of the given function is **true**.

```js
import syncedState from 'resynced'

const useSyncedState = syncedState("John")

const UsingSharedState = () => {
  const [name, setName] = useSyncedState((newState, prevState) => {
    return newState !== "Foo"
  })

  return (
    <div>
      <h1>My name is {name}</h1>
      <button onClick={() => setName("Jorge")}>Change Name</button>
    </div>
  )
}
```

### Using with Reducers

```js
import syncedState, { createReducerHook } from 'resynced'

const myState = syncedState(0)
const useSyncedState = createReducerHook(myState, (state, action) => {
  switch (action.type) {
    case 'INC': return state+1;
    case 'DEC': return state+1;
    default: return state;
  }
})

const UsingSharedState = () => {
  const [count, dispatch] = useSyncedState()

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => dispatch({ type: 'INC' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'DEC' })}>Decrement</button>
    </div>
  )
}
```

### Using with Actions

```js
import syncedState, { createActionsHook } from 'resynced'

const countState = syncedState(0)
const useSyncedState = createActionsHook(countState, {
  inc(state) {
    return state+1;
  },

  dec(state) {
    return state-1;
  }
})

const UsingSharedState = () => {
  const [count, { inc, dec }] = useSyncedState()

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={inc}>Increment</button>
      <button onClick={dev}>Decrement</button>
    </div>
  )
}
```

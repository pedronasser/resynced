# Resynced (experimental)

<p>
  <img src="https://badgen.net/npm/v/resynced" />
  <img src="https://badgen.net/badge/license/MIT/blue" />
</p>

## ❤️ Motivation

This is an experimental hook that lets you have **multiple components** using **multiple synced states** using **no context provider**.

And also provide a way of using that synced state with [Redux](https://redux.js.org/)!

**This package requires the Hooks API available only in React 16.7.0-alpha.0 or later.**

## 💻 Example

- [Simple Example](https://codesandbox.io/s/3yyr3w7zym)

## 🔧 Install

```bash
$ yarn add resynced
```

## 🚀 How to Use


```jsx
import { createSynced } from 'resynced'

const initialState = "John"
const [useSyncedState] = createSynced(initialState)

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

### Using with Redux

Let's first setup our synced redux store (you must have redux installed in your project)

```js
import { createSyncedRedux } from "resynced"
import { createStore } from "redux"

const initialState = {
  authenticated: false
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, authenticated: true }
    case "LOGOUT":
      return { ...state, authenticated: false }
    default:
      return state
  }
}

const authStore = createStore(reducer)
const [useSyncedAuth] = createSyncedRedux(authStore)

export default useSyncedAuth
```

Now we can use that synced redux in any component without the need of adding a Context Provider anywhere.

```js
import React from 'react'
import useAuth from './authStore'

const ComponentUsingAuth = React.memo(() => {
  // This component will only update when the 'authenticated'
  // property is updated
  const [{ authenticated }, dispatch] = useAuth(["authenticated"])

  return (
    <div>
      <h1>Authenticated? {authenticated ? "Yes" : "No"}</h1>
      <button onClick={() => dispatch({ type: "LOGIN" })}>Login</button>
      <button onClick={() => dispatch({ type: "LOGOUT" })}>Logout</button>
    </div>
  )
})  

export ComponentUsingAuth
```

You can check this working example here: [Resynced With Redux](https://codesandbox.io/s/1yx3n0nz7q)

### Conditional updates

#### Using a list of properties

The component local state will only be synced if any of the given properties of the state object changes (only works with object states).

```js
import { createSynced }  from 'resynced'

const initialState = {
  name: "John"
}
const [useSyncedState] = createSynced(initialState)

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
import { createSynced } from 'resynced'

const [useSyncedState] = createSynced("John")

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
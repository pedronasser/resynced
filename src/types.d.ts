import * as react from "react";

declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T) => void];
  export function useEffect(didUpdate: () => ((() => void) | void), params?: any[]): void;
}

export = react;
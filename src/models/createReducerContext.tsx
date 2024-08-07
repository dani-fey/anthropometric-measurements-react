import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react"

export const createReducerContext = <StateType, ActionType>(reducer: (state: StateType, action: ActionType) => StateType, initialState: StateType) => {
  type ContextType = [StateType, Dispatch<ActionType>]

  const initialValue: ContextType = [initialState, () => initialState]
  const Context = createContext(initialValue)

  const Provider = ({ children }: {children: ReactNode}) => {
    const reducerState = useReducer(reducer, initialState)
    return <Context.Provider value={reducerState}>
      {children}
    </Context.Provider>
  }

  const useProvider = () => useContext(Context)

  return { Provider, useProvider }
}
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HeaderColumnMap } from "../models/DataTransferObject";
import { useDataRequest } from "../hooks/useDataRequest";

const initialValue = {}

const HeaderContext = createContext<HeaderColumnMap>(initialValue)

export const HeaderContextProvider = ({ children }: {children: ReactNode}) => {
  const { getHeaders } = useDataRequest()

  const [ headers, setColumns ] = useState<HeaderColumnMap>(initialValue)

  useEffect(() => {
    getHeaders()
      .then(res => setColumns(res.data))
  }, [])

  return <HeaderContext.Provider value={headers}>
    {children}
  </HeaderContext.Provider>
}

export const useHeaderContext = () => {
  const headers = useContext(HeaderContext)
  const loaded = useMemo(() => !!headers.length, [headers])
  const getColumn = useCallback((id: string) => headers[id], [headers])

  return { headers, loaded, getColumn }
}
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HeaderColumnMap } from "../models/DataTransferObject";
import { useDataRequest } from "../hooks/useDataRequest";

const initialValue = {}

const ColumnContext = createContext<HeaderColumnMap>(initialValue)

export const ColumnContextProvider = ({ children }: {children: ReactNode}) => {
  const { getHeaders } = useDataRequest()

  const [ columns, setColumns ] = useState<HeaderColumnMap>(initialValue)

  useEffect(() => {
    getHeaders()
      .then(res => setColumns(res.data))
  }, [])

  return <ColumnContext.Provider value={columns}>
    {children}
  </ColumnContext.Provider>
}

export const useColumnContext = () => {
  const columns = useContext(ColumnContext)
  const loaded = useMemo(() => !!columns.length, [columns])
  const getColumn = useCallback((id: string) => columns[id], [columns])

  return { columns, loaded, getColumn }
}
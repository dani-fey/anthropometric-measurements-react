import { DataResponse, HeaderColumnMap } from "../models/Models"

export const useDataRequest = () => {
  const getHeaders = (): Promise<{time: number, data: HeaderColumnMap}> => {
    return fetch(`${import.meta.env.VITE_HOST_URL}/anthro.php?mode=headers`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(r => r.json())
  }

  const getData = (columns: string[]): Promise<DataResponse> => {
    return fetch(`${import.meta.env.VITE_HOST_URL}/anthro.php?mode=data&columns=${columns.join(',')}`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(r => r.json())
  }

  return { getHeaders, getData }
}
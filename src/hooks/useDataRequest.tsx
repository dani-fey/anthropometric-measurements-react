import { DataResponseDTO, HeaderColumnDTO } from "../models/DataTransferObject"

export const useDataRequest = () => {
  const getHeaders = (): Promise<{headers: HeaderColumnDTO[]}> => {
    return fetch(`${import.meta.env.VITE_HOST_URL}/anthro.php?mode=headers`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(r => r.json())
  }

  const getData = (xCol: number, yCol: number): Promise<DataResponseDTO> => {
    return fetch(`${import.meta.env.VITE_HOST_URL}/anthro.php?mode=data&colx=${xCol + 1}&coly=${yCol + 1}&scalex=10&scaley=10&race=all&age=all`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(r => r.json())
  }

  return { getHeaders, getData }
}
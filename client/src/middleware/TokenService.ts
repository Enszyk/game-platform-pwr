
import { secret, statistics } from "./AuthenticationService"
import { decode } from 'jsonwebtoken'

let token = ""

interface TokenDecoded {
  id: string;
  username: string;
  iat: number;
}

export const getToken = () => token
export const getUsername = () => {
  const decodedToken = decode(token) as TokenDecoded
  return decodedToken.username
}
export const setToken = (incToken: string) => {
  token = incToken
}

export const removeToken = () => {
  token = ""
}

export const getStatistics = async () => {
  try {
    const res = await statistics(getToken())
    return res.data.data
  } catch (e) {
    console.log(e);
    return false
  }
}

export const isTokenAuthorized = async () => {
  try {
    const res = await secret(getToken())
    return res.data.status === "ok"
  } catch (e) {
    console.log(e);
    return false;
  }
}

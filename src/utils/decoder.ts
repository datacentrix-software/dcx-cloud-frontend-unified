import { jwtDecode } from "jwt-decode";

export interface IToken {
  id?: number;
  email?: string;
  role?: string;
  sub?: string;  // Keycloak subject ID
  exp?: number;  // Token expiration timestamp
}

export const decoder = (token: string): IToken | null => {
  try {
    const decoded = jwtDecode(token) as IToken
    return decoded
  } catch (error) {
    return null
  }
}
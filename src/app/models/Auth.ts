export interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export interface Auth {
  access_token?: string
}

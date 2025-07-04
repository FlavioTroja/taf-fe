export interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export interface RegisterPayload {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ConfirmPayload {
  email: string;
  confirmationCode: string;
}

export interface RegisterResponse {
  userSub: string,
  userConfirmed: boolean,
  userId: string,
}

export interface Auth {
  access_token?: string
}

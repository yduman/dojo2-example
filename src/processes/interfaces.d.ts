import { UserProfile } from "../interfaces";

export interface EmailPayload {
  email: string;
}

export interface PasswordPayload {
  password: string;
}

export interface SetSessionPayload {
  session: UserProfile
}
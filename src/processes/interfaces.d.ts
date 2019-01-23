import { UserProfile } from "../interfaces";
import { OutletContext } from "@dojo/framework/routing/interfaces";

export interface EmailPayload {
  email: string;
}

export interface PasswordPayload {
  password: string;
}

export interface SetSessionPayload {
  session: UserProfile
}

export interface ChangeRoutePayload {
  outlet: string;
  context: OutletContext
}
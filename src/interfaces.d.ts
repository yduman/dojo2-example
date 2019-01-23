export type WithTarget<T extends Event = Event, E extends HTMLElement = HTMLInputElement> = T & { target: E };

export interface ResourceBased {
  loading: boolean;
  loaded: boolean;
}

export interface User {
  username: string;
  bio: string;
  image: string;
}

export interface Routing {
  outlet: string;
  params: { [index: string]: string };
}

export interface Errors {
  [index: string]: string[];
}

export interface Login extends ResourceBased {
  email: string;
  password: string;
  failed: boolean;
}

export interface UserProfile extends User, ResourceBased {
  email: string;
  token: string;
}

export interface State {
  login: Login;
  user: UserProfile;
  routing: Routing;
  errors: Errors;
}
import global from "@dojo/framework/shim/global";
import {createProcess} from "@dojo/framework/stores/process";
import {replace} from "@dojo/framework/stores/state/operations";
import {getHeaders, commandFactory} from "./utils";
import {baseUrl} from "../config";
import {EmailPayload, PasswordPayload, SetSessionPayload} from "./interfaces";

const loginEmailInputCommand =
  commandFactory<EmailPayload>(({ path, payload: { email } }) => {
    return [replace(path('login', 'email'), email)];
  });

const loginPasswordInputCommand =
  commandFactory<PasswordPayload>(({ path, payload: { password } }) => {
    return [replace(path("login", "password"), password)];
  });

const clearLoginInputs =
  commandFactory(({ path }) => {
    return [
      replace(path('login', 'email'), ''),
      replace(path('login', 'password'), '')
    ];
  });

const startLoginCommand =
  commandFactory(({ path }) => {
    return [replace(path('login', 'loading'), true)];
  });

const loginCommand =
  commandFactory(async ({ get, path }) => {
    const requestPayload = get(path('login'));

    const response = await fetch(`${baseUrl}/login`, {
      method: 'post',
      body: JSON.stringify(requestPayload),
      headers: getHeaders()
    });

    const json = await response.json();
    console.log("loginCommand response is:\n", json);

    if (!response.ok) {
      return [
        replace(path('login', 'failed'), true),
        replace(path('login', 'loading'), false),
        replace(path('errors'), json),
        replace(path('user'), {})
      ];
    }

    global.sessionStorage.setItem('dojo-session', JSON.stringify(json.user));

    return [
      replace(path('routing', 'outlet'), 'home'),
      replace(path('login', 'loading'), false),
      replace(path('errors'), undefined),
      replace(path('user'), json),
    ];
  });

const logoutCommand =
  commandFactory(({ path }) => {
    global.sessionStorage.removeItem('dojo-session');

    return [
      replace(path('user'), {}),
      replace(path('routing', 'outlet'), 'home')
    ];
  });

const setSessionCommand =
  commandFactory<SetSessionPayload>(({ path, payload: { session } }) => {
    return [replace(path('user'), session)];
  });

export const loginProcess = createProcess(
  'login',
  [startLoginCommand, loginCommand, clearLoginInputs]
);

export const loginEmailInputProcess = createProcess(
  'login-email-input',
  [loginEmailInputCommand]
);

export const loginPasswordInputProcess = createProcess(
  'login-password-input',
  [loginPasswordInputCommand]
);

export const logoutProcess = createProcess(
  'logout',
  [logoutCommand]
);

export const setSessionProcess = createProcess(
  'set-session',
  [setSessionCommand]
);
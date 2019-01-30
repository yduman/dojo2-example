# Documentation

## Project Setup

- Install Node.js
- Run `npm i @dojo/cli @dojo/cli-create-app -g` to install CLI features
- Run `dojo create app --name hello-world` to create a boilerplate app by the CLI
- Create two npm scripts for development and production build
  - to run these you just execute `npm run <script_name>`
    ```json
    // package.json
    "scripts": {
      "dev": "dojo build --mode dev --watch memory --serve",
      "prod": "dojo build --mode dist"
    },
    ```

## v() and w() functions

- we create DOM nodes with the `v()` function and it works like the following

  ```ts
  // v(name: string, properties: object, children: array)

  v("div", { classes: [css.root] }, [v("h1", ["Home Page"])]);

  /*
  is the equivalent of
  <div class="root">
    <h1>Home Page</h1>
  </div>
  */

  v("div", [v("h1", ["Another Example"])]);
  ```

- we create Widgets with the `w()` function and it works like the following

  ```ts
  protected render() {
    return v("div", { classes: [css.root] }, [
      v("h1", ["Grid Data"]),
      this._fetcher ?
      w(Grid, {
        columnConfig: this._columnConfig,
        fetcher: this._fetcher,
        updater: this._updater,
        height: 600
      }) : null
    ]);
  }
  ```

## Grid

- first we have to install a polyfill, since the grid is using the `ResizeObserver` API internally, which is currently only supported by Chrome
  - `npm install resize-observer-polyfill@1.5.0 --save-exact`
- Then import it in `main.ts`

  ```ts
  import ResizeObserver from "resize-observer-polyfill";
  import global from "@dojo/framework/shim/global";

  if (!global.ResizeObserver)
    global.ResizeObserver = ResizeObserver;
  ```
- Our Grid file looks like this then

  ```ts
  export default class Home extends WidgetBase {
    private _fetcher: any;
    private _updater: any;
    private _columnConfig = [...];

    async onAttach() {
      const response = await fetch("http://localhost:1234/data");
      const json = await response.json();
      
      this._fetcher = createFetcher(json);
      this._updater = createUpdater(json);
      
      this.invalidate();
    }

    protected render() {
      return v("div", { classes: [css.root] }, [
        v("h1", ["Grid Data"]),
        this._fetcher
          ? w(Grid, {
              columnConfig: this._columnConfig,
              fetcher: this._fetcher,
              updater: this._updater,
              height: 600
            })
          : null
      ]);
    }
  }
  ```

- The fetcher is a function responsible for returning data to the grid for the requested offset and size.
- The updater is an optional function responsible for performing updates made by editable columns.

## Stores

The ``@dojo/framework/stores`` package provides a centralized store, designed to be the **single source of truth** for an application. It operates using uni-directional data flow. This means all application data follows the same lifecycle, ensuring the application logic is predictable and easy to understand.

### Basics

To work with stores there are three core concepts - Operations, Commands, and Processes.

- ``Operation``
  - Granular instructions to manipulate state based on JSON Patch
- ``Command``
  - Simple functions that ultimately return operations needed to perform the required state change
- ``Process``
  - A function that executes a group of commands that usually represent a complete application behavior

#### Operations

Operations are the raw instructions the store uses to make modifications to the state. The operations are based on the JSON Patch and JSON Pointer specifications that have been customized specifically for Dojo stores, primarily to prevent access to the state's root.

Dojo stores support four of the six JSON Patch operations: "add", "remove", "replace", and "test". The "copy" and "move" operations are not currently supported. Each operation is a simple object which contains instructions with the ``OperationType``, ``path`` and optionally the ``value`` (depending on operation).

#### Commands

Commands are simply functions which are called internally by the store when executing a ``Process`` and return an array of ``PatchOperations`` that tells the store what state changes needs to be performed.

Each command is passed a ``CommandRequest`` which provides ``path`` and ``at`` functions to generate Paths in a typesafe way, a ``get`` function for access to the store's state, and a ``payload`` object for the argument that the process executor was called with.

The ``get`` function returns back state for a given ``Path``, for example ``get(path('my', 'deep', 'state'))`` or ``get(at(path('my', 'array', 'item'), 9))``.

#### Processes

A ``Process`` is the construct used to execute commands against a ``store`` instance in order to make changes to the application state. ``Processes`` are created using the ``createProcess`` factory function that accepts an array of commands and an optional callback that can be used to manage errors thrown from a command. The optional callback receives an ``error`` object and a ``result`` object. The ``error`` object contains the ``error`` stack and the command that caused the error.

### Example

```ts
// loginProcesses.ts

const startLoginCommand = commandFactory(({ path }) => {
  return [replace(path("login", "loading"), true)];
});

const loginCommand = commandFactory(async ({ get, path }) => {
  const requestPayload = get(path("login"));

  const response = await fetch(`${baseUrl}/login`, {
    method: "post",
    body: JSON.stringify(requestPayload),
    headers: getHeaders()
  });

  const json = await response.json();

  if (!response.ok) {
    return [
      replace(path("login", "failed"), true),
      replace(path("login", "loading"), false),
      replace(path("errors"), json),
      replace(path("user"), {})
    ];
  }

  return [
    replace(path("routing", "outlet"), "home"),
    replace(path("login", "loading"), false),
    replace(path("errors"), undefined),
    replace(path("user"), json)
  ];
});

const clearLoginInputs = commandFactory(({ path }) => {
  return [
    replace(path("login", "email"), ""),
    replace(path("login", "password"), "")
  ];
});

const loginEmailInputCommand = commandFactory<EmailPayload>(
  ({ path, payload: { email } }) => {
    return [replace(path("login", "email"), email)];
  }
);

const loginPasswordInputCommand = commandFactory<PasswordPayload>(
  ({ path, payload: { password } }) => {
    return [replace(path("login", "password"), password)];
  }
);

export const loginProcess = createProcess("login", [
  startLoginCommand,
  loginCommand,
  clearLoginInputs
]);

export const loginEmailInputProcess = createProcess("login-email-input", [
  loginEmailInputCommand
]);

export const loginPasswordInputProcess = createProcess("login-password-input", [
  loginPasswordInputCommand
]);
```

#### Usage

```ts
// LoginContainer.ts

const getProperties = (store: Store<State>): LoginProperties => {
  const {get, path} = store;

  return {
    email: get(path('login', 'email')),
    password: get(path('login', 'password')),
    errors: get(path("errors")),
    inProgress: get(path('login', 'loading')),
    onEmailInput: loginEmailInputProcess(store),
    onPasswordInput: loginPasswordInputProcess(store),
    onLogin: loginProcess(store)
  };
};

export default StoreContainer(
  Login,
  "state",
  { paths: [["login"]], getProperties }
);
```

```ts
// Login.ts

export interface LoginProperties {
  email: string;
  password: string;
  inProgress?: boolean;
  errors: Errors;
  onEmailInput: (opts: EmailPayload) => void;
  onPasswordInput: (opts: PasswordPayload) => void;
  onLogin: (opts: object) => void;
}

export class Login extends WidgetBase<LoginProperties> {
  private onEmailInput({ target: { value: email } }: WithTarget) {
    this.properties.onEmailInput({ email });
  }

  private onPasswordInput({ target: { value: password } }: WithTarget) {
    this.properties.onPasswordInput({ password });
  }

  private onLogin(event: Event) {
    event.preventDefault();
    this.properties.onLogin({});
  }

  protected render() {
    const { errors, email, password, inProgress = false } = this.properties;

    return v("div", { classes: [css.root] }, [
      v("h3", ["Login"]),
      errors ? w(ErrorList, { errors }) : null,
      v('form', { onsubmit: this.onLogin }, [
          v('fieldset', { classes: 'form-group' }, [
            v('input', {
              type: 'email',
              placeholder: 'Email',
              oninput: this.onEmailInput,
              value: email
            })
          ]),
          v('fieldset', { classes: 'form-group' }, [
            v('input', {
              type: 'password',
              placeholder: 'Password',
              oninput: this.onPasswordInput,
              value: password
            })
          ]),
          v('button', {
            disabled: inProgress,
            type: 'submit'
          }, ['Sign In'])
      ])
    ])
  }
}
```
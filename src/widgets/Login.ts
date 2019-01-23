import WidgetBase from "@dojo/framework/widget-core/WidgetBase";
import { v, w } from "@dojo/framework/widget-core/d";
import TextInput from "@dojo/widgets/text-input"

import * as css from "./styles/Login.m.css";

export default class Login extends WidgetBase {
  private _username: string | undefined;
  private _password: string | undefined;

  protected render() {
    return v("div", { classes: [css.root] }, [
      v("h1", ["Login"]),
      v("div", { classes: [css.textInput] }, [
        w(TextInput, {
          key: "username-text-input",
          label: "Username",
          type: "text",
          placeholder: "Username",
          value: this._username,
          onChange: (username: string) => {
            this._username = username;
            this.invalidate();
          }
        })
      ]),
      v("div", { classes: [css.textInput] }, [
        w(TextInput, {
          key: "password-text-input",
          label: "Password",
          type: "password",
          placeholder: "Password",
          value: this._password,
          onChange: (password: string) => {
            this._password = password;
            this.invalidate();
          }
        })
      ]),
    ])
  }
}
import WidgetBase from "@dojo/framework/widget-core/WidgetBase";
import { v, w } from "@dojo/framework/widget-core/d";
import { EmailPayload, PasswordPayload } from "../processes/interfaces";
import { Errors, WithTarget } from "../interfaces";
import * as css from "./styles/Login.m.css";
import { ErrorList } from "./ErrorList";

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
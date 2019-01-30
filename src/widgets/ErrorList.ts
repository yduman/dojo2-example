import { WidgetBase } from "@dojo/framework/widget-core/WidgetBase";
import { v } from "@dojo/framework/widget-core/d";
import { Errors } from "../interfaces";

interface ErrorListProperties {
  errors: Errors;
}

export class ErrorList extends WidgetBase<ErrorListProperties> {
  protected render() {
    const { errors } = this.properties;
    return v("p", [errors.error]);
  }
}

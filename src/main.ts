import global from "@dojo/framework/shim/global";
import {Store} from "@dojo/framework/stores/Store"
import ResizeObserver from "resize-observer-polyfill";
import Registry from '@dojo/framework/widget-core/Registry';
import renderer from '@dojo/framework/widget-core/vdom';
import { w } from '@dojo/framework/widget-core/d';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import { registerThemeInjector } from '@dojo/framework/widget-core/mixins/Themed';
import dojo from '@dojo/themes/dojo';
import '@dojo/themes/dojo/index.css';

import routes from './routes';
import App from './App';
import { State } from "./interfaces";

if (!global.ResizeObserver)
  global.ResizeObserver = ResizeObserver;

const registry = new Registry();
const store = new Store<State>();

registry.defineInjector("state", () => () => store);

const router = registerRouterInjector(routes, registry);

registerThemeInjector(dojo, registry);

const r = renderer(() => w(App, {}));
r.mount({ registry });

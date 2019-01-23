import global from "@dojo/framework/shim/global";
import {Store} from "@dojo/framework/stores/Store"
import ResizeObserver from "resize-observer-polyfill";
import Registry from '@dojo/framework/widget-core/Registry';
import has from "@dojo/framework/has/has";
import renderer from '@dojo/framework/widget-core/vdom';
import { w } from '@dojo/framework/widget-core/d';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import { registerThemeInjector } from '@dojo/framework/widget-core/mixins/Themed';
import dojo from '@dojo/themes/dojo';
import '@dojo/themes/dojo/index.css';

import routes from './routes';
import App from './App';
import { State } from "./interfaces";
import { setSessionProcess } from "./processes/loginProcesses";
import { changeRouteProcess } from "./processes/routeProcesses";

if (!global.ResizeObserver)
  global.ResizeObserver = ResizeObserver;

let session;
const registry = new Registry();
const store = new Store<State>();

/*
if (!has("build-time-render"))
  session = global.sessionStorage.getItem("dojo-session");
*/
/*
if (session) {
  console.log(`session is ${session}`);
  setSessionProcess(store)({ session: JSON.parse(session) });
}
*/

registry.defineInjector("state", () => () => store);
registerThemeInjector(dojo, registry);

const router = registerRouterInjector(routes, registry);

router.on("nav", ({ outlet, context }: any) => {
  changeRouteProcess(store)({ outlet, context });
});

const onRouteChange = () => {
  const outlet = store.get(store.path("routing", "outlet"));
  const params = store.get(store.path("routing", "params"));

  if (outlet) {
    const link = router.link(outlet, params);
    if (link !== undefined)
      router.setPath(link);
  }
};

store.onChange(store.path("routing", "outlet"), onRouteChange);
store.onChange(store.path("routing", "params"), onRouteChange);

const r = renderer(() => w(App, {}));
r.mount({ registry });

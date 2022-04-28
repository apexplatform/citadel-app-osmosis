import ReactDOM from "react-dom";
import App from "./App";
import store from "./store/store";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

const enabled = window.location.href.search('/localhost') === -1 && window.location.href.search('/192.168.') === -1
Sentry.init({
  dsn: enabled
    ? "https://2d3121618e2d4dcd8f109194256d7970@o510489.ingest.sentry.io/6094855"
    : null,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

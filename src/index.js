import React from "react";
import ReactDOM from "react-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

ReactDOM.render(
  <Auth0Provider
    domain="dev-8odjbliwttyqwb1h.us.auth0.com"
    clientId="3C10yuKGGQRKd0qQGUvBioldy4OuUwED"
    redirectUri={window.location.origin}
  >
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);
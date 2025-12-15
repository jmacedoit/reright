import "./ui/i18n";
import ReactDOM from "react-dom/client";
import App from "./ui/app";
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

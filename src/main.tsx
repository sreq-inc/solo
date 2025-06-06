import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { RequestProvider } from "./context/RequestContext";
import { FileProvider } from "./context/FileContext";
import { VariablesProvider } from "./context/VariablesContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <VariablesProvider>
        <RequestProvider>
          <FileProvider>
            <App />
          </FileProvider>
        </RequestProvider>
      </VariablesProvider>
    </ThemeProvider>
  </React.StrictMode>
);

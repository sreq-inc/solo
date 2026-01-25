import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { EnvironmentProvider } from "./context/EnvironmentContext";
import { FileProvider } from "./context/FileContext";
import { ImportProvider } from "./context/ImportContext";
import { RequestProvider } from "./context/RequestContext";
import { ThemeProvider } from "./context/ThemeContext";
import { VariablesProvider } from "./context/VariablesContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <EnvironmentProvider>
        <VariablesProvider>
          <RequestProvider>
            <FileProvider>
              <ImportProvider>
                <App />
              </ImportProvider>
            </FileProvider>
          </RequestProvider>
        </VariablesProvider>
      </EnvironmentProvider>
    </ThemeProvider>
  </React.StrictMode>
);

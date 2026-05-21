import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider as ColorModeProvider } from "next-themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { system } from "./theme";

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(container).render(
  <StrictMode>
    <ColorModeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <ChakraProvider value={system}>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </ColorModeProvider>
  </StrictMode>,
);

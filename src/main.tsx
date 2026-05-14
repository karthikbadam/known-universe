import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider as ColorModeProvider } from "next-themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { system } from "./theme";

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");

createRoot(container).render(
  <StrictMode>
    <ColorModeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </ColorModeProvider>
  </StrictMode>,
);

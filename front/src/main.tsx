import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Router from "./router.tsx";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster
        position="bottom-right"
        closeButton
        duration={3000}
        toastOptions={{
          style: {
            background: "#ffffff",
            border: "1px solid #ffd4b3",
            color: "#1b1b1b",
            boxShadow: "0 24px 60px -30px rgba(255, 122, 0, 0.35)",
          },
        }}
        theme="light"
        richColors
      />
    </QueryClientProvider>
  </StrictMode>,
);

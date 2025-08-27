"use client";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

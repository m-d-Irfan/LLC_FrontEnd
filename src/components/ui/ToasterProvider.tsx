"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "12px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          fontWeight: 500,
        },
        success: { iconTheme: { primary: "#14b8a6", secondary: "#fff" } },
        error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ToasterProvider from "@/components/ui/ToasterProvider";

export const metadata: Metadata = {
  title: "EduCore AI — Learn Without Limits",
  description: "A modern AI-powered learning management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}

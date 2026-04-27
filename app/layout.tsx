import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // or your font
import "./globals.css";

// IMPORT THE LOCK SCREEN
import AuthGate from "./components/AuthGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloud Vault",
  description: "Personal Cloud Storage",
  // manifest: "/manifest.json",
};



export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap everything inside AuthGate */}
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}



import type { Metadata } from "next";
import ReactScan from "@/components/react-scan";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Internals",
  description: "Learn React performance patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReactScan />
        {children}
      </body>
    </html>
  );
}

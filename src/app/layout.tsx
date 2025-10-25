import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lesson FAIry",
  description: "Create smart lessons instantly with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      
      </body>
    </html>
  );
}
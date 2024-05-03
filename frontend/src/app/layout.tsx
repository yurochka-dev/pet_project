import "./globals.css";

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { PublicEnvScript } from 'next-runtime-env';
import ThemeButton from "@/components/theme-button";
import ThemeProviderWrapper from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pet project",
  description: "Pet project game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
          <PublicEnvScript />
      </head>
      <body className={`${inter.className} h-full`}>
        <ThemeProviderWrapper>
          <div className="h-full bg-slate-200 dark:bg-slate-900">
            <ThemeButton />
            {children}
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}

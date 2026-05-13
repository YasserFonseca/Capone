import type { Metadata } from "next";
import { League_Spartan, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-black-mango",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAPONE - Automações de Agendamento",
  description: "Automações de atendimento prontas com CRM integrado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${leagueSpartan.variable} ${playfairDisplay.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

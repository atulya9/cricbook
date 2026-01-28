import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Cricbook - Cricket Social Network",
    template: "%s | Cricbook",
  },
  description:
    "Join the ultimate cricket social network. Share your thoughts, follow live matches, connect with cricket fans worldwide.",
  keywords: [
    "cricket",
    "social media",
    "cricket news",
    "live scores",
    "cricket fans",
    "IPL",
    "World Cup",
  ],
  authors: [{ name: "Cricbook" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Cricbook",
    title: "Cricbook - Cricket Social Network",
    description:
      "Join the ultimate cricket social network. Share your thoughts, follow live matches, connect with cricket fans worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cricbook - Cricket Social Network",
    description:
      "Join the ultimate cricket social network. Share your thoughts, follow live matches, connect with cricket fans worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Briefit — Connect Hustlers with Entrepreneurs",
  description: "The fastest way for founders to find skilled freelancers and for hustlers to find exciting gigs.",
  keywords: ["freelancer", "founder", "startup", "gig", "brief", "matching"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

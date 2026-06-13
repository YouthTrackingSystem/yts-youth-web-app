import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "YTS Youth Portal",
    template: "%s | YTS Youth Portal"
  },
  description: "Youth-facing portal for the Youth Tracking System.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YTS Youth"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f7d74",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

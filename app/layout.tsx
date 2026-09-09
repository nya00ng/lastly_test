import type { Metadata, Viewport } from "next";
import { DemoActivityProvider } from "@/components/app/DemoActivityProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LASTLY",
  description: "마지막으로 한 생활관리 행동을 기억하는 웹앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <DemoActivityProvider>{children}</DemoActivityProvider>
      </body>
    </html>
  );
}

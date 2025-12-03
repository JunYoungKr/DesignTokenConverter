import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design Token Converter",
  description: "Figma 디자인 토큰을 Tailwind, SCSS, Emotion 등 다양한 CSS 형식으로 변환하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

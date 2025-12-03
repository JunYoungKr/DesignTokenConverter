// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Design Token Converter - Figma 토큰 변환기",
    template: "%s | Design Token Converter",
  },
  description:
    "Figma Design Tokens를 Tailwind CSS, SCSS, Emotion, styled-components 등 다양한 CSS 형식으로 변환하세요. 무료 온라인 도구.",
  keywords: [
    "design tokens",
    "figma tokens",
    "tailwind converter",
    "css variables",
    "scss converter",
    "design system",
    "피그마 토큰",
    "디자인 토큰 변환",
  ],
  authors: [{ name: "JunYoung" }],
  creator: "JunYoung",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://your-domain.vercel.app",
    siteName: "Design Token Converter",
    title: "Design Token Converter - Figma 토큰 변환기",
    description:
      "Figma Design Tokens를 Tailwind, SCSS, Emotion 등으로 변환하세요",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Design Token Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Token Converter",
    description: "Figma 토큰을 다양한 CSS 형식으로 변환",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}

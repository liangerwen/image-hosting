import type { Metadata } from "next";
import { Nunito, PT_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "liangerwen's ☻ 微图床",
  description:
    "liangerwen's ☻ 微图床，免费、无广告、无需注册。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(nunito.variable, ptSans.variable, "antialiased")}>
        <div className="w-full flex flex-col items-center h-screen">
          <Nav />
          <Toaster position="top-center" />
          <div className="flex-1 overflow-auto w-full flex flex-col items-center">
            <main className="p-5 flex-grow w-full">{children}</main>
            <footer className="w-full h-16 bg-background text-secondary-foreground flex items-center justify-center flex-shrink-0">
              <p>Copyright ©{new Date().getFullYear()} By liangerwebn</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}

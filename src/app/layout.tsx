import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Every page reads data/progress/*.json, which changes as you practise, so
// render on each request instead of prerendering at build time (otherwise
// `next build && next start` would show a frozen snapshot).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "C1/C2 English Prep",
  description: "Personal Cambridge C1 Advanced / C2 Proficiency exam practice",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/reading-use-of-english", label: "Reading & Use of English" },
  { href: "/writing", label: "Writing" },
  { href: "/progress", label: "Progress & Feedback" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-1 px-4 py-3 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

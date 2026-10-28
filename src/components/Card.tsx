import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      {children}
    </div>
  );
}

export function LinkCard({
  href,
  title,
  description,
  meta,
}: {
  href: string;
  title: string;
  description?: string;
  meta?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
        {meta}
      </div>
      {description && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
    </Link>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "info";
}) {
  const tones: Record<string, string> = {
    default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    success:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    info: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  };
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

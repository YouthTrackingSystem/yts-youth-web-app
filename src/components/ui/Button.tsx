import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-brand-600 text-white hover:bg-brand-700",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-ink hover:bg-slate-50",
        className
      )}
      type={type}
      {...props}
    />
  );
}

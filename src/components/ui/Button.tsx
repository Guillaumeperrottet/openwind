import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 disabled:pointer-events-none disabled:opacity-50",
          {
            primary: "bg-sky-600 text-white hover:bg-sky-500",
            secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
            ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            danger: "bg-red-600 text-white hover:bg-red-500",
          }[variant],
          {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
          }[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

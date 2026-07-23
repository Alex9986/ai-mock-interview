import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function Card({
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  const paddings = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-surface border border-border rounded-xl ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

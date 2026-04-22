import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "teal" | "slate" | "green" | "yellow" | "red";
  className?: string;
}

const variants = {
  brand: "bg-brand-100 text-brand-700",
  teal:  "bg-teal-100 text-teal-700",
  slate: "bg-slate-100 text-slate-700",
  green: "bg-green-100 text-green-700",
  yellow:"bg-yellow-100 text-yellow-700",
  red:   "bg-red-100 text-red-700",
};

export default function Badge({ children, variant = "brand", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold font-dm",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

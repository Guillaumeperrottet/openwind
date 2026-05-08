import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-orange-100 text-orange-700",
  EXPERT: "bg-red-100 text-red-700",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

export const WATER_LABELS: Record<string, string> = {
  FLAT: "Flat",
  CHOP: "Chop",
  WAVES: "Vagues",
  MIXED: "Mixte",
};

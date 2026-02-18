import { type SVGProps } from "react";

export interface IconDefinition {
  name: string;
  viewBox: string;
  path: string;
}

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  icon: IconDefinition;
  size?: IconSize | number;
  /** Accessible label. If omitted, icon is decorative (aria-hidden). */
  label?: string;
}

/**
 * Polymorphic SVG icon component.
 * Pass an icon definition and optional size/label.
 *
 * @example
 * <Icon icon={Check} size="md" label="Success" />
 * <Icon icon={ArrowRight} size={18} className="text-muted-foreground" />
 */
export function Icon({
  icon,
  size = "md",
  label,
  className = "",
  ...props
}: IconProps) {
  const px = typeof size === "number" ? size : sizeMap[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={px}
      height={px}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!label}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    >
      <path d={icon.path} />
    </svg>
  );
}

/** Value type for the slider: a single number or a [min, max] tuple for range mode. */
export type SliderValue = number | [number, number];

/** A mark rendered along the slider track at a specific value. */
export interface SliderMark {
  value: number;
  label?: string;
}

/** Props for the SliderRange component. */
export interface SliderRangeProps {
  /** Controlled value. A number for single handle, a tuple for dual handles. */
  value?: SliderValue;
  /** Default uncontrolled value. */
  defaultValue?: SliderValue;
  /** Called on every value change during interaction. */
  onChange?: (value: SliderValue) => void;
  /** Called when the user finishes a drag or keyboard interaction. */
  onChangeEnd?: (value: SliderValue) => void;
  /** Minimum value. @default 0 */
  min?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
  /** Whether the slider is disabled. */
  disabled?: boolean;
  /** Orientation of the slider. @default 'horizontal' */
  orientation?: "horizontal" | "vertical";
  /** Size variant affecting track height and thumb size. @default 'md' */
  size?: "sm" | "md" | "lg";
  /** Visual variant for track fill styling. @default 'default' */
  variant?: "default" | "accent" | "gradient";
  /** Show tooltip on thumbs. false = never, true = on hover/drag, 'always' = always visible. @default true */
  showTooltip?: boolean | "always";
  /** Whether to show marks along the track. @default false */
  showMarks?: boolean;
  /** Custom marks to render along the track. */
  marks?: SliderMark[];
  /** Formatter for displayed values (tooltip, marks). @default String */
  formatValue?: (value: number) => string;
  /** Minimum distance between dual handles. Only applies in range mode. @default 0 */
  minDistance?: number;
  /** Accessible label for the slider. */
  label?: string;
  /** Form field name attribute. */
  name?: string;
}

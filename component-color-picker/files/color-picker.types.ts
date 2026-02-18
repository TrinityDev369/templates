/** Supported color output formats. */
export type ColorFormat = "hex" | "rgb" | "hsl";

/** An RGB color with optional alpha channel. */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** An HSL color with optional alpha channel. */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

/** A color value in any supported format. */
export type ColorValue = string | RGBColor | HSLColor;

/** A preset swatch with a display label and hex value. */
export interface ColorPreset {
  label: string;
  /** Hex color string (e.g. "#ff0000"). */
  value: string;
}

/** Props for the ColorPicker component. */
export interface ColorPickerProps {
  /** Controlled hex color value. */
  value?: string;
  /** Default hex color for uncontrolled mode. */
  defaultValue?: string;
  /** Called when the selected color changes (always returns hex). */
  onChange?: (color: string) => void;
  /** Which format to display in the text input. */
  format?: ColorFormat;
  /** Preset color swatches shown below the picker. */
  presets?: ColorPreset[];
  /** Show the EyeDropper button (requires browser support). */
  showEyeDropper?: boolean;
  /** Show the alpha/opacity slider. */
  showAlpha?: boolean;
  /** Show the color format text input. */
  showInput?: boolean;
  /** Disable all interactions. */
  disabled?: boolean;
  /** Size variant. */
  size?: "sm" | "md" | "lg";
}

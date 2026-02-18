/**
 * Condition evaluation engine for the conditional form system.
 *
 * Evaluates individual conditions and visibility rules against
 * current form values to determine field visibility.
 */

import type {
  Condition,
  ConditionOperator,
  FieldConfig,
  FormValues,
  VisibilityRule,
} from "./conditional-form.types";

/**
 * Evaluate a single condition against the current form values.
 *
 * @param condition - The condition to evaluate.
 * @param values - Current form values keyed by field name.
 * @returns `true` if the condition is satisfied.
 */
export function evaluateCondition(
  condition: Condition,
  values: FormValues
): boolean {
  const fieldValue = values[condition.field];
  const expectedValue = condition.value;

  return evaluateOperator(condition.operator, fieldValue, expectedValue);
}

/**
 * Apply a comparison operator to a field value and an expected value.
 *
 * @param operator - The comparison operator.
 * @param fieldValue - The actual field value from form state.
 * @param expectedValue - The value to compare against.
 * @returns `true` if the comparison holds.
 */
function evaluateOperator(
  operator: ConditionOperator,
  fieldValue: string | number | boolean | undefined,
  expectedValue: string | number | boolean | undefined
): boolean {
  switch (operator) {
    case "equals":
      return String(fieldValue) === String(expectedValue);

    case "not-equals":
      return String(fieldValue) !== String(expectedValue);

    case "contains": {
      if (typeof fieldValue !== "string" || typeof expectedValue !== "string") {
        return false;
      }
      return fieldValue.toLowerCase().includes(expectedValue.toLowerCase());
    }

    case "greater-than": {
      const numField = Number(fieldValue);
      const numExpected = Number(expectedValue);
      if (Number.isNaN(numField) || Number.isNaN(numExpected)) return false;
      return numField > numExpected;
    }

    case "less-than": {
      const numField = Number(fieldValue);
      const numExpected = Number(expectedValue);
      if (Number.isNaN(numField) || Number.isNaN(numExpected)) return false;
      return numField < numExpected;
    }

    case "is-empty":
      return (
        fieldValue === undefined ||
        fieldValue === "" ||
        fieldValue === false
      );

    case "is-not-empty":
      return (
        fieldValue !== undefined &&
        fieldValue !== "" &&
        fieldValue !== false
      );

    default:
      return false;
  }
}

/**
 * Evaluate a visibility rule against the current form values.
 *
 * If the rule contains multiple conditions, they are combined using
 * the specified logical operator (AND by default).
 *
 * @param rule - The visibility rule to evaluate.
 * @param values - Current form values.
 * @returns `true` if the field should be visible.
 */
export function evaluateVisibilityRule(
  rule: VisibilityRule,
  values: FormValues
): boolean {
  const { conditions, logicalOperator = "AND" } = rule;

  if (conditions.length === 0) return true;

  if (logicalOperator === "OR") {
    return conditions.some((condition) =>
      evaluateCondition(condition, values)
    );
  }

  // Default: AND
  return conditions.every((condition) =>
    evaluateCondition(condition, values)
  );
}

/**
 * Compute a visibility map for all fields in the form.
 *
 * Fields without a `visibilityRule` are always visible.
 *
 * @param fields - All field configurations.
 * @param values - Current form values.
 * @returns A record mapping field names to their visibility state.
 */
export function computeVisibility(
  fields: FieldConfig[],
  values: FormValues
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};

  for (const field of fields) {
    if (!field.visibilityRule) {
      visibility[field.name] = true;
    } else {
      visibility[field.name] = evaluateVisibilityRule(
        field.visibilityRule,
        values
      );
    }
  }

  return visibility;
}

/**
 * Build a Zod-compatible validation function that only validates
 * currently visible fields.
 *
 * @param fields - All field configurations.
 * @param visibility - The current visibility map.
 * @param values - Current form values.
 * @returns An array of validation error objects `{ field, message }`.
 */
export function validateVisibleFields(
  fields: FieldConfig[],
  visibility: Record<string, boolean>,
  values: FormValues
): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = [];

  for (const field of fields) {
    // Skip validation for hidden fields
    if (!visibility[field.name]) continue;

    const value = values[field.name];

    // Required check
    if (field.required) {
      if (
        value === undefined ||
        value === "" ||
        (field.type === "checkbox" && value === false)
      ) {
        errors.push({
          field: field.name,
          message: `${field.label} is required`,
        });
        continue;
      }
    }

    // Skip further validation if the field is empty and not required
    if (value === undefined || value === "") continue;

    // Min/max for number fields
    if (field.type === "number" && typeof value === "number") {
      if (field.min !== undefined && value < field.min) {
        errors.push({
          field: field.name,
          message: `${field.label} must be at least ${field.min}`,
        });
      }
      if (field.max !== undefined && value > field.max) {
        errors.push({
          field: field.name,
          message: `${field.label} must be at most ${field.max}`,
        });
      }
    }

    // Min/max length for text and textarea
    if (
      (field.type === "text" || field.type === "textarea") &&
      typeof value === "string"
    ) {
      if (field.min !== undefined && value.length < field.min) {
        errors.push({
          field: field.name,
          message: `${field.label} must be at least ${field.min} characters`,
        });
      }
      if (field.max !== undefined && value.length > field.max) {
        errors.push({
          field: field.name,
          message: `${field.label} must be at most ${field.max} characters`,
        });
      }
    }
  }

  return errors;
}

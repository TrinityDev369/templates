export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'textarea';

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number | boolean | string[];
  order: number;
}

export type FieldValue = Record<string, string | number | boolean | string[]>;

export interface FieldBuilderProps {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
}

export interface FieldRendererProps {
  fields: FieldDefinition[];
  values: FieldValue;
  onChange: (values: FieldValue) => void;
  readOnly?: boolean;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  select: 'Select',
  multiselect: 'Multi-Select',
  checkbox: 'Checkbox',
  url: 'URL',
  email: 'Email',
  textarea: 'Text Area',
};

export const FIELD_TYPES: FieldType[] = [
  'text', 'number', 'date', 'select', 'multiselect',
  'checkbox', 'url', 'email', 'textarea',
];

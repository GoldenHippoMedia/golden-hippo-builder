import { Model } from '@builder.io/app-context';
import { BuilderElement } from '@builder.io/sdk/dist/src/types/element';
import { Input } from '@builder.io/sdk/dist/src/builder.class';

export type BuilderResponseBaseData = {
  blocks?: BuilderElement[];
  inputs?: Input[];
  state?: {
    [key: string]: any;
  };
  [key: string]: any;
};

export interface ModelShape extends Omit<Model, 'id' | 'fields'> {
  name: string;
  displayName: string;
  kind: 'data' | 'component' | 'page';
  helperText: string | undefined;
  contentTitleField: string | undefined;
  fields: BuilderIOFieldTypes[];
  editingUrlLogic?: string;
  hideFromUI?: boolean;
}

export type BuilderIOFieldTypes =
  | BaseBuilderIOField
  | ListField
  | FileField
  | ReferenceField
  | ObjectField
  | NumberField
  | SelectField
  | UIBlockField
  | TagsField;

interface BaseBuilderIOField {
  '@type'?: '@builder.io/core:Field';
  /**
   * This is the key of the field in the data object.
   * Use camelCase when possible.
   */
  name: string;
  /**
   * Provide a name to present in the UI.
   */
  friendlyName: string;
  /**
   * Indicate if this field is required.
   *
   * If you add a required field to existing data, it will not break access to the existing data.
   * However, the field must be set before any further changes can be saved. This means *all retrieved
   * data should be treated as optional.*
   */
  required?: boolean;
  /**
   * When `true` users can provide alternate translations of the content.
   * This is available for most field types (excl. `object`)
   */
  localized?: boolean;
  /**
   * Provides the field descriptor text displayed under the field.
   *
   * This text should be short and helpful when provided. While beneficial, avoid providing help text on the most
   * obvious fields as it may clutter the screen. For example, you may not need to provide help text for a boolean
   * field called "Show Banner".
   */
  helperText?: string | undefined;
  /**
   * Hides the field entry by collapsing. The friendly name will be the accordian toggle.
   * Typically, we set this to true unless the model has few fields. You typically want to collapse
   * `object` models as those are treated as sections on the entry forms.
   */
  defaultCollapsed: boolean;
  makeEntryTitle?: boolean;
  /**
   * Conditionally hide this field based on a boolean returned by a function.
   * From our current testing, this function can reference the current `object`,
   * but not the entire current entry.
   *
   * Ref: Our page model has multiple fields with `showIf` methods.
   */
  showIf?: string;
  /**
   * This allows you to create fields that are "api only".
   * These can be handy when syncing external IDs or other "readonly" data.
   */
  hidden?: boolean;
  /**
   * The type of field.
   */
  type: 'text' | 'longText' | 'html' | 'boolean' | 'color' | 'url' | 'timestamp' | 'uiBlocks' | 'map' | 'Tags';
  /**
   * A default value for this field when creating a new entry.
   *
   * *NOTE*
   *
   * This value is not set on _any current entries_. Unfortunately, this means that you cannot use this to set a
   * default value on a new required field.
   */
  defaultValue?:
    | string
    | {
        '@type'?: string;
        Default?: string | number | boolean;
      };
  advanced?: boolean;
}

interface FileField extends Omit<BaseBuilderIOField, 'type'> {
  type: 'file';
  showTemplatePicker?: boolean;
  allowedFileTypes: string[];
  copyOnAdd?: boolean;
}

interface ReferenceField extends Omit<BaseBuilderIOField, 'type'> {
  type: 'reference';
  modelId: string;
  copyOnAdd: boolean;
  showTemplatePicker?: boolean;
}

interface ListField extends Omit<BaseBuilderIOField, 'type'> {
  type: 'list';
  subFields: ReferenceField[] | BuilderIOFieldTypes[];
  showTemplatePicker?: boolean;
  copyOnAdd?: boolean;
}

interface ObjectField extends Omit<BaseBuilderIOField, 'type' | 'defaultValue' | 'localized'> {
  type: 'object';
  subFields: BuilderIOFieldTypes[];
  defaultValue?: unknown;
  /**
   * ### Important!
   * Builder.io will "break" your model if you attempt to localize an 'object'.
   *
   * It's best just to leave this undefined, but instead of excluding it from the type, we've declared it
   * to provide this context.
   */
  localized?: false;
}

interface NumberField extends Omit<BaseBuilderIOField, 'type' | 'defaultValue'> {
  type: 'number';
  defaultValue: number | undefined;
}

interface SelectField extends Omit<BaseBuilderIOField, 'type' | 'defaultValue'> {
  type: 'select';
  defaultValue?:
    | string
    | {
        '@type'?: string;
        Default?: string | number | boolean;
      };
  enum: string[];
}

interface TagsField extends Omit<BaseBuilderIOField, 'type' | 'defaultValue'> {
  type: 'Tags';
  defaultValue?: string[];
}

interface UIBlockField extends Omit<BaseBuilderIOField, 'type' | 'defaultCollapsed' | 'friendlyName'> {
  type: 'uiBlocks';
  defaultCollapsed: boolean;
  copyOnAdd: boolean;
  friendlyName?: string;
}

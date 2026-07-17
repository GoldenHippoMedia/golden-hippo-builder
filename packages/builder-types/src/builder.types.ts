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

export type BuilderContentReference<T> = {
  id: string;
  value: {
    id: string;
    data: T;
  };
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
  /**
   * Model-level hooks run by Builder.io. Each value is the source of a function,
   * serialized to a string (the same way `editingUrlLogic` is stored).
   *
   * `validate` runs when content is saved. It receives `contentModel` in scope
   * and returns a validation result (`{ level, field, element, message }`) — or
   * an array of them — to surface issues/warnings in the editor.
   *
   * Only `validate` is typed because it's the only hook this package has
   * verified against Builder. Builder supports others (its editor references a
   * `change` hook), but their exact keys/semantics aren't confirmed — add them
   * here explicitly once verified rather than via an open-ended index signature
   * that would invite unchecked, possibly-wrong hook names.
   *
   * NOTE: This type describes only the shape you AUTHOR and send (a plain object
   * of string values). It is NOT the shape you get back when reading a live
   * model. At runtime Builder stores hooks as a MobX/MST map (accessed via
   * `.get()`/`.set()`), and reads come off the app-context `Model` type — which
   * doesn't even declare `hooks`. So when reading an existing model, treat
   * `model.hooks` as `unknown` and normalize it (map-like OR object, values may
   * be non-strings); don't assume this plain-object shape. Assuming it here is
   * what broke the admin field-diff (`.trim` on a non-string map value).
   */
  hooks?: {
    validate?: string;
  };
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
  friendlyName?: string;
  /**
   * Indicate if this field is required.
   *
   * If you add a required field to existing data, it will not break access to the existing data.
   * However, the field must be set before any further changes can be saved. This means *all retrieved
   * data should be treated as optional.*
   */
  required?: boolean | string;
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
    | boolean
    | {
        '@type'?: string;
        Default?: string | number | boolean;
      };
  advanced?: boolean;
  min?: number;
  max?: number;
  regex?: {
    pattern: string;
    /** flags for the RegExp constructor, e.g. "gi"  */
    options?: string;
    message: string;
  };
  broadcast?: boolean;
}

interface FileField extends Omit<BaseBuilderIOField, 'type'> {
  type: 'file';
  showTemplatePicker?: boolean;
  allowedFileTypes: string[];
  copyOnAdd?: boolean;
}

type ReferenceField = Omit<BaseBuilderIOField, 'type'> & {
  type: 'reference';
  copyOnAdd: boolean;
  showTemplatePicker?: boolean;
} & ({ modelId: string } | { model: string | undefined });

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

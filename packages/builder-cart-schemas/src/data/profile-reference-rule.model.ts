import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import {
  BuilderIngredientContent,
  BuilderProductCategoryContent,
  BuilderProductTagContent,
  BuilderProductUseCaseContent,
} from '@goldenhippo/builder-shared-schemas';

export enum ProfileFieldReference {
  Age = 'Age',
  Gender = 'Gender',
  Weight = 'Weight',
  Type = 'Type',
}

export enum ProfileReferenceType {
  Tag = 'Tag',
  Ingredient = 'Ingredient',
  Category = 'Category',
  UseCase = 'UseCase',
}

export const createProfileReferenceRuleModel = (): ModelShape => {
  return {
    name: 'profile-reference-rule',
    displayName: 'Profile Reference Rule',
    kind: 'data',
    helperText: 'Apply profile-based personalization by associating tags, ingredients, etc. to profile properties.',
    contentTitleField: 'displayName',
    fields: [
      {
        name: 'displayName',
        friendlyName: 'Rule Name',
        type: 'text',
        required: true,
        defaultCollapsed: false,
        localized: true,
        helperText: 'The name of this profile reference rule.',
      },
      {
        name: 'referenceType',
        friendlyName: 'Reference Type',
        type: 'select',
        required: true,
        defaultCollapsed: false,
        enum: [
          ProfileReferenceType.Tag,
          ProfileReferenceType.Ingredient,
          ProfileReferenceType.Category,
          ProfileReferenceType.UseCase,
        ],
        helperText: 'The type of content reference to apply when this rule is triggered.',
        defaultValue: ProfileReferenceType.Tag,
      },
      {
        name: 'tagReference',
        friendlyName: 'Tag',
        type: 'reference',
        required: 'return options.get("referenceType") === "Tag"',
        showIf: `return options.get("referenceType") === "Tag"`,
        defaultCollapsed: false,
        helperText: 'The content reference to apply when this rule is triggered.',
        copyOnAdd: true,
        model: 'product-tag',
      },
      {
        name: 'ingredientReference',
        friendlyName: 'Ingredient',
        type: 'reference',
        required: `return options.get("referenceType") === "Ingredient"`,
        showIf: `return options.get("referenceType") === "Ingredient"`,
        defaultCollapsed: false,
        helperText: 'The content reference to apply when this rule is triggered.',
        copyOnAdd: true,
        model: 'product-ingredient',
      },
      {
        name: 'categoryReference',
        friendlyName: 'Category',
        type: 'reference',
        required: `return options.get("referenceType") === "Category"`,
        showIf: `return options.get("referenceType") === "Category"`,
        defaultCollapsed: false,
        helperText: 'The content reference to apply when this rule is triggered.',
        copyOnAdd: true,
        model: 'product-category',
      },
      {
        name: 'useCaseReference',
        friendlyName: 'Use Case',
        type: 'reference',
        required: `return options.get("referenceType") === "UseCase"`,
        showIf: `return options.get("referenceType") === "UseCase"`,
        defaultCollapsed: false,
        helperText: 'The content reference to apply when this rule is triggered.',
        copyOnAdd: true,
        model: 'product-use-case',
      },
      {
        name: 'applicationRules',
        type: 'list',
        friendlyName: 'Application Rules',
        required: true,
        defaultCollapsed: false,
        helperText:
          'The rules that determine when the linked reference should be applied. These rules are evaluated together, so all rules must be satisfied for the reference to be applied.',
        subFields: [
          {
            name: 'profileField',
            friendlyName: 'Profile Field',
            type: 'select',
            required: true,
            defaultCollapsed: false,
            enum: [
              ProfileFieldReference.Age,
              ProfileFieldReference.Gender,
              ProfileFieldReference.Weight,
              ProfileFieldReference.Type,
            ],
            helperText: 'The profile field to evaluate for this rule.',
          },
          {
            name: 'stringOperator',
            friendlyName: 'Operator',
            type: 'select',
            required: 'return options.get(profileField) === "Gender" || options.get(profileField) ===' + ' "Type"',
            showIf: `return options.get('profileField') === "Gender" || options.get('profileField') === "Type"`,
            defaultCollapsed: false,
            enum: ['is', 'is not', 'contains', 'does not contain'],
            helperText: 'The operator to use when evaluating the profile field.',
          },
          {
            name: 'numberOperator',
            friendlyName: 'Operator',
            type: 'select',
            required: 'return options.get(profileField) === "Age" || options.get(profileField) ===' + ' "weight"',
            showIf: `return options.get('profileField') === 'Age' || options.get('profileField') === 'Weight'`,
            defaultCollapsed: false,
            enum: ['equals', 'not equals', 'greater than', 'less than'],
            helperText: 'The operator to use when evaluating the profile field.',
          },
          {
            name: 'numberValue',
            friendlyName: 'Value',
            type: 'number',
            defaultValue: 0,
            required: `return options.get(profileField) === 'Age' || options.get(profileField) === 'Weight'`,
            showIf: `return options.get('profileField') === 'Age' || options.get('profileField') === 'Weight'`,
            defaultCollapsed: false,
            helperText: 'The numeric value to compare against the profile field.',
          },
          {
            name: 'stringValue',
            friendlyName: 'Value',
            type: 'text',
            required: `return options.get(profileField) === 'Gender' || options.get(profileField) === 'Type'`,
            showIf: `return options.get('profileField') === 'Gender' || options.get('profileField') === 'Type'`,
            defaultCollapsed: false,
            helperText: 'The string value to compare against the profile field. Case insensitive.',
          },
        ],
      },
    ],
  };
};

export type BuilderProfileReferenceRuleContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      displayName: string;
      referenceType: ProfileReferenceType;
      tagReference?: BuilderContentReference<BuilderProductTagContent['data']>;
      ingredientReference?: BuilderContentReference<BuilderIngredientContent['data']>;
      categoryReference?: BuilderContentReference<BuilderProductCategoryContent['data']>;
      useCaseReference?: BuilderContentReference<BuilderProductUseCaseContent['data']>;
      applicationRules: Array<
        | {
            profileField: ProfileFieldReference.Age | ProfileFieldReference.Weight;
            operator: 'equals' | 'not equals' | 'greater than' | 'less than' | 'contains' | 'does not contain';
            numberValue: number;
          }
        | {
            profileField: ProfileFieldReference.Gender | ProfileFieldReference.Type;
            operator: 'equals' | 'not equals' | 'greater than' | 'less than' | 'contains' | 'does not contain';
            stringValue: string;
          }
      >;
    };
  }>;

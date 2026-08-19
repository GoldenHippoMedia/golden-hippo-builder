// Helpers for Builder.io reference fields used across the offer-flow UI. Flows are fetched without
// resolving references, so a stored ref carries only `{ '@type', model, id }`; once resolved it also
// has `value`. These accessors read the id either way, and the builders write the stored shape.

/** The Builder.io reference envelope type for a reference field value. */
export const BUILDER_REF_TYPE = '@builder.io/core:Reference';

/** A stored reference to a content entry of the given model. */
export const contentRef = (model: string, id: string) => ({ '@type': BUILDER_REF_TYPE, model, id });

/** Entry id of a reference field, whether or not the reference has been resolved. */
export const refId = (ref: any): string => ref?.value?.id ?? ref?.id ?? '';

/** Entry id of a condition-product's `product` reference. */
export const productRefId = (entry: any): string => refId(entry?.product);

/** Entry id of a step's `template` reference. */
export const templateRefId = (step: any): string => refId(step?.template);

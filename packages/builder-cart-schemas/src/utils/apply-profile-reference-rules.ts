import {BuilderProfileReferenceRuleContent, ProfileFieldReference} from "../data/profile-reference-rule.model";

interface PetProfile {
    [ProfileFieldReference.Age]: number;
    [ProfileFieldReference.Weight]: number;
    [ProfileFieldReference.Breed]: string;
    [ProfileFieldReference.Type]: string;
    [ProfileFieldReference.HealthConditions]: string[];
    [ProfileFieldReference.Gender]: string;
}

interface Reference {
    id: string;
    name: string;
}

interface AppliedRules {
    tags: Reference[];
    categories: Reference[];
    useCases: Reference[];
    ingredients: Reference[];
}

export function applyProfileReferenceRules(profile: Partial<PetProfile>, rules: BuilderProfileReferenceRuleContent[]): AppliedRules {
    const tags = new Set<Reference>();
    const categories = new Set<Reference>();
    const useCases = new Set<Reference>();
    const ingredients = new Set<Reference>();

    for (const rule of rules) {
        const { referenceType, categoryReference, ingredientReference, tagReference, useCaseReference, applicationRules } = rule.data;
        if (!applicationRules) continue;
        let reference: Reference | null = null;
        switch (referenceType) {
            case 'Tag': {
                if (tagReference?.id && tagReference.value.data?.name){
                    reference = { id: tagReference.id, name: tagReference.value.data.name };
                }
                break;
            }
            case 'Category': {
                if (categoryReference?.id && categoryReference.value.data?.name){
                    reference = { id: categoryReference.id, name: categoryReference.value.data.name };
                }
                break;
            }
            case 'UseCase': {
                if (useCaseReference?.id && useCaseReference.value.data?.name){
                    reference = { id: useCaseReference.id, name: useCaseReference.value.data.name };
                }
                break;
            }
            case 'Ingredient': {
                if (ingredientReference?.id && ingredientReference.value.data?.name){
                    reference = { id: ingredientReference.id, name: ingredientReference.value.data.name };
                }
                break;
            }
            default:
                break;
        }
        if (!reference) continue;
        // Now we have to verify that each rule in applicationRules is satisfied by the profile
        const isRuleSatisfied = applicationRules.every((applicationRule) => {
            const field = applicationRule.profileField;
            if (field === ProfileFieldReference.Gender || field === ProfileFieldReference.Type || field === ProfileFieldReference.Breed ){
                const { stringOperator, stringValue } = applicationRule
                if (stringOperator === 'is') return profile[field]?.toLowerCase() === stringValue?.toLowerCase();
                if (stringOperator === 'is not') return profile[field]?.toLowerCase() !== stringValue?.toLowerCase();
                if (stringOperator === 'contains') return profile[field]?.toLowerCase().includes(stringValue?.toLowerCase() ?? '');
                if (stringOperator === 'does not contain') return !profile[field]?.toLowerCase().includes(stringValue?.toLowerCase() ?? '');
            }
            if (field === ProfileFieldReference.Age || field === ProfileFieldReference.Weight){
                const { numberOperator, numberValue } = applicationRule
                if (numberOperator === 'equals') return profile[field] === numberValue;
                if (numberOperator === 'not equals') return profile[field] !== numberValue;
                if (numberOperator === 'greater than') return (profile[field] ?? 0) > numberValue;
                if (numberOperator === 'less than') return (profile[field] ?? 0) < numberValue;
            }
            if (field === ProfileFieldReference.HealthConditions){
                const { stringOperator, stringValue } = applicationRule
                if (stringOperator === 'is') return profile[field]?.some(condition => condition.toLowerCase() === stringValue?.toLowerCase());
                if (stringOperator === 'is not') return !profile[field]?.some(condition => condition.toLowerCase() === stringValue?.toLowerCase());
                if (stringOperator === 'contains') return profile[field]?.some(condition => condition.toLowerCase() === stringValue?.toLowerCase()); // Same as "is"
                if (stringOperator === 'does not contain') return !profile[field]?.some(condition => condition.toLowerCase() === stringValue?.toLowerCase()); // Same as "is not"
            }
        });
        if (!isRuleSatisfied) continue;

        // If we get here, the rule is satisfied, so we can add the reference to the appropriate set
        switch (referenceType) {
            case 'Tag':
                tags.add(reference);
                break;
            case 'Category':
                categories.add(reference);
                break;
            case 'UseCase':
                useCases.add(reference);
                break;
            case 'Ingredient':
                ingredients.add(reference);
                break;
            default:
                break;
        }
    }

    return {
        tags: tags.size ? Array.from(tags) : [],
        categories: categories.size ? Array.from(categories) : [],
        useCases: useCases.size ? Array.from(useCases) : [],
        ingredients: ingredients.size ? Array.from(ingredients) : [],
    }
}

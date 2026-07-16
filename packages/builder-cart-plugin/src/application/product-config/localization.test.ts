import { describe, it, expect } from 'vitest';
import { collectLocales, localize, setLocalized, LOCALIZED_TYPE } from './localization';

const loc = (obj: Record<string, unknown>) => ({ '@type': LOCALIZED_TYPE, ...obj });

describe('collectLocales', () => {
  it('returns only Default when there are no localized fields', () => {
    expect(collectLocales([{ data: { name: 'plain', count: 3 } }])).toEqual(['Default']);
  });

  it('ignores non-locale metadata keys on localized fields (altText/title)', () => {
    // Mirrors a Builder localized image: locale keys live alongside metadata.
    const entries = [
      { data: { image: loc({ Default: 'd.png', 'en-CA': 'ca.png', altText: 'alt', title: 'A title' }) } },
    ];
    expect(collectLocales(entries)).toEqual(['Default', 'en-CA']);
  });

  it('unions and sorts locales across entries', () => {
    const entries = [
      { data: { displayName: loc({ Default: 'a', 'es-MX': 'a' }) } },
      { data: { displayName: loc({ Default: 'b', 'en-CA': 'b', fr: 'b' }) } },
    ];
    expect(collectLocales(entries)).toEqual(['Default', 'en-CA', 'es-MX', 'fr']);
  });

  it('discovers locales nested inside object fields (e.g. packagingLabels.singular)', () => {
    const entries = [{ data: { packagingLabels: { singular: loc({ Default: 'bottle', 'es-MX': 'botella' }) } } }];
    expect(collectLocales(entries)).toEqual(['Default', 'es-MX']);
  });

  it('discovers locales nested inside list items', () => {
    const entries = [
      {
        data: {
          featuredIngredients: {
            featuredIngredient: [
              { featuredIngredientTitle: loc({ Default: 'Zinc', 'fr-CA': 'Zinc' }) },
              { featuredIngredientTitle: loc({ Default: 'Iron', de: 'Eisen' }) },
            ],
          },
        },
      },
    ];
    expect(collectLocales(entries)).toEqual(['Default', 'de', 'fr-CA']);
  });
});

describe('localize / setLocalized', () => {
  it('resolves to the requested locale, falling back to Default', () => {
    const v = loc({ Default: 'd', 'en-CA': 'ca' });
    expect(localize(v, 'en-CA')).toBe('ca');
    expect(localize(v, 'fr')).toBe('d');
    expect(localize('plain', 'en-CA')).toBe('plain');
  });

  it('merges a locale without clobbering the others', () => {
    const existing = loc({ Default: 'd', 'en-CA': 'ca' });
    const next = setLocalized(existing, 'fr', 'fr-value');
    expect(next).toMatchObject({ '@type': LOCALIZED_TYPE, Default: 'd', 'en-CA': 'ca', fr: 'fr-value' });
  });
});

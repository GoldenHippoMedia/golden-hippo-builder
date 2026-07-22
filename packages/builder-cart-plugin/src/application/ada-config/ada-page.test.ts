import { describe, expect, it } from 'vitest';
import { auditPage, auditSeverity, summarize, type PageEntry } from './ada-page';

// Minimal Builder block/page factories — only the fields the audit reads.
const imageBlock = (image: string, altText?: string) => ({
  '@type': '@builder.io/sdk:Element',
  component: { name: 'Image', options: { image, ...(altText !== undefined ? { altText } : {}) } },
});

const textBlock = (text: string) => ({
  '@type': '@builder.io/sdk:Element',
  component: { name: 'Text', options: { text } },
});

const buttonBlock = (text: string) => ({
  '@type': '@builder.io/sdk:Element',
  component: { name: 'Core:Button', options: { text } },
});

const page = (blocks: unknown[], extra: Record<string, unknown> = {}): PageEntry =>
  ({
    id: 'p1',
    name: 'Test Page',
    published: 'published',
    data: { url: '/test', pageType: 'General', blocks },
    ...extra,
  }) as unknown as PageEntry;

describe('auditPage — images', () => {
  it('flags an Image block with no alt text as a blocking issue', () => {
    const audit = auditPage(page([imageBlock('https://x/a.jpg')]));
    expect(audit.imageCount).toBe(1);
    expect(audit.imagesMissingAlt).toBe(1);
    expect(audit.issues.map((i) => i.code)).toContain('img-missing-alt');
    expect(auditSeverity(audit)).toBe('error');
  });

  it('passes an Image block that has alt text', () => {
    const audit = auditPage(page([imageBlock('https://x/a.jpg', 'A dog')]));
    expect(audit.imagesMissingAlt).toBe(0);
    expect(audit.issues).toHaveLength(0);
  });

  it('counts inline <img> tags inside rich text and checks their alt', () => {
    const audit = auditPage(page([textBlock('<p><img src="a.jpg"><img src="b.jpg" alt="ok"></p>')]));
    expect(audit.imageCount).toBe(2);
    expect(audit.imagesMissingAlt).toBe(1);
  });

  it('finds images nested in child blocks', () => {
    const audit = auditPage(page([{ '@type': 'el', children: [imageBlock('https://x/a.jpg')] }]));
    expect(audit.imageCount).toBe(1);
    expect(audit.imagesMissingAlt).toBe(1);
  });
});

describe('auditPage — headings', () => {
  it('warns when a page with content has no headings', () => {
    const audit = auditPage(page([textBlock('<p>Just a paragraph</p>')]));
    expect(audit.warnings.map((w) => w.code)).toContain('no-headings');
  });

  it('warns on a skipped heading level (H1 → H3)', () => {
    const audit = auditPage(page([textBlock('<h1>Title</h1><h3>Sub</h3>')]));
    expect(audit.warnings.map((w) => w.code)).toContain('heading-skip');
  });

  it('warns on multiple H1s', () => {
    const audit = auditPage(page([textBlock('<h1>One</h1><h1>Two</h1>')]));
    expect(audit.warnings.map((w) => w.code)).toContain('multiple-h1');
  });

  it('accepts a well-ordered outline', () => {
    const audit = auditPage(page([textBlock('<h1>Title</h1><h2>Section</h2><h3>Detail</h3>')]));
    expect(audit.warnings.map((w) => w.code)).not.toContain('heading-skip');
    expect(audit.warnings.map((w) => w.code)).not.toContain('no-h1');
  });
});

describe('auditPage — link purpose', () => {
  it('flags generic link text', () => {
    const audit = auditPage(page([textBlock('<h1>H</h1><a href="/x">click here</a>')]));
    expect(audit.warnings.map((w) => w.code)).toContain('generic-link');
  });

  it('flags a button with no text', () => {
    const audit = auditPage(page([textBlock('<h1>H</h1>'), buttonBlock('')]));
    expect(audit.warnings.map((w) => w.code)).toContain('empty-link');
  });

  it('accepts descriptive link text', () => {
    const audit = auditPage(page([textBlock('<h1>H</h1><a href="/x">View the 2024 sustainability report</a>')]));
    expect(audit.warnings.map((w) => w.code)).not.toContain('generic-link');
  });
});

describe('auditPage — empty / structural edge cases', () => {
  it('does not flag heading/content warnings on a page with no blocks', () => {
    const audit = auditPage(page([]));
    expect(audit.hasContent).toBe(false);
    expect(audit.warnings).toHaveLength(0);
    expect(audit.issues).toHaveLength(0);
  });

  it('tolerates malformed block data without throwing', () => {
    const audit = auditPage(page([null, 'nope', { children: 'not-an-array' }] as unknown[]));
    expect(audit.imageCount).toBe(0);
  });
});

describe('summarize', () => {
  it('aggregates counts across pages', () => {
    const audits = [
      auditPage(page([imageBlock('a.jpg')])), // 1 missing alt → issue
      auditPage(page([imageBlock('b.jpg', 'ok'), textBlock('<h1>Ok</h1>')])), // clean
    ];
    const s = summarize(audits);
    expect(s.total).toBe(2);
    expect(s.withIssues).toBe(1);
    expect(s.imagesMissingAlt).toBe(1);
    expect(s.clean).toBe(1);
  });
});

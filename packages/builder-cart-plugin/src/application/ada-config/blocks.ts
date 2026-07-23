// Shared traversal of Builder's visual block tree, used by both the per-page
// audit (ada-page.ts) and the per-asset usage view (asset-usage.ts) so they
// agree on what counts as an image / heading / link.

// Builder stores visual content as a tree of elements. We only read a few
// fields, so the shape is intentionally loose.
export interface BuilderBlock {
  '@type'?: string;
  id?: string;
  component?: { name?: string; options?: Record<string, unknown> };
  children?: BuilderBlock[];
  [key: string]: unknown;
}

export const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

// Walk every block in the tree, invoking `visit` on each. Guards against the
// occasional non-array `children`.
export const walkBlocks = (blocks: BuilderBlock[] | undefined, visit: (block: BuilderBlock) => void): void => {
  if (!Array.isArray(blocks)) return;
  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;
    visit(block);
    walkBlocks(block.children, visit);
  }
};

// Pull the src / alt attributes off an inline <img> tag.
const attr = (tag: string, name: string): string => {
  const m = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return (m?.[2] ?? m?.[3] ?? '').trim();
};

// Strip HTML tags to recover the visible text of a rich-text fragment.
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

export interface FoundImage {
  /** The image URL as stored on the block (asset CDN url or inline src). */
  url: string;
  /** The alt text on this specific placement (empty when missing). */
  alt: string;
}

/**
 * Collect every on-page image and its placement-level alt text: Builder Image
 * components (options.image / options.altText) plus inline <img> tags inside
 * rich-text (options.text).
 */
export const collectImages = (blocks: BuilderBlock[] | undefined): FoundImage[] => {
  const images: FoundImage[] = [];
  walkBlocks(blocks, (block) => {
    const name = block.component?.name ?? '';
    const options = block.component?.options ?? {};

    if (name === 'Image' && str(options.image)) {
      images.push({ url: str(options.image), alt: str(options.altText) });
    }

    const text = typeof options.text === 'string' ? options.text : '';
    if (text) {
      for (const m of text.matchAll(/<img\b[^>]*>/gi)) {
        const src = attr(m[0], 'src');
        if (src) images.push({ url: src, alt: attr(m[0], 'alt') });
      }
    }
  });
  return images;
};

export interface FoundHeading {
  level: number;
  text: string;
}

/** Collect headings (h1–h6) from rich-text blocks, in document order. */
export const collectHeadings = (blocks: BuilderBlock[] | undefined): FoundHeading[] => {
  const headings: FoundHeading[] = [];
  walkBlocks(blocks, (block) => {
    const text = typeof block.component?.options?.text === 'string' ? (block.component.options.text as string) : '';
    if (!text) return;
    for (const m of text.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
      headings.push({ level: Number(m[1]), text: stripHtml(m[2]) });
    }
  });
  return headings;
};

/** Collect visible link/button labels: rich-text <a> tags and Button blocks. */
export const collectLinkLabels = (blocks: BuilderBlock[] | undefined): string[] => {
  const labels: string[] = [];
  walkBlocks(blocks, (block) => {
    const name = block.component?.name ?? '';
    const options = block.component?.options ?? {};

    const text = typeof options.text === 'string' ? options.text : '';
    if (text && /<a\b/i.test(text)) {
      for (const m of text.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
        labels.push(stripHtml(m[1]));
      }
    }

    if (name === 'Core:Button') {
      labels.push(str(options.text));
    }
  });
  return labels;
};

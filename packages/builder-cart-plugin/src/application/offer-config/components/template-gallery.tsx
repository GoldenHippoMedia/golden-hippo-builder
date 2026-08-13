import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { type BuilderOfferTemplateContent } from '@goldenhippo/builder-cart-schemas';

interface TemplateGalleryProps {
  templates: BuilderOfferTemplateContent[];
  currentId: string;
  editUrl: string;
  stepLabel: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const offerCountOf = (t: BuilderOfferTemplateContent): number => Math.max(1, t.data?.offerCount ?? 1);

// A larger layout glyph shown as the preview fallback (until the live iframe loads, or if it can't).
const GlyphFallback: React.FC<{ count: number }> = ({ count }) => {
  const cols = count <= 3 ? count : Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return (
    <div
      className="grid h-[58%] w-[62%] gap-1.5"
      style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` }}
    >
      {Array.from({ length: count }).map((_, k) => (
        <span
          key={k}
          className="rounded-[3px]"
          style={{ background: 'color-mix(in srgb, var(--accent) 40%, var(--border-strong))' }}
        />
      ))}
    </div>
  );
};

// The design thumbnail: an iframe of the real template, rendered wide then scaled down. Mounted
// lazily (only when scrolled into view) and revealed on load, with the glyph showing until then.
const TemplatePreview: React.FC<{ template: BuilderOfferTemplateContent; editUrl: string }> = ({
  template,
  editUrl,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const previewUrl =
    editUrl && template.id
      ? `${editUrl}/builder-offer-template-editor?offerTemplate=${template.id}&builder.preview=true`
      : '';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '150px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-[150px] w-full overflow-hidden bg-[var(--bg-primary)]">
      <div className="absolute inset-0 grid place-items-center">
        <GlyphFallback count={offerCountOf(template)} />
      </div>
      {visible && previewUrl && (
        <iframe
          src={previewUrl}
          title={template.name || template.id}
          tabIndex={-1}
          scrolling="no"
          onLoad={() => setLoaded(true)}
          className={`pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: 1000, height: 750, transform: 'scale(0.2)' }}
        />
      )}
    </div>
  );
};

const LAYOUTS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: '1', label: '1 offer' },
  { key: '2', label: '2 offers' },
  { key: '3', label: '3 offers' },
  { key: '4', label: '4 offers' },
];

const TemplateGallery: React.FC<TemplateGalleryProps> = observer(
  ({ templates, currentId, editUrl, stepLabel, onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [layout, setLayout] = useState('all');

    const matches = templates.filter((t) => {
      if (layout !== 'all' && String(offerCountOf(t)) !== layout) return false;
      if (query && !(t.name ?? '').toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    return (
      <>
        <div className="fixed inset-0 z-[55] bg-black/50" onClick={onClose} />
        <div className="fixed left-1/2 top-1/2 z-[60] flex max-h-[86vh] w-[880px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-secondary)] shadow-2xl">
          <div className="border-b border-[var(--border-glass)] p-5">
            <div className="flex items-start gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Choose a template</h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  for {stepLabel} · live previews load as you scroll
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <input
              className="hippo-input mt-4"
              placeholder="Search templates by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-3 inline-flex gap-1 rounded-lg border border-[var(--border-glass)] bg-[var(--input-bg)] p-1">
              {LAYOUTS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLayout(l.key)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    layout === l.key
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-2 text-[11px] tabular-nums text-[var(--text-muted)]">
            {matches.length} of {templates.length} templates
          </div>

          <div className="flex-1 overflow-y-auto p-5 pt-1">
            {matches.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                {templates.length === 0 ? 'No templates found.' : 'No templates match your search.'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {matches.map((t) => {
                  const selected = t.id === currentId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => t.id && onSelect(t.id)}
                      className={`flex w-[200px] flex-col overflow-hidden rounded-xl border text-left transition-all hover:-translate-y-0.5 ${
                        selected
                          ? 'border-[var(--accent)] shadow-[0_0_0_2px_var(--accent-glow)]'
                          : 'border-[var(--border-glass)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <TemplatePreview template={t} editUrl={editUrl} />
                      <div className="flex items-center gap-2 border-t border-[var(--border-glass)] px-2.5 py-2">
                        <span className="flex-1 truncate text-xs font-semibold text-[var(--text-primary)]">
                          {t.name || t.id}
                        </span>
                        <span className="shrink-0 rounded border border-[var(--border-glass)] bg-[var(--bg-glass)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                          {offerCountOf(t)} offer{offerCountOf(t) === 1 ? '' : 's'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
);

TemplateGallery.displayName = 'TemplateGallery';

export default TemplateGallery;

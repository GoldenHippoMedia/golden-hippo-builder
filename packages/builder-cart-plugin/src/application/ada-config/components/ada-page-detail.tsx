import React from 'react';
import { type AdaAudit } from '../ada-page';

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className,
}) => (
  <div className={className}>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
    <div className="mt-1 text-[13px] text-[var(--text-primary)]">{children}</div>
  </div>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="italic text-[var(--text-muted)]">{children}</span>
);

const AdaPageDetail: React.FC<{ audit: AdaAudit }> = ({ audit }) => {
  const clean = audit.issues.length === 0 && audit.warnings.length === 0;

  return (
    <div className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)]/40 p-4">
      {!audit.hasContent && (
        <div className="mb-4 rounded-md border border-[var(--border-glass)] bg-[var(--bg-glass)] px-3 py-2 text-[12px] text-[var(--text-muted)]">
          This page has no visual content blocks to audit — it may be built entirely from symbols or rendered
          dynamically, which this checklist can&apos;t inspect.
        </div>
      )}

      {/* Issues */}
      <div className="mb-4">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Issues</div>
        {audit.issues.length === 0 ? (
          <div className="text-[13px] font-medium text-[var(--success)]">✓ No blocking accessibility issues</div>
        ) : (
          <ul className="flex flex-col gap-1">
            {audit.issues.map((f) => (
              <li key={f.code} className="flex items-center gap-2 text-[13px] text-[var(--error)]">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--error)]" />
                {f.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Warnings */}
      {audit.warnings.length > 0 && (
        <div className="mb-4">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Warnings
          </div>
          <ul className="flex flex-col gap-1">
            {audit.warnings.map((f) => (
              <li key={f.code} className="flex items-center gap-2 text-[13px] text-[var(--warning)]">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--warning)]" />
                {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {clean && audit.hasContent && (
        <div className="mb-4 text-[12px] text-[var(--text-muted)]">
          No content-level accessibility problems detected. Note: this checklist inspects CMS content only — it
          can&apos;t verify color contrast, keyboard navigation, or ARIA. Use a live scanner (WAVE, axe) for those.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Images">
          {audit.imageCount === 0 ? (
            <Empty>None found</Empty>
          ) : (
            <>
              <span className="tabular-nums">{audit.imageCount}</span>
              {audit.imagesMissingAlt > 0 ? (
                <span className="ml-2 text-[12px] text-[var(--error)]">{audit.imagesMissingAlt} missing alt</span>
              ) : (
                <span className="ml-2 text-[12px] text-[var(--success)]">all have alt text</span>
              )}
            </>
          )}
        </Field>

        <Field label="Headings">
          {audit.headingCount === 0 ? (
            <Empty>None found</Empty>
          ) : (
            <span className="tabular-nums">{audit.headingCount}</span>
          )}
        </Field>

        <Field label="Type">{audit.pageType}</Field>
      </div>
    </div>
  );
};

export default AdaPageDetail;

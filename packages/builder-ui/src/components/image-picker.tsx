import React, { useState } from 'react';
import clsx from 'clsx';

export interface ImagePickerProps {
  value?: string;
  label: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export function ImagePicker({ value, label, onChange, className }: ImagePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const hasImage = typeof value === 'string' && value.length > 0;

  return (
    <>
      <div className={clsx('w-40 flex flex-col gap-1.5', className)}>
        {hasImage ? (
          <div
            className="relative w-40 h-32 rounded-xl border border-[var(--border-glass)] bg-[var(--input-bg)] cursor-pointer overflow-hidden group"
            onClick={() => setShowModal(true)}
          >
            <img src={value} alt={label} className="w-full h-full object-contain p-3" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                className="px-3 py-1 rounded-md text-[11px] font-semibold bg-[var(--accent)] text-[#1a1a2e] cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
              >
                Change
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-md text-[11px] font-semibold bg-white/10 text-white/80 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(undefined);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            className="w-40 h-32 rounded-xl border border-dashed border-[var(--border-glass)] bg-[var(--input-bg)] cursor-pointer flex flex-col items-center justify-center gap-2 hover:border-[var(--border-glass-focus)] hover:bg-[var(--bg-glass-hover)] transition-all"
            onClick={() => setShowModal(true)}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)]">Select Image</span>
          </div>
        )}
        <span className="text-[11px] font-medium text-[var(--text-secondary)] text-center leading-tight">{label}</span>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl p-8 w-[480px] max-w-[90vw] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Select Image</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Choose an image from Builder.io&apos;s media library
            </p>
            <div className="border border-dashed border-[var(--border-glass)] rounded-xl py-12 px-6 text-center text-[var(--text-muted)] text-sm mb-6">
              Builder.io Media Library integration coming soon
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

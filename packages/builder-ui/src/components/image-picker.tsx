import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface ImagePickerProps {
  value?: string;
  label: string;
  onChange: (url: string | undefined) => void;
  fetchAssets?: () => Promise<MediaAsset[]>;
  className?: string;
}

export function ImagePicker({ value, label, onChange, fetchAssets, className }: ImagePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const hasImage = typeof value === 'string' && value.length > 0;

  const loadAssets = useCallback(async () => {
    if (!fetchAssets) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAssets();
      setAssets(result);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, [fetchAssets]);

  useEffect(() => {
    if (showModal && fetchAssets && assets.length === 0 && !loading) {
      loadAssets();
    }
  }, [showModal, fetchAssets, assets.length, loading, loadAssets]);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setSearch('');
  };

  const selectAsset = (asset: MediaAsset) => {
    onChange(asset.url);
    closeModal();
  };

  const filtered = search ? assets.filter((a) => a.name?.toLowerCase().includes(search.toLowerCase())) : assets;

  return (
    <>
      <div className={clsx('w-40 flex flex-col gap-1.5', className)}>
        {hasImage ? (
          <div
            className="relative w-40 h-32 rounded-xl border border-[var(--border-glass)] bg-[var(--input-bg)] cursor-pointer overflow-hidden group"
            onClick={openModal}
          >
            <img src={value} alt={label} className="w-full h-full object-contain p-3" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                className="px-3 py-1 rounded-md text-[11px] font-semibold bg-[var(--accent)] text-[#1a1a2e] cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal();
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
            onClick={openModal}
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
          onClick={closeModal}
        >
          <div
            className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl p-6 w-[640px] max-w-[90vw] max-h-[80vh] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Select Image</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Choose from your Builder.io media library</p>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-glass-hover)] cursor-pointer transition-colors"
                onClick={closeModal}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              className="hippo-input mb-4 text-sm"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="hippo-spinner" />
                  <span className="ml-3 text-sm text-[var(--text-muted)]">Loading media library...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-sm text-[var(--error)] mb-3">{error}</p>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
                    onClick={loadAssets}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && !fetchAssets && (
                <div className="text-center py-12 text-sm text-[var(--text-muted)]">Media library not available</div>
              )}

              {!loading && !error && fetchAssets && filtered.length === 0 && (
                <div className="text-center py-12 text-sm text-[var(--text-muted)]">
                  {search ? 'No images match your search' : 'No images found in media library'}
                </div>
              )}

              {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filtered.map((asset) => {
                    const isSelected = value === asset.url;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        className={clsx(
                          'relative rounded-lg border overflow-hidden cursor-pointer transition-all group aspect-square',
                          isSelected
                            ? 'border-[var(--accent)] ring-2 ring-[var(--accent-glow)]'
                            : 'border-[var(--border-glass)] hover:border-[var(--border-glass-focus)]',
                        )}
                        onClick={() => selectAsset(asset)}
                      >
                        <img
                          src={`${asset.url}?width=160&format=webp`}
                          alt={asset.name}
                          className="w-full h-full object-contain p-2 bg-[var(--input-bg)]"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1a1a2e"
                              strokeWidth="3"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white/80 truncate text-center">{asset.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

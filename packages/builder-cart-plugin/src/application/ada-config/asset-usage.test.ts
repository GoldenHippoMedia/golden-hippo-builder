import { describe, expect, it } from 'vitest';
import { buildAssetUsage, normalizeAssetUrl, summarizeAssets } from './asset-usage';
import type { PageEntry } from './ada-page';

const CDN = 'https://cdn.builder.io/api/v1/image/assets/PUB/hash-abc';

const imageBlock = (image: string, altText?: string) => ({
  '@type': '@builder.io/sdk:Element',
  component: { name: 'Image', options: { image, ...(altText !== undefined ? { altText } : {}) } },
});

const page = (id: string, name: string, url: string, blocks: unknown[]): PageEntry =>
  ({ id, name, published: 'published', data: { url, pageType: 'General', blocks } }) as unknown as PageEntry;

describe('normalizeAssetUrl', () => {
  it('strips transform query params and trailing slashes so placements collapse', () => {
    expect(normalizeAssetUrl(`${CDN}?width=400&format=webp`)).toBe(CDN);
    expect(normalizeAssetUrl(`${CDN}/`)).toBe(CDN);
    expect(normalizeAssetUrl(`${CDN}?width=800`)).toBe(normalizeAssetUrl(`${CDN}?width=200`));
  });
});

describe('buildAssetUsage', () => {
  it('groups placements of the same asset across pages despite differing query params', () => {
    const pages = [
      page('p1', 'Home', '/', [imageBlock(`${CDN}?width=400`, 'A dog')]),
      page('p2', 'About', '/about', [imageBlock(`${CDN}?width=800`)]),
    ];
    const usage = buildAssetUsage(pages);
    expect(usage).toHaveLength(1);
    expect(usage[0].placements).toHaveLength(2);
    expect(usage[0].url).toBe(CDN);
  });

  it('detects the reuse caveat: alt on one placement, missing on another', () => {
    const pages = [
      page('p1', 'Home', '/', [imageBlock(`${CDN}?width=400`, 'A happy dog')]),
      page('p2', 'About', '/about', [imageBlock(`${CDN}?width=800`)]),
    ];
    const [asset] = buildAssetUsage(pages);
    expect(asset.hasReusableAlt).toBe(true);
    expect(asset.missingAltCount).toBe(1);
    expect(asset.altsSeen).toEqual(['A happy dog']);
  });

  it('does not mark reusable when the asset has no alt anywhere', () => {
    const pages = [
      page('p1', 'Home', '/', [imageBlock(`${CDN}?width=400`)]),
      page('p2', 'About', '/about', [imageBlock(`${CDN}?width=800`)]),
    ];
    const [asset] = buildAssetUsage(pages);
    expect(asset.hasReusableAlt).toBe(false);
    expect(asset.missingAltCount).toBe(2);
    expect(asset.altsSeen).toEqual([]);
  });

  it('orders distinct alts by frequency, most-used first', () => {
    const pages = [
      page('p1', 'A', '/a', [imageBlock(`${CDN}`, 'rare')]),
      page('p2', 'B', '/b', [imageBlock(`${CDN}`, 'common')]),
      page('p3', 'C', '/c', [imageBlock(`${CDN}`, 'common')]),
    ];
    const [asset] = buildAssetUsage(pages);
    expect(asset.altsSeen).toEqual(['common', 'rare']);
  });

  it('sorts quick-win assets ahead of others', () => {
    const OTHER = 'https://cdn.builder.io/api/v1/image/assets/PUB/other';
    const pages = [
      page('p1', 'A', '/a', [imageBlock(OTHER)]), // all missing, no reuse
      page('p2', 'B', '/b', [imageBlock(`${CDN}`, 'alt')]),
      page('p3', 'C', '/c', [imageBlock(`${CDN}`)]), // quick win
    ];
    const usage = buildAssetUsage(pages);
    expect(usage[0].url).toBe(CDN);
    expect(usage[0].hasReusableAlt).toBe(true);
  });
});

describe('summarizeAssets', () => {
  it('aggregates asset and placement counts', () => {
    const OTHER = 'https://cdn.builder.io/api/v1/image/assets/PUB/other';
    const pages = [
      page('p1', 'A', '/a', [imageBlock(`${CDN}`, 'alt'), imageBlock(OTHER)]),
      page('p2', 'B', '/b', [imageBlock(`${CDN}`)]),
    ];
    const s = summarizeAssets(buildAssetUsage(pages));
    expect(s.totalAssets).toBe(2);
    expect(s.totalPlacements).toBe(3);
    expect(s.placementsMissingAlt).toBe(2);
    expect(s.assetsWithMissingAlt).toBe(2);
    expect(s.reusableAltAssets).toBe(1); // only CDN has alt-on-one, missing-on-other
  });
});

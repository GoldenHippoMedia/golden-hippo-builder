import React from 'react';
import { observer } from 'mobx-react';
import { Section, FormField, HtmlEditor } from '@goldenhippo/builder-ui';
import { SectionProps } from './section-props';

const CookieSection: React.FC<SectionProps> = observer(({ data, markDirty }) => {
  const cookie = data.cookieConfig || {};
  const popup = cookie.popupBanner || {};

  const onPopupChange = (key: string, value: any) => {
    if (!data.cookieConfig) data.cookieConfig = {};
    if (!data.cookieConfig.popupBanner) data.cookieConfig.popupBanner = {};
    data.cookieConfig.popupBanner[key] = value;
    markDirty();
  };

  const onStyleChange = (group: 'bannerStyles' | 'buttonStyles', key: string, value: string) => {
    if (!data.cookieConfig) data.cookieConfig = {};
    if (!data.cookieConfig.popupBanner) data.cookieConfig.popupBanner = {};
    if (!data.cookieConfig.popupBanner[group]) data.cookieConfig.popupBanner[group] = {};
    data.cookieConfig.popupBanner[group][key] = value;
    markDirty();
  };

  return (
    <Section title="Cookie Configuration" subtitle="Settings for the cookie consent popup displayed to visitors">
      <div className="space-y-6">
        <FormField label="Popup Content">
          <HtmlEditor
            value={popup.content ?? ''}
            onChange={(html) => onPopupChange('content', html)}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--text-secondary)]">Banner Styles</h4>
            <FormField label="Background Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={popup.bannerStyles?.backgroundColor ?? '#000000'}
                  onChange={(e) => onStyleChange('bannerStyles', 'backgroundColor', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-[var(--border-glass)] cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  className="hippo-input text-xs flex-1"
                  value={popup.bannerStyles?.backgroundColor ?? ''}
                  onChange={(e) => onStyleChange('bannerStyles', 'backgroundColor', e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Border Radius">
              <input
                type="text"
                className="hippo-input"
                value={popup.bannerStyles?.borderRadius ?? ''}
                onChange={(e) => onStyleChange('bannerStyles', 'borderRadius', e.target.value)}
              />
            </FormField>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--text-secondary)]">Button Styles</h4>
            <FormField label="Background Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={popup.buttonStyles?.backgroundColor ?? '#000000'}
                  onChange={(e) => onStyleChange('buttonStyles', 'backgroundColor', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-[var(--border-glass)] cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  className="hippo-input text-xs flex-1"
                  value={popup.buttonStyles?.backgroundColor ?? ''}
                  onChange={(e) => onStyleChange('buttonStyles', 'backgroundColor', e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Text Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={popup.buttonStyles?.color ?? '#ffffff'}
                  onChange={(e) => onStyleChange('buttonStyles', 'color', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-[var(--border-glass)] cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  className="hippo-input text-xs flex-1"
                  value={popup.buttonStyles?.color ?? ''}
                  onChange={(e) => onStyleChange('buttonStyles', 'color', e.target.value)}
                />
              </div>
            </FormField>
          </div>
        </div>
      </div>
    </Section>
  );
});

export default CookieSection;

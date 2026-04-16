import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Section, FormField, ImagePicker, HtmlEditor } from '@goldenhippo/builder-ui';
import {
  HeaderType,
  BasicHeaderCTAType,
  MediumHeaderDropdownType,
  MediumHeaderDesktopContentType,
} from '@goldenhippo/builder-cart-schemas';
import { SectionProps } from './section-props';

/* ─── shared UI atoms ─── */

const Divider: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3 my-7">
    <div className="flex-1 h-px bg-[var(--border-glass)]" />
    <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">{text}</span>
    <div className="flex-1 h-px bg-[var(--border-glass)]" />
  </div>
);

const AddButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
    onClick={onClick}
  >
    {label}
  </button>
);

const RemoveButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    className="px-2 py-1 rounded text-[11px] font-medium text-[var(--error)] cursor-pointer hover:bg-[var(--error)]/10 transition-colors"
    onClick={onClick}
  >
    Remove
  </button>
);

const CardHeader: React.FC<{ title: string; index: number; onRemove: () => void }> = ({ title, index, onRemove }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold text-[var(--text-secondary)]">
      {title} #{index + 1}
    </span>
    <RemoveButton onClick={onRemove} />
  </div>
);

const CollapsibleSection: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 space-y-4 border-t border-[var(--border-glass)]">{children}</div>}
    </div>
  );
};

const ToggleRow: React.FC<{
  label: string;
  helper?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, helper, checked, onChange }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-[var(--border-glass)] last:border-b-0">
    <div>
      <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
      {helper && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{helper}</div>}
    </div>
    <input type="checkbox" className="hippo-toggle" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </div>
);

const ColorField: React.FC<{
  label: string;
  helper?: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, helper, value, onChange }) => (
  <FormField label={label} helper={helper}>
    <div className="flex items-center gap-2">
      <input
        type="color"
        className="w-9 h-9 rounded-lg border border-[var(--border-glass)] cursor-pointer shrink-0"
        value={value || '#FFFFFF'}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        className="hippo-input text-xs flex-1"
        value={value ?? ''}
        placeholder="#FFFFFF"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </FormField>
);

const TagsField: React.FC<{
  label: string;
  helper?: string;
  value: string[];
  onChange: (v: string[]) => void;
}> = ({ label, helper, value, onChange }) => (
  <FormField label={label} helper={helper ?? 'Comma-separated CSS classes'}>
    <input
      type="text"
      className="hippo-input"
      value={(value || []).join(', ')}
      placeholder="class-one, class-two"
      onChange={(e) =>
        onChange(
          e.target.value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  </FormField>
);

/* ─── BASIC header helpers ─── */

interface BasicLink {
  title?: string;
  href?: string;
  newTab?: boolean;
  cssClasses?: string[];
}

const BasicLinkCard: React.FC<{
  item: BasicLink;
  index: number;
  label: string;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, label, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title={label} index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Title" required>
        <input
          type="text"
          className="hippo-input"
          value={item.title ?? ''}
          onChange={(e) => {
            item.title = e.target.value;
            onChange();
          }}
        />
      </FormField>
      <FormField label="URL" required>
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.href ?? ''}
          onChange={(e) => {
            item.href = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow
        label="Open in New Tab"
        checked={!!item.newTab}
        onChange={(v) => {
          item.newTab = v;
          onChange();
        }}
      />
      <TagsField
        label="CSS Classes"
        helper="Used for VWO targeting"
        value={item.cssClasses || []}
        onChange={(v) => {
          item.cssClasses = v;
          onChange();
        }}
      />
    </div>
  </div>
));

interface BasicAccountLink extends BasicLink {
  icon?: string;
}

const AccountLinkCard: React.FC<{
  item: BasicAccountLink;
  index: number;
  label: string;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, label, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title={label} index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Title" required>
        <input
          type="text"
          className="hippo-input"
          value={item.title ?? ''}
          onChange={(e) => {
            item.title = e.target.value;
            onChange();
          }}
        />
      </FormField>
      <FormField label="URL" required>
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.href ?? ''}
          onChange={(e) => {
            item.href = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
    <FormField label="Icon URL" helper="URL to an icon image for this link">
      <input
        type="text"
        className="hippo-input"
        placeholder="https://..."
        value={item.icon ?? ''}
        onChange={(e) => {
          item.icon = e.target.value;
          onChange();
        }}
      />
    </FormField>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow
        label="Open in New Tab"
        checked={!!item.newTab}
        onChange={(v) => {
          item.newTab = v;
          onChange();
        }}
      />
      <TagsField
        label="CSS Classes"
        helper="Used for VWO targeting"
        value={item.cssClasses || []}
        onChange={(v) => {
          item.cssClasses = v;
          onChange();
        }}
      />
    </div>
  </div>
));

interface BasicCTA {
  title?: string;
  href?: string;
  type?: string;
  newTab?: boolean;
  cssClasses?: string[];
  hideOnMobile?: boolean;
}

const CTACard: React.FC<{
  item: BasicCTA;
  index: number;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title="CTA" index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Title" required>
        <input
          type="text"
          className="hippo-input"
          value={item.title ?? ''}
          onChange={(e) => {
            item.title = e.target.value;
            onChange();
          }}
        />
      </FormField>
      <FormField label="URL" required>
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.href ?? ''}
          onChange={(e) => {
            item.href = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
    <FormField label="CTA Type" required>
      <select
        className="hippo-input"
        value={item.type ?? BasicHeaderCTAType.PRIMARY}
        onChange={(e) => {
          item.type = e.target.value;
          onChange();
        }}
      >
        {Object.values(BasicHeaderCTAType).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </FormField>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow
        label="Open in New Tab"
        checked={!!item.newTab}
        onChange={(v) => {
          item.newTab = v;
          onChange();
        }}
      />
      <ToggleRow
        label="Hide on Mobile"
        helper="Disable this CTA on mobile devices"
        checked={!!item.hideOnMobile}
        onChange={(v) => {
          item.hideOnMobile = v;
          onChange();
        }}
      />
    </div>
    <TagsField
      label="CSS Classes"
      helper="Used for VWO targeting"
      value={item.cssClasses || []}
      onChange={(v) => {
        item.cssClasses = v;
        onChange();
      }}
    />
  </div>
));

/* ─── BASIC Header Config ─── */

const BasicHeaderConfig: React.FC<{ data: Record<string, any>; markDirty: () => void }> = observer(
  ({ data, markDirty }) => {
    const ensureConfig = () => {
      if (!data.header) data.header = {};
      if (!data.header.basicHeaderConfig) data.header.basicHeaderConfig = {};
      return data.header.basicHeaderConfig;
    };
    const config = ensureConfig();

    const ensureArray = (key: string) => {
      const c = ensureConfig();
      if (!Array.isArray(c[key])) c[key] = [];
      return c[key];
    };

    const ensureStickyHeader = () => {
      const c = ensureConfig();
      if (!c.stickyHeader) c.stickyHeader = {};
      return c.stickyHeader;
    };

    return (
      <div className="space-y-6">
        {/* Logo */}
        <ImagePicker
          label="Logo Image"
          value={typeof config.logoImage === 'string' ? config.logoImage : undefined}
          onChange={(url) => {
            ensureConfig().logoImage = url ?? '';
            markDirty();
          }}
        />

        {/* Mobile Links */}
        <Divider text="Mobile Links" />
        <div className="space-y-3">
          {(config.mobileLinks || []).map((item: BasicLink, i: number) => (
            <BasicLinkCard
              key={i}
              item={item}
              index={i}
              label="Mobile Link"
              onChange={markDirty}
              onRemove={() => {
                ensureArray('mobileLinks').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Mobile Link"
            onClick={() => {
              ensureArray('mobileLinks').push({ title: '', href: '', newTab: false, cssClasses: [] });
              markDirty();
            }}
          />
        </div>

        {/* Desktop Links */}
        <Divider text="Desktop Links" />
        <div className="space-y-3">
          {(config.desktopLinks || []).map((item: BasicLink, i: number) => (
            <BasicLinkCard
              key={i}
              item={item}
              index={i}
              label="Desktop Link"
              onChange={markDirty}
              onRemove={() => {
                ensureArray('desktopLinks').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Desktop Link"
            onClick={() => {
              ensureArray('desktopLinks').push({ title: '', href: '', newTab: false, cssClasses: [] });
              markDirty();
            }}
          />
        </div>

        {/* CTAs */}
        <Divider text="Call To Action Buttons" />
        <div className="space-y-3">
          {(config.ctas || []).map((item: BasicCTA, i: number) => (
            <CTACard
              key={i}
              item={item}
              index={i}
              onChange={markDirty}
              onRemove={() => {
                ensureArray('ctas').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add CTA"
            onClick={() => {
              ensureArray('ctas').push({
                title: '',
                href: '',
                type: BasicHeaderCTAType.PRIMARY,
                newTab: false,
                cssClasses: [],
                hideOnMobile: false,
              });
              markDirty();
            }}
          />
        </div>

        {/* MyAccount Guest */}
        <Divider text="MyAccount Links - Guest" />
        <div className="space-y-3">
          {(config.myAccountGuest || []).map((item: BasicAccountLink, i: number) => (
            <AccountLinkCard
              key={i}
              item={item}
              index={i}
              label="Guest Link"
              onChange={markDirty}
              onRemove={() => {
                ensureArray('myAccountGuest').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Guest Link"
            onClick={() => {
              ensureArray('myAccountGuest').push({ title: '', href: '', icon: '', newTab: false, cssClasses: [] });
              markDirty();
            }}
          />
        </div>

        {/* MyAccount Authorized */}
        <Divider text="MyAccount Links - Logged In" />
        <div className="space-y-3">
          {(config.myAccountAuthorized || []).map((item: BasicAccountLink, i: number) => (
            <AccountLinkCard
              key={i}
              item={item}
              index={i}
              label="Authorized Link"
              onChange={markDirty}
              onRemove={() => {
                ensureArray('myAccountAuthorized').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Authorized Link"
            onClick={() => {
              ensureArray('myAccountAuthorized').push({ title: '', href: '', icon: '', newTab: false, cssClasses: [] });
              markDirty();
            }}
          />
        </div>

        {/* Sticky Header */}
        <Divider text="Sticky Header" />
        <CollapsibleSection title="Sticky Header Configuration">
          <ToggleRow
            label="Enabled"
            helper="Enable sticky header behavior on scroll"
            checked={!!ensureStickyHeader().enabled}
            onChange={(v) => {
              ensureStickyHeader().enabled = v;
              markDirty();
            }}
          />
          <ColorField
            label="Background Color"
            helper="Header background color at the top of the page. Leave blank for transparent."
            value={ensureStickyHeader().backgroundColor ?? ''}
            onChange={(v) => {
              ensureStickyHeader().backgroundColor = v;
              markDirty();
            }}
          />
          <ColorField
            label="Scroll Background Color"
            helper="Header background color while scrolling. Leave blank for transparent."
            value={ensureStickyHeader().scrollBackgroundColor ?? '#FFFFFF'}
            onChange={(v) => {
              ensureStickyHeader().scrollBackgroundColor = v;
              markDirty();
            }}
          />
          <ImagePicker
            label="Scroll Logo"
            value={typeof ensureStickyHeader().scrollLogo === 'string' ? ensureStickyHeader().scrollLogo : undefined}
            onChange={(url) => {
              ensureStickyHeader().scrollLogo = url ?? '';
              markDirty();
            }}
          />
        </CollapsibleSection>

        {/* Locale Selection */}
        <Divider text="Locale" />
        <ToggleRow
          label="Show Locale Selection"
          helper="Display locale selection in the header"
          checked={!!config.showLocaleSelection}
          onChange={(v) => {
            ensureConfig().showLocaleSelection = v;
            markDirty();
          }}
        />
      </div>
    );
  },
);

/* ─── MEDIUM header sub-components ─── */

interface MediumDropdownLink {
  itemClasses?: string;
  loggedInOnly?: boolean;
  loggedOutOnly?: boolean;
  text?: string;
  URL?: string;
  subLinksWrapperClasses?: string;
  subLinks?: { text?: string; URL?: string }[];
}

interface MediumDropdownItem {
  type?: string;
  links?: MediumDropdownLink[];
  htmlContent?: string;
  inputs?: {
    defaultHtml?: string;
    temporaryHtml?: string;
    startTime?: string;
    endTime?: string;
  };
}

const MediumDropdownLinkCard: React.FC<{
  item: MediumDropdownLink;
  index: number;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title="Link" index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Link Text (HTML)">
        <HtmlEditor
          value={item.text ?? ''}
          onChange={(html) => {
            item.text = html;
            onChange();
          }}
        />
      </FormField>
      <FormField label="URL">
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.URL ?? ''}
          onChange={(e) => {
            item.URL = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
    <FormField label="Item Classes">
      <input
        type="text"
        className="hippo-input"
        value={item.itemClasses ?? ''}
        onChange={(e) => {
          item.itemClasses = e.target.value;
          onChange();
        }}
      />
    </FormField>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow
        label="Logged In Only"
        checked={!!item.loggedInOnly}
        onChange={(v) => {
          item.loggedInOnly = v;
          onChange();
        }}
      />
      <ToggleRow
        label="Logged Out Only"
        checked={!!item.loggedOutOnly}
        onChange={(v) => {
          item.loggedOutOnly = v;
          onChange();
        }}
      />
    </div>
    <FormField label="Sub Links Wrapper Classes">
      <input
        type="text"
        className="hippo-input"
        value={item.subLinksWrapperClasses ?? ''}
        onChange={(e) => {
          item.subLinksWrapperClasses = e.target.value;
          onChange();
        }}
      />
    </FormField>
    {/* Sub-links */}
    <div className="pl-4 border-l-2 border-[var(--border-glass)] space-y-2 mt-2">
      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Sub-Links</span>
      {(item.subLinks || []).map((sub, si) => (
        <div key={si} className="flex items-center gap-2">
          <input
            type="text"
            className="hippo-input text-xs flex-1"
            placeholder="Text"
            value={sub.text ?? ''}
            onChange={(e) => {
              sub.text = e.target.value;
              onChange();
            }}
          />
          <input
            type="text"
            className="hippo-input text-xs flex-1"
            placeholder="URL"
            value={sub.URL ?? ''}
            onChange={(e) => {
              sub.URL = e.target.value;
              onChange();
            }}
          />
          <RemoveButton
            onClick={() => {
              item.subLinks!.splice(si, 1);
              onChange();
            }}
          />
        </div>
      ))}
      <AddButton
        label="+ Sub-Link"
        onClick={() => {
          if (!item.subLinks) item.subLinks = [];
          item.subLinks.push({ text: '', URL: '' });
          onChange();
        }}
      />
    </div>
  </div>
));

const MediumDropdownItemCard: React.FC<{
  item: MediumDropdownItem;
  index: number;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title="Dropdown Item" index={index} onRemove={onRemove} />
    <FormField label="Dropdown Type">
      <select
        className="hippo-input"
        value={item.type ?? MediumHeaderDropdownType.LINKS}
        onChange={(e) => {
          item.type = e.target.value;
          onChange();
        }}
      >
        {Object.values(MediumHeaderDropdownType).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </FormField>

    {(item.type === MediumHeaderDropdownType.HTML || item.type === MediumHeaderDropdownType.TIMED_HTML) && (
      <FormField label="HTML Content">
        <HtmlEditor
          value={item.htmlContent ?? ''}
          onChange={(html) => {
            item.htmlContent = html;
            onChange();
          }}
        />
      </FormField>
    )}

    {item.type === MediumHeaderDropdownType.TIMED_HTML && (
      <CollapsibleSection title="Timed HTML Inputs">
        <FormField label="Default HTML">
          <HtmlEditor
            value={item.inputs?.defaultHtml ?? ''}
            onChange={(html) => {
              if (!item.inputs) item.inputs = {};
              item.inputs.defaultHtml = html;
              onChange();
            }}
          />
        </FormField>
        <FormField label="Temporary HTML">
          <HtmlEditor
            value={item.inputs?.temporaryHtml ?? ''}
            onChange={(html) => {
              if (!item.inputs) item.inputs = {};
              item.inputs.temporaryHtml = html;
              onChange();
            }}
          />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Start Time">
            <input
              type="datetime-local"
              className="hippo-input"
              value={item.inputs?.startTime ?? ''}
              onChange={(e) => {
                if (!item.inputs) item.inputs = {};
                item.inputs.startTime = e.target.value;
                onChange();
              }}
            />
          </FormField>
          <FormField label="End Time">
            <input
              type="datetime-local"
              className="hippo-input"
              value={item.inputs?.endTime ?? ''}
              onChange={(e) => {
                if (!item.inputs) item.inputs = {};
                item.inputs.endTime = e.target.value;
                onChange();
              }}
            />
          </FormField>
        </div>
      </CollapsibleSection>
    )}

    {(item.type === MediumHeaderDropdownType.LINKS || item.type === MediumHeaderDropdownType.ACCOUNT_LINKS) && (
      <div className="space-y-3">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Links</span>
        {(item.links || []).map((link, li) => (
          <MediumDropdownLinkCard
            key={li}
            item={link}
            index={li}
            onChange={onChange}
            onRemove={() => {
              item.links!.splice(li, 1);
              onChange();
            }}
          />
        ))}
        <AddButton
          label="+ Add Link"
          onClick={() => {
            if (!item.links) item.links = [];
            item.links.push({ text: '', URL: '' });
            onChange();
          }}
        />
      </div>
    )}
  </div>
));

/* Desktop content item for medium header */

interface MediumDesktopLink {
  text?: string;
  URL?: string;
  loggedInOnly?: boolean;
  loggedOutOnly?: boolean;
  dropdownWrapperClasses?: string;
  dropdownItemClasses?: string;
  subLinks?: {
    columnHeaderTitle?: string;
    columnContentType?: string;
    links?: { text?: string; URL?: string }[];
    content?: string;
    inputs?: { defaultHtml?: string; temporaryHtml?: string; startTime?: string; endTime?: string };
  }[];
}

interface MediumDesktopContentItem {
  type?: string;
  wrapperClasses?: string;
  links?: MediumDesktopLink[];
  accountLinksConfig?: { dropdownWrapperClasses?: string; dropdownItemClasses?: string };
  htmlContent?: string;
}

const MediumDesktopLinkCard: React.FC<{
  item: MediumDesktopLink;
  index: number;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title="Link" index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Link Text (HTML)">
        <HtmlEditor
          value={item.text ?? ''}
          onChange={(html) => {
            item.text = html;
            onChange();
          }}
        />
      </FormField>
      <FormField label="URL">
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.URL ?? ''}
          onChange={(e) => {
            item.URL = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow
        label="Logged In Only"
        checked={!!item.loggedInOnly}
        onChange={(v) => {
          item.loggedInOnly = v;
          onChange();
        }}
      />
      <ToggleRow
        label="Logged Out Only"
        checked={!!item.loggedOutOnly}
        onChange={(v) => {
          item.loggedOutOnly = v;
          onChange();
        }}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Dropdown Wrapper Classes">
        <input
          type="text"
          className="hippo-input"
          value={item.dropdownWrapperClasses ?? ''}
          onChange={(e) => {
            item.dropdownWrapperClasses = e.target.value;
            onChange();
          }}
        />
      </FormField>
      <FormField label="Dropdown Item Classes">
        <input
          type="text"
          className="hippo-input"
          value={item.dropdownItemClasses ?? ''}
          onChange={(e) => {
            item.dropdownItemClasses = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
    {/* Sub-links (columns) */}
    <div className="pl-4 border-l-2 border-[var(--border-glass)] space-y-3 mt-2">
      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
        Sub-Links / Columns
      </span>
      {(item.subLinks || []).map((col, ci) => (
        <div key={ci} className="rounded-lg border border-[var(--border-glass)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Column #{ci + 1}</span>
            <RemoveButton
              onClick={() => {
                item.subLinks!.splice(ci, 1);
                onChange();
              }}
            />
          </div>
          <FormField label="Column Header">
            <input
              type="text"
              className="hippo-input"
              value={col.columnHeaderTitle ?? ''}
              onChange={(e) => {
                col.columnHeaderTitle = e.target.value;
                onChange();
              }}
            />
          </FormField>
          <FormField label="Content Type">
            <select
              className="hippo-input"
              value={col.columnContentType ?? 'links'}
              onChange={(e) => {
                col.columnContentType = e.target.value;
                onChange();
              }}
            >
              <option value="links">links</option>
              <option value="html">html</option>
              <option value="timedHtml">timedHtml</option>
            </select>
          </FormField>
          {col.columnContentType === 'links' && (
            <div className="space-y-1">
              {(col.links || []).map((sl, sli) => (
                <div key={sli} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="hippo-input text-xs flex-1"
                    placeholder="Text"
                    value={sl.text ?? ''}
                    onChange={(e) => {
                      sl.text = e.target.value;
                      onChange();
                    }}
                  />
                  <input
                    type="text"
                    className="hippo-input text-xs flex-1"
                    placeholder="URL"
                    value={sl.URL ?? ''}
                    onChange={(e) => {
                      sl.URL = e.target.value;
                      onChange();
                    }}
                  />
                  <RemoveButton
                    onClick={() => {
                      col.links!.splice(sli, 1);
                      onChange();
                    }}
                  />
                </div>
              ))}
              <AddButton
                label="+ Link"
                onClick={() => {
                  if (!col.links) col.links = [];
                  col.links.push({ text: '', URL: '' });
                  onChange();
                }}
              />
            </div>
          )}
          {col.columnContentType === 'html' && (
            <FormField label="HTML Content">
              <HtmlEditor
                value={col.content ?? ''}
                onChange={(html) => {
                  col.content = html;
                  onChange();
                }}
              />
            </FormField>
          )}
          {col.columnContentType === 'timedHtml' && (
            <div className="space-y-2">
              <FormField label="Default HTML">
                <HtmlEditor
                  value={col.inputs?.defaultHtml ?? ''}
                  onChange={(html) => {
                    if (!col.inputs) col.inputs = {};
                    col.inputs.defaultHtml = html;
                    onChange();
                  }}
                />
              </FormField>
              <FormField label="Temporary HTML">
                <HtmlEditor
                  value={col.inputs?.temporaryHtml ?? ''}
                  onChange={(html) => {
                    if (!col.inputs) col.inputs = {};
                    col.inputs.temporaryHtml = html;
                    onChange();
                  }}
                />
              </FormField>
            </div>
          )}
        </div>
      ))}
      <AddButton
        label="+ Add Column"
        onClick={() => {
          if (!item.subLinks) item.subLinks = [];
          item.subLinks.push({ columnHeaderTitle: '', columnContentType: 'links', links: [] });
          onChange();
        }}
      />
    </div>
  </div>
));

const MediumDesktopContentCard: React.FC<{
  item: MediumDesktopContentItem;
  index: number;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title="Content Block" index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Content Type">
        <select
          className="hippo-input"
          value={item.type ?? MediumHeaderDesktopContentType.LINKS}
          onChange={(e) => {
            item.type = e.target.value;
            onChange();
          }}
        >
          {Object.values(MediumHeaderDesktopContentType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Wrapper Classes">
        <input
          type="text"
          className="hippo-input"
          value={item.wrapperClasses ?? ''}
          onChange={(e) => {
            item.wrapperClasses = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>

    {item.type === MediumHeaderDesktopContentType.HTML && (
      <FormField label="HTML Content">
        <HtmlEditor
          value={item.htmlContent ?? ''}
          onChange={(html) => {
            item.htmlContent = html;
            onChange();
          }}
        />
      </FormField>
    )}

    {item.type === MediumHeaderDesktopContentType.ACCOUNT_LINKS && (
      <CollapsibleSection title="Account Links Config">
        <FormField label="Dropdown Wrapper Classes">
          <input
            type="text"
            className="hippo-input"
            value={item.accountLinksConfig?.dropdownWrapperClasses ?? ''}
            onChange={(e) => {
              if (!item.accountLinksConfig) item.accountLinksConfig = {};
              item.accountLinksConfig.dropdownWrapperClasses = e.target.value;
              onChange();
            }}
          />
        </FormField>
        <FormField label="Dropdown Item Classes">
          <input
            type="text"
            className="hippo-input"
            value={item.accountLinksConfig?.dropdownItemClasses ?? ''}
            onChange={(e) => {
              if (!item.accountLinksConfig) item.accountLinksConfig = {};
              item.accountLinksConfig.dropdownItemClasses = e.target.value;
              onChange();
            }}
          />
        </FormField>
      </CollapsibleSection>
    )}

    {item.type === MediumHeaderDesktopContentType.LINKS && (
      <div className="space-y-3">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Links</span>
        {(item.links || []).map((link, li) => (
          <MediumDesktopLinkCard
            key={li}
            item={link}
            index={li}
            onChange={onChange}
            onRemove={() => {
              item.links!.splice(li, 1);
              onChange();
            }}
          />
        ))}
        <AddButton
          label="+ Add Link"
          onClick={() => {
            if (!item.links) item.links = [];
            item.links.push({ text: '', URL: '' });
            onChange();
          }}
        />
      </div>
    )}
  </div>
));

/* ─── MEDIUM Header Config ─── */

const MediumHeaderConfig: React.FC<{ data: Record<string, any>; markDirty: () => void }> = observer(
  ({ data, markDirty }) => {
    const ensureConfig = () => {
      if (!data.header) data.header = {};
      if (!data.header.mediumHeaderConfig) data.header.mediumHeaderConfig = {};
      return data.header.mediumHeaderConfig;
    };
    const config = ensureConfig();

    const ensureMobileMenu = () => {
      const c = ensureConfig();
      if (!c.mobileMenu) c.mobileMenu = {};
      return c.mobileMenu;
    };

    const ensureDesktopMenu = () => {
      const c = ensureConfig();
      if (!c.desktopMenu) c.desktopMenu = {};
      return c.desktopMenu;
    };

    const ensureArray = (parent: Record<string, any>, key: string) => {
      if (!Array.isArray(parent[key])) parent[key] = [];
      return parent[key];
    };

    return (
      <div className="space-y-6">
        {/* Wrapper ID & Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Wrapper ID" helper="ID for the medium header wrapper">
            <input
              type="text"
              className="hippo-input"
              value={config.wrapperID ?? 'header'}
              onChange={(e) => {
                ensureConfig().wrapperID = e.target.value;
                markDirty();
              }}
            />
          </FormField>
          <FormField label="Wrapper Classes" helper="CSS classes for the medium header wrapper">
            <input
              type="text"
              className="hippo-input"
              value={config.wrapperClasses ?? ''}
              onChange={(e) => {
                ensureConfig().wrapperClasses = e.target.value;
                markDirty();
              }}
            />
          </FormField>
        </div>

        <ToggleRow
          label="Show Shipping Message"
          helper="Display the free shipping message on the header"
          checked={!!config.showShippingMessage}
          onChange={(v) => {
            ensureConfig().showShippingMessage = v;
            markDirty();
          }}
        />

        {/* Mobile Menu */}
        <Divider text="Mobile Menu" />
        <CollapsibleSection title="Mobile Menu Configuration">
          <ImagePicker
            label="Mobile Logo"
            value={typeof ensureMobileMenu().logo === 'string' ? ensureMobileMenu().logo : undefined}
            onChange={(url) => {
              ensureMobileMenu().logo = url ?? '';
              markDirty();
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField label="Logo Classes">
              <input
                type="text"
                className="hippo-input"
                value={ensureMobileMenu().logoClasses ?? ''}
                onChange={(e) => {
                  ensureMobileMenu().logoClasses = e.target.value;
                  markDirty();
                }}
              />
            </FormField>
            <FormField label="Nav Classes">
              <input
                type="text"
                className="hippo-input"
                value={ensureMobileMenu().navClasses ?? ''}
                onChange={(e) => {
                  ensureMobileMenu().navClasses = e.target.value;
                  markDirty();
                }}
              />
            </FormField>
            <FormField label="Dropdown Wrapper Classes">
              <input
                type="text"
                className="hippo-input"
                value={ensureMobileMenu().dropDownWrapperClasses ?? ''}
                onChange={(e) => {
                  ensureMobileMenu().dropDownWrapperClasses = e.target.value;
                  markDirty();
                }}
              />
            </FormField>
          </div>

          {/* Dropdown Content */}
          <Divider text="Dropdown Content" />
          <div className="space-y-3">
            {(ensureMobileMenu().dropDownContent || []).map((item: MediumDropdownItem, i: number) => (
              <MediumDropdownItemCard
                key={i}
                item={item}
                index={i}
                onChange={markDirty}
                onRemove={() => {
                  ensureArray(ensureMobileMenu(), 'dropDownContent').splice(i, 1);
                  markDirty();
                }}
              />
            ))}
            <AddButton
              label="+ Add Dropdown Item"
              onClick={() => {
                ensureArray(ensureMobileMenu(), 'dropDownContent').push({
                  type: MediumHeaderDropdownType.LINKS,
                  links: [],
                });
                markDirty();
              }}
            />
          </div>
        </CollapsibleSection>

        {/* Desktop Menu */}
        <Divider text="Desktop Menu" />
        <CollapsibleSection title="Desktop Menu Configuration">
          <ImagePicker
            label="Desktop Logo"
            value={typeof ensureDesktopMenu().logo === 'string' ? ensureDesktopMenu().logo : undefined}
            onChange={(url) => {
              ensureDesktopMenu().logo = url ?? '';
              markDirty();
            }}
          />
          <FormField label="Nav Classes">
            <input
              type="text"
              className="hippo-input"
              value={ensureDesktopMenu().navClasses ?? ''}
              onChange={(e) => {
                ensureDesktopMenu().navClasses = e.target.value;
                markDirty();
              }}
            />
          </FormField>

          {/* Desktop Content */}
          <Divider text="Content Blocks" />
          <div className="space-y-3">
            {(ensureDesktopMenu().content || []).map((item: MediumDesktopContentItem, i: number) => (
              <MediumDesktopContentCard
                key={i}
                item={item}
                index={i}
                onChange={markDirty}
                onRemove={() => {
                  ensureArray(ensureDesktopMenu(), 'content').splice(i, 1);
                  markDirty();
                }}
              />
            ))}
            <AddButton
              label="+ Add Content Block"
              onClick={() => {
                ensureArray(ensureDesktopMenu(), 'content').push({
                  type: MediumHeaderDesktopContentType.LINKS,
                  links: [],
                });
                markDirty();
              }}
            />
          </div>
        </CollapsibleSection>

        {/* Banners Above Header */}
        <Divider text="Banners Above Header" />
        <div className="space-y-3">
          {(config.bannersAboveHeader || []).map(
            (banner: { wrapperClasses?: string; content?: string }, i: number) => (
              <div key={i} className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
                <CardHeader
                  title="Banner"
                  index={i}
                  onRemove={() => {
                    ensureArray(ensureConfig(), 'bannersAboveHeader').splice(i, 1);
                    markDirty();
                  }}
                />
                <FormField label="Wrapper Classes">
                  <input
                    type="text"
                    className="hippo-input"
                    value={banner.wrapperClasses ?? ''}
                    onChange={(e) => {
                      banner.wrapperClasses = e.target.value;
                      markDirty();
                    }}
                  />
                </FormField>
                <FormField label="Banner Content (HTML)">
                  <HtmlEditor
                    value={banner.content ?? ''}
                    onChange={(html) => {
                      banner.content = html;
                      markDirty();
                    }}
                  />
                </FormField>
              </div>
            ),
          )}
          <AddButton
            label="+ Add Banner"
            onClick={() => {
              ensureArray(ensureConfig(), 'bannersAboveHeader').push({ wrapperClasses: '', content: '' });
              markDirty();
            }}
          />
        </div>

        {/* Contact URL */}
        <Divider text="Contact" />
        <FormField label="Contact URL" helper="URL for the contact page">
          <input
            type="text"
            className="hippo-input"
            placeholder="https://..."
            value={config.contactUrl ?? ''}
            onChange={(e) => {
              ensureConfig().contactUrl = e.target.value;
              markDirty();
            }}
          />
        </FormField>
      </div>
    );
  },
);

/* ─── MEGA header sub-components ─── */

interface MegaMobileLink {
  title?: string;
  href?: string;
  expanded?: boolean;
  links?: { title?: string; href?: string }[];
}

const MegaMobileLinkCard: React.FC<{
  item: MegaMobileLink;
  index: number;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title="Mobile Link" index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Title">
        <input
          type="text"
          className="hippo-input"
          value={item.title ?? ''}
          onChange={(e) => {
            item.title = e.target.value;
            onChange();
          }}
        />
      </FormField>
      <FormField label="URL">
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.href ?? ''}
          onChange={(e) => {
            item.href = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
    <ToggleRow
      label="Expanded by Default"
      helper="Show sub-links expanded on load"
      checked={!!item.expanded}
      onChange={(v) => {
        item.expanded = v;
        onChange();
      }}
    />
    {/* Sub-links */}
    <div className="pl-4 border-l-2 border-[var(--border-glass)] space-y-2 mt-2">
      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Sub-Links</span>
      {(item.links || []).map((sub, si) => (
        <div key={si} className="flex items-center gap-2">
          <input
            type="text"
            className="hippo-input text-xs flex-1"
            placeholder="Title"
            value={sub.title ?? ''}
            onChange={(e) => {
              sub.title = e.target.value;
              onChange();
            }}
          />
          <input
            type="text"
            className="hippo-input text-xs flex-1"
            placeholder="URL"
            value={sub.href ?? ''}
            onChange={(e) => {
              sub.href = e.target.value;
              onChange();
            }}
          />
          <RemoveButton
            onClick={() => {
              item.links!.splice(si, 1);
              onChange();
            }}
          />
        </div>
      ))}
      <AddButton
        label="+ Sub-Link"
        onClick={() => {
          if (!item.links) item.links = [];
          item.links.push({ title: '', href: '' });
          onChange();
        }}
      />
    </div>
  </div>
));

interface MegaDesktopNavGroup {
  title?: string;
  links?: { title?: string; href?: string }[];
  shopAllLink?: { title?: string; href?: string };
}

const MegaDesktopNavGroupCard: React.FC<{
  item: MegaDesktopNavGroup;
  index: number;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title="Nav Group" index={index} onRemove={onRemove} />
    <FormField label="Group Title" required>
      <input
        type="text"
        className="hippo-input"
        value={item.title ?? ''}
        onChange={(e) => {
          item.title = e.target.value;
          onChange();
        }}
      />
    </FormField>

    {/* Links */}
    <div className="pl-4 border-l-2 border-[var(--border-glass)] space-y-2 mt-2">
      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Links</span>
      {(item.links || []).map((link, li) => (
        <div key={li} className="flex items-center gap-2">
          <input
            type="text"
            className="hippo-input text-xs flex-1"
            placeholder="Title"
            value={link.title ?? ''}
            onChange={(e) => {
              link.title = e.target.value;
              onChange();
            }}
          />
          <input
            type="text"
            className="hippo-input text-xs flex-1"
            placeholder="URL"
            value={link.href ?? ''}
            onChange={(e) => {
              link.href = e.target.value;
              onChange();
            }}
          />
          <RemoveButton
            onClick={() => {
              item.links!.splice(li, 1);
              onChange();
            }}
          />
        </div>
      ))}
      <AddButton
        label="+ Link"
        onClick={() => {
          if (!item.links) item.links = [];
          item.links.push({ title: '', href: '' });
          onChange();
        }}
      />
    </div>

    {/* Shop All Link */}
    <Divider text="Shop All Link" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Shop All Title">
        <input
          type="text"
          className="hippo-input"
          value={item.shopAllLink?.title ?? ''}
          onChange={(e) => {
            if (!item.shopAllLink) item.shopAllLink = { title: '', href: '' };
            item.shopAllLink.title = e.target.value;
            onChange();
          }}
        />
      </FormField>
      <FormField label="Shop All URL" required>
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.shopAllLink?.href ?? ''}
          onChange={(e) => {
            if (!item.shopAllLink) item.shopAllLink = { title: '', href: '' };
            item.shopAllLink.href = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
  </div>
));

/* ─── MEGA Header Config ─── */

const MegaHeaderConfig: React.FC<{ data: Record<string, any>; markDirty: () => void }> = observer(
  ({ data, markDirty }) => {
    const ensureConfig = () => {
      if (!data.header) data.header = {};
      if (!data.header.megaMenuConfig) data.header.megaMenuConfig = {};
      return data.header.megaMenuConfig;
    };
    const config = ensureConfig();

    const ensureArray = (key: string) => {
      const c = ensureConfig();
      if (!Array.isArray(c[key])) c[key] = [];
      return c[key];
    };

    return (
      <div className="space-y-6">
        <ToggleRow
          label="Show Shipping Message"
          helper="Display the free shipping message on the mega menu"
          checked={!!config.showShippingMessage}
          onChange={(v) => {
            ensureConfig().showShippingMessage = v;
            markDirty();
          }}
        />

        {/* Mobile Links */}
        <Divider text="Mobile Links" />
        <div className="space-y-3">
          {(config.mobileLinks || []).map((item: MegaMobileLink, i: number) => (
            <MegaMobileLinkCard
              key={i}
              item={item}
              index={i}
              onChange={markDirty}
              onRemove={() => {
                ensureArray('mobileLinks').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Mobile Link"
            onClick={() => {
              ensureArray('mobileLinks').push({ title: '', href: '', expanded: false, links: [] });
              markDirty();
            }}
          />
        </div>

        {/* Desktop Shop Nav Links */}
        <Divider text="Desktop Shop Navigation" />
        <div className="space-y-3">
          {(config.desktopShopNavLinks || []).map((item: MegaDesktopNavGroup, i: number) => (
            <MegaDesktopNavGroupCard
              key={i}
              item={item}
              index={i}
              onChange={markDirty}
              onRemove={() => {
                ensureArray('desktopShopNavLinks').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Nav Group"
            onClick={() => {
              ensureArray('desktopShopNavLinks').push({ title: '', links: [], shopAllLink: { title: '', href: '' } });
              markDirty();
            }}
          />
        </div>
      </div>
    );
  },
);

/* ─── DMP Header Config ─── */

interface DmpLink {
  title?: string;
  href?: string;
}

const DmpLinkCard: React.FC<{
  item: DmpLink;
  index: number;
  label: string;
  onChange: () => void;
  onRemove: () => void;
}> = observer(({ item, index, label, onChange, onRemove }) => (
  <div className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
    <CardHeader title={label} index={index} onRemove={onRemove} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormField label="Title">
        <input
          type="text"
          className="hippo-input"
          value={item.title ?? ''}
          onChange={(e) => {
            item.title = e.target.value;
            onChange();
          }}
        />
      </FormField>
      <FormField label="URL">
        <input
          type="text"
          className="hippo-input"
          placeholder="https://..."
          value={item.href ?? ''}
          onChange={(e) => {
            item.href = e.target.value;
            onChange();
          }}
        />
      </FormField>
    </div>
  </div>
));

const DmpHeaderConfig: React.FC<{ data: Record<string, any>; markDirty: () => void }> = observer(
  ({ data, markDirty }) => {
    const ensureConfig = () => {
      if (!data.header) data.header = {};
      if (!data.header.dmpHeaderConfig) data.header.dmpHeaderConfig = {};
      return data.header.dmpHeaderConfig;
    };
    const config = ensureConfig();

    const ensureArray = (key: string) => {
      const c = ensureConfig();
      if (!Array.isArray(c[key])) c[key] = [];
      return c[key];
    };

    return (
      <div className="space-y-6">
        <ImagePicker
          label="Logo Image"
          value={typeof config.logoImage === 'string' ? config.logoImage : undefined}
          onChange={(url) => {
            ensureConfig().logoImage = url ?? '';
            markDirty();
          }}
        />

        {/* Mobile Links */}
        <Divider text="Mobile Links" />
        <div className="space-y-3">
          {(config.mobileLinks || []).map((item: DmpLink, i: number) => (
            <DmpLinkCard
              key={i}
              item={item}
              index={i}
              label="Mobile Link"
              onChange={markDirty}
              onRemove={() => {
                ensureArray('mobileLinks').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Mobile Link"
            onClick={() => {
              ensureArray('mobileLinks').push({ title: '', href: '' });
              markDirty();
            }}
          />
        </div>

        {/* Desktop Links */}
        <Divider text="Desktop Links" />
        <div className="space-y-3">
          {(config.desktopLinks || []).map((item: DmpLink, i: number) => (
            <DmpLinkCard
              key={i}
              item={item}
              index={i}
              label="Desktop Link"
              onChange={markDirty}
              onRemove={() => {
                ensureArray('desktopLinks').splice(i, 1);
                markDirty();
              }}
            />
          ))}
          <AddButton
            label="+ Add Desktop Link"
            onClick={() => {
              ensureArray('desktopLinks').push({ title: '', href: '' });
              markDirty();
            }}
          />
        </div>
      </div>
    );
  },
);

/* ─── Main Header Section ─── */

const HeaderSection: React.FC<SectionProps> = observer(({ data, onChange, markDirty }) => {
  const header = data.header || {};

  return (
    <Section title="Header" subtitle="Header layout and navigation settings">
      <div className="space-y-4">
        <FormField label="Header Type" helper="Select the type of header to use">
          <select
            className="hippo-input"
            value={header.headerType ?? 'MEDIUM'}
            onChange={(e) => onChange('header', 'headerType', e.target.value)}
          >
            {Object.values(HeaderType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

        {header.headerType === HeaderType.BASIC && <BasicHeaderConfig data={data} markDirty={markDirty} />}

        {header.headerType === HeaderType.MEDIUM && <MediumHeaderConfig data={data} markDirty={markDirty} />}

        {header.headerType === HeaderType.MEGA && <MegaHeaderConfig data={data} markDirty={markDirty} />}

        {header.headerType === HeaderType.DMP && <DmpHeaderConfig data={data} markDirty={markDirty} />}

        {(header.headerType === HeaderType.LINKLESS || header.headerType === HeaderType.NONE) && (
          <div className="rounded-xl border border-dashed border-[var(--border-glass)] p-5 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No additional configuration needed for the {header.headerType} header type.
            </p>
          </div>
        )}
      </div>
    </Section>
  );
});

export default HeaderSection;

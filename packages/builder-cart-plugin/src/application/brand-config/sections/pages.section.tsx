import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { FormField } from '@goldenhippo/builder-ui';
import { SectionProps } from './section-props';

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ToggleField: React.FC<{ label: string; helper?: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  helper,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between py-3.5 border-b border-[var(--border-glass)] last:border-b-0">
    <div>
      <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
      {helper && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{helper}</div>}
    </div>
    <input type="checkbox" className="hippo-toggle" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </div>
);

const ColorField: React.FC<{ label: string; value: string; fallback: string; onChange: (v: string) => void }> = ({
  label,
  value,
  fallback,
  onChange,
}) => (
  <FormField label={label}>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || fallback}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg border border-[var(--border-glass)] cursor-pointer shrink-0"
      />
      <input
        type="text"
        className="hippo-input text-xs flex-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </FormField>
);

const PagesSection: React.FC<SectionProps> = observer(({ data, markDirty }) => {
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set());
  const pageConfig = data.pageConfig || {};

  const togglePanel = (id: string) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setNested = (path: string[], value: any) => {
    if (!data.pageConfig) data.pageConfig = {};
    let obj: any = data.pageConfig;
    for (let i = 0; i < path.length - 1; i++) {
      if (!obj[path[i]]) obj[path[i]] = {};
      obj = obj[path[i]];
    }
    obj[path[path.length - 1]] = value;
    markDirty();
  };

  const cart = pageConfig.cart || {};
  const checkout = pageConfig.checkout || {};
  const orderDetails = pageConfig.orderDetails || {};
  const resetPassword = pageConfig.resetPassword || {};
  const subscriptionEdit = pageConfig.subscriptionEdit || {};
  const upsell = pageConfig.upsell || {};

  return (
    <div className="space-y-2">
      {/* Cart Page */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('cart')}
        >
          <span>Cart Page</span>
          <ChevronIcon open={openPanels.has('cart')} />
        </button>
        {openPanels.has('cart') && (
          <div className="p-5 pt-0 space-y-5">
            <FormField label="Continue Shopping URL">
              <input
                type="text"
                className="hippo-input"
                value={cart.continueShoppingUrl ?? ''}
                onChange={(e) => setNested(['cart', 'continueShoppingUrl'], e.target.value)}
              />
            </FormField>
            <ColorField
              label="Image Container Background Color"
              value={cart.imageContainerBGColor ?? ''}
              fallback="#ffffff"
              onChange={(v) => setNested(['cart', 'imageContainerBGColor'], v)}
            />
            <ToggleField
              label="Show Free Shipping Banner"
              checked={!!cart.freeShippingBanner?.isVisible}
              onChange={(v) => setNested(['cart', 'freeShippingBanner', 'isVisible'], v)}
            />
            <ToggleField
              label="Show Secure Payment Notice"
              checked={!!cart.notices?.securePaymentNotice?.isVisible}
              onChange={(v) => setNested(['cart', 'notices', 'securePaymentNotice', 'isVisible'], v)}
            />
          </div>
        )}
      </div>

      {/* Checkout Page */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('checkout')}
        >
          <span>Checkout Page</span>
          <ChevronIcon open={openPanels.has('checkout')} />
        </button>
        {openPanels.has('checkout') && (
          <div className="p-5 pt-0 space-y-5">
            <ToggleField
              label="Show Free Shipping Banner"
              checked={!!checkout.freeShippingBanner?.isVisible}
              onChange={(v) => setNested(['checkout', 'freeShippingBanner', 'isVisible'], v)}
            />
            <ToggleField
              label="Show Secure Payment Notice"
              checked={!!checkout.securePaymentNotice?.isVisible}
              onChange={(v) => setNested(['checkout', 'securePaymentNotice', 'isVisible'], v)}
            />
            <ToggleField
              label="Show Auto Sign-Up"
              checked={!!checkout.autoSignUp?.isVisible}
              onChange={(v) => setNested(['checkout', 'autoSignUp', 'isVisible'], v)}
            />
            <ToggleField
              label="Auto Sign-Up Checked by Default"
              checked={!!checkout.autoSignUp?.isChecked}
              onChange={(v) => setNested(['checkout', 'autoSignUp', 'isChecked'], v)}
            />
            <ToggleField
              label="Show SMS Opt-In"
              checked={!!checkout.smsOptIn?.isVisible}
              onChange={(v) => setNested(['checkout', 'smsOptIn', 'isVisible'], v)}
            />
            <FormField label="SMS Opt-In Title">
              <input
                type="text"
                className="hippo-input"
                value={checkout.smsOptIn?.title ?? ''}
                onChange={(e) => setNested(['checkout', 'smsOptIn', 'title'], e.target.value)}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Order Details Page */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('orderDetails')}
        >
          <span>Order Details Page</span>
          <ChevronIcon open={openPanels.has('orderDetails')} />
        </button>
        {openPanels.has('orderDetails') && (
          <div className="p-5 pt-0 space-y-5">
            <FormField label="Title (HTML)">
              <textarea
                className="hippo-input"
                rows={2}
                value={orderDetails.title ?? ''}
                onChange={(e) => setNested(['orderDetails', 'title'], e.target.value)}
              />
            </FormField>
            <ColorField
              label="Table Header Background Color"
              value={orderDetails.tableHeaderStyle?.backgroundColor ?? ''}
              fallback="#000000"
              onChange={(v) => setNested(['orderDetails', 'tableHeaderStyle', 'backgroundColor'], v)}
            />
            <ColorField
              label="Table Header Text Color"
              value={orderDetails.tableHeaderStyle?.color ?? ''}
              fallback="#ffffff"
              onChange={(v) => setNested(['orderDetails', 'tableHeaderStyle', 'color'], v)}
            />
          </div>
        )}
      </div>

      {/* Reset Password Page */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('resetPassword')}
        >
          <span>Reset Password Page</span>
          <ChevronIcon open={openPanels.has('resetPassword')} />
        </button>
        {openPanels.has('resetPassword') && (
          <div className="p-5 pt-0 space-y-5">
            <FormField label="Page Title (HTML)">
              <textarea
                className="hippo-input"
                rows={2}
                value={resetPassword.title ?? ''}
                onChange={(e) => setNested(['resetPassword', 'title'], e.target.value)}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Subscription Cancel Page */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('subscriptionCancel')}
        >
          <span>Subscription Cancellation Page</span>
          <ChevronIcon open={openPanels.has('subscriptionCancel')} />
        </button>
        {openPanels.has('subscriptionCancel') && (
          <div className="p-5 pt-0 space-y-5">
            <FormField label="Cancel Text (HTML)" helper="Text displayed on the subscription cancellation page">
              <textarea
                className="hippo-input"
                rows={3}
                value={pageConfig.subscriptionCancel?.cancelText ?? ''}
                onChange={(e) => setNested(['subscriptionCancel', 'cancelText'], e.target.value)}
              />
            </FormField>
            <div className="rounded-xl border border-dashed border-[var(--border-glass)] p-5 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Cancel reasons and their button configurations are complex list structures best managed through
                Builder.io's native content editor. Full support here is coming in a future update.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Edit */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('subscriptionEdit')}
        >
          <span>Subscription Edit</span>
          <ChevronIcon open={openPanels.has('subscriptionEdit')} />
        </button>
        {openPanels.has('subscriptionEdit') && (
          <div className="p-5 pt-0 space-y-5">
            <FormField label="Subscription Item Default Image" helper="Default image for subscription items">
              <div className="flex items-center gap-3">
                {typeof subscriptionEdit.subscriptionItemDefaultImage === 'string' &&
                  subscriptionEdit.subscriptionItemDefaultImage && (
                    <img
                      src={subscriptionEdit.subscriptionItemDefaultImage}
                      alt="Default subscription item"
                      className="w-9 h-9 rounded-lg border border-[var(--border-glass)] cursor-pointer shrink-0"
                    />
                  )}
                <input
                  type="text"
                  className="hippo-input text-xs flex-1"
                  placeholder="Image URL"
                  value={subscriptionEdit.subscriptionItemDefaultImage ?? ''}
                  onChange={(e) => setNested(['subscriptionEdit', 'subscriptionItemDefaultImage'], e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Ship Now Modal Headline (HTML)">
              <textarea
                className="hippo-input"
                rows={2}
                value={subscriptionEdit.shipNow?.modalHeadlineContent ?? ''}
                onChange={(e) => setNested(['subscriptionEdit', 'shipNow', 'modalHeadlineContent'], e.target.value)}
              />
            </FormField>
            <FormField label="Ship Now Modal Content (HTML)" helper="Use $FREQUENCY for the subscription frequency">
              <textarea
                className="hippo-input"
                rows={3}
                value={subscriptionEdit.shipNow?.modalContent ?? ''}
                onChange={(e) => setNested(['subscriptionEdit', 'shipNow', 'modalContent'], e.target.value)}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Upsell Page */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('upsell')}
        >
          <span>Upsell Page</span>
          <ChevronIcon open={openPanels.has('upsell')} />
        </button>
        {openPanels.has('upsell') && (
          <div className="p-5 pt-0 space-y-5">
            <FormField label="Money Back Guarantee Image">
              <div className="flex items-center gap-3">
                {typeof upsell.mbgImage === 'string' && upsell.mbgImage && (
                  <img
                    src={upsell.mbgImage}
                    alt="MBG"
                    className="w-9 h-9 rounded-lg border border-[var(--border-glass)] cursor-pointer shrink-0"
                  />
                )}
                <input
                  type="text"
                  className="hippo-input text-xs flex-1"
                  placeholder="Image URL"
                  value={upsell.mbgImage ?? ''}
                  onChange={(e) => setNested(['upsell', 'mbgImage'], e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Money Back Guarantee Text (HTML)">
              <textarea
                className="hippo-input"
                rows={3}
                value={upsell.mbgText ?? ''}
                onChange={(e) => setNested(['upsell', 'mbgText'], e.target.value)}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Account Details */}
      <div className="rounded-xl border border-[var(--border-glass)] overflow-hidden mb-2">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
          onClick={() => togglePanel('accountDetails')}
        >
          <span>Account Details Page</span>
          <ChevronIcon open={openPanels.has('accountDetails')} />
        </button>
        {openPanels.has('accountDetails') && (
          <div className="p-5 pt-0 space-y-5">
            <div className="rounded-xl border border-dashed border-[var(--border-glass)] p-5 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Birthday banner configuration with HTML content and inline styles is best managed through Builder.io's
                native content editor. Full support here is coming in a future update.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PagesSection;

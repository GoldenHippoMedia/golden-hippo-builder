import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { FormField, HtmlEditor } from '@goldenhippo/builder-ui';
import { SubscriptionCancelReasons, SubscriptionCancelButtonType } from '@goldenhippo/builder-cart-schemas';
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

  const accountDetails = pageConfig.accountDetails || {};
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

            {/* Free Shipping Banner */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Free Shipping Banner
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
            <ToggleField
              label="Show Free Shipping Banner"
              checked={!!cart.freeShippingBanner?.isVisible}
              onChange={(v) => setNested(['cart', 'freeShippingBanner', 'isVisible'], v)}
            />
            <FormField label="Logged Out Banner Content">
              <HtmlEditor
                value={cart.freeShippingBanner?.loggedOutBannerContent ?? ''}
                onChange={(html) => setNested(['cart', 'freeShippingBanner', 'loggedOutBannerContent'], html)}
              />
            </FormField>
            <FormField label="Logged In Banner Content">
              <HtmlEditor
                value={cart.freeShippingBanner?.loggedInBannerContent ?? ''}
                onChange={(html) => setNested(['cart', 'freeShippingBanner', 'loggedInBannerContent'], html)}
              />
            </FormField>
            <ColorField
              label="Banner Background Color"
              value={cart.freeShippingBanner?.styles?.backgroundColor ?? ''}
              fallback="#000000"
              onChange={(v) => setNested(['cart', 'freeShippingBanner', 'styles', 'backgroundColor'], v)}
            />
            <ColorField
              label="Banner Text Color"
              value={cart.freeShippingBanner?.styles?.color ?? ''}
              fallback="#ffffff"
              onChange={(v) => setNested(['cart', 'freeShippingBanner', 'styles', 'color'], v)}
            />

            {/* Secure Payment Notice */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Secure Payment Notice
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
            <ToggleField
              label="Show Secure Payment Notice"
              checked={!!cart.notices?.securePaymentNotice?.isVisible}
              onChange={(v) => setNested(['cart', 'notices', 'securePaymentNotice', 'isVisible'], v)}
            />
            <FormField label="Secure Payment Notice Content">
              <HtmlEditor
                value={cart.notices?.securePaymentNotice?.text ?? ''}
                onChange={(html) => setNested(['cart', 'notices', 'securePaymentNotice', 'text'], html)}
              />
            </FormField>
            <ColorField
              label="Notice Background Color"
              value={cart.notices?.securePaymentNotice?.styles?.backgroundColor ?? ''}
              fallback="#000000"
              onChange={(v) => setNested(['cart', 'notices', 'securePaymentNotice', 'styles', 'backgroundColor'], v)}
            />
            <ColorField
              label="Notice Text Color"
              value={cart.notices?.securePaymentNotice?.styles?.color ?? ''}
              fallback="#ffffff"
              onChange={(v) => setNested(['cart', 'notices', 'securePaymentNotice', 'styles', 'color'], v)}
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
            {/* Free Shipping Banner */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Free Shipping Banner
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
            <ToggleField
              label="Show Free Shipping Banner"
              checked={!!checkout.freeShippingBanner?.isVisible}
              onChange={(v) => setNested(['checkout', 'freeShippingBanner', 'isVisible'], v)}
            />
            <FormField label="Logged Out Banner Content">
              <HtmlEditor
                value={checkout.freeShippingBanner?.loggedOutBannerContent ?? ''}
                onChange={(html) => setNested(['checkout', 'freeShippingBanner', 'loggedOutBannerContent'], html)}
              />
            </FormField>
            <FormField label="Logged In Banner Content">
              <HtmlEditor
                value={checkout.freeShippingBanner?.loggedInBannerContent ?? ''}
                onChange={(html) => setNested(['checkout', 'freeShippingBanner', 'loggedInBannerContent'], html)}
              />
            </FormField>

            {/* Secure Payment Notice */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Secure Payment Notice
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
            <ToggleField
              label="Show Secure Payment Notice"
              checked={!!checkout.securePaymentNotice?.isVisible}
              onChange={(v) => setNested(['checkout', 'securePaymentNotice', 'isVisible'], v)}
            />
            <FormField label="Secure Payment Notice Content">
              <HtmlEditor
                value={checkout.securePaymentNotice?.content ?? ''}
                onChange={(html) => setNested(['checkout', 'securePaymentNotice', 'content'], html)}
              />
            </FormField>

            {/* Auto Sign-Up */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Auto Sign-Up
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
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
            <FormField label="Auto Sign-Up Checkbox Label">
              <HtmlEditor
                value={checkout.autoSignUp?.labelText ?? ''}
                onChange={(html) => setNested(['checkout', 'autoSignUp', 'labelText'], html)}
              />
            </FormField>
            <FormField label="Help Modal Header">
              <HtmlEditor
                value={checkout.autoSignUp?.helpModal?.header ?? ''}
                onChange={(html) => setNested(['checkout', 'autoSignUp', 'helpModal', 'header'], html)}
              />
            </FormField>
            <FormField label="Help Modal Content">
              <HtmlEditor
                value={checkout.autoSignUp?.helpModal?.content ?? ''}
                onChange={(html) => setNested(['checkout', 'autoSignUp', 'helpModal', 'content'], html)}
              />
            </FormField>

            {/* SMS Opt-In */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                SMS Opt-In
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
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
            <FormField label="SMS Opt-In CTA Content">
              <HtmlEditor
                value={checkout.smsOptIn?.content ?? ''}
                onChange={(html) => setNested(['checkout', 'smsOptIn', 'content'], html)}
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
              <HtmlEditor
                value={orderDetails.title ?? ''}
                onChange={(html) => setNested(['orderDetails', 'title'], html)}
              />
            </FormField>

            {/* Table Header Style */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Table Header Style
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
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

            {/* Table Content Style */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Table Content Style
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
            <ColorField
              label="Table Content Background Color"
              value={orderDetails.tableContentStyle?.backgroundColor ?? ''}
              fallback="#ffffff"
              onChange={(v) => setNested(['orderDetails', 'tableContentStyle', 'backgroundColor'], v)}
            />

            {/* Buy It Again Button */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Buy It Again Button
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
            <FormField label="Buy It Again Button Text">
              <HtmlEditor
                value={orderDetails.buyItAgainButton?.text ?? ''}
                onChange={(html) => setNested(['orderDetails', 'buyItAgainButton', 'text'], html)}
              />
            </FormField>
            <FormField label="CSS Classes" helper="CSS classes to apply to the button">
              <input
                type="text"
                className="hippo-input"
                value={orderDetails.buyItAgainButton?.classes ?? ''}
                onChange={(e) => setNested(['orderDetails', 'buyItAgainButton', 'classes'], e.target.value)}
              />
            </FormField>

            {/* Re-Order All Button */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Re-Order All Button
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>
            <FormField label="Re-Order All Button Text">
              <HtmlEditor
                value={orderDetails.reOrderAllButton?.text ?? ''}
                onChange={(html) => setNested(['orderDetails', 'reOrderAllButton', 'text'], html)}
              />
            </FormField>
            <FormField label="CSS Classes" helper="CSS classes to apply to the button">
              <input
                type="text"
                className="hippo-input"
                value={orderDetails.reOrderAllButton?.classes ?? ''}
                onChange={(e) => setNested(['orderDetails', 'reOrderAllButton', 'classes'], e.target.value)}
              />
            </FormField>
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
              <HtmlEditor
                value={resetPassword.title ?? ''}
                onChange={(html) => setNested(['resetPassword', 'title'], html)}
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
              <HtmlEditor
                value={pageConfig.subscriptionCancel?.cancelText ?? ''}
                onChange={(html) => setNested(['subscriptionCancel', 'cancelText'], html)}
              />
            </FormField>

            {/* Cancel Reasons List */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Cancel Reasons
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>

            {(pageConfig.subscriptionCancel?.cancelReasons ?? []).map((reason: any, ri: number) => (
              <div key={ri} className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Reason {ri + 1}
                    {reason.title ? `: ${reason.title}` : ''}
                  </span>
                  <button
                    className="px-2 py-1 rounded text-[11px] font-medium text-[var(--error)] cursor-pointer hover:bg-[var(--error)]/10 transition-colors"
                    onClick={() => {
                      if (!data.pageConfig?.subscriptionCancel?.cancelReasons) return;
                      data.pageConfig.subscriptionCancel.cancelReasons.splice(ri, 1);
                      markDirty();
                    }}
                  >
                    Remove
                  </button>
                </div>

                <FormField label="Reason" helper="Required">
                  <input
                    type="text"
                    className="hippo-input"
                    value={reason.title ?? ''}
                    onChange={(e) => {
                      if (!data.pageConfig?.subscriptionCancel?.cancelReasons) return;
                      data.pageConfig.subscriptionCancel.cancelReasons[ri].title = e.target.value;
                      markDirty();
                    }}
                  />
                </FormField>

                <FormField label="Display Content">
                  <HtmlEditor
                    value={reason.text ?? ''}
                    onChange={(html) => {
                      if (!data.pageConfig?.subscriptionCancel?.cancelReasons) return;
                      data.pageConfig.subscriptionCancel.cancelReasons[ri].text = html;
                      markDirty();
                    }}
                  />
                </FormField>

                <FormField label="Identifier" helper="System identifier for analytics tracking">
                  <select
                    className="hippo-input"
                    value={reason.identifier ?? ''}
                    onChange={(e) => {
                      if (!data.pageConfig?.subscriptionCancel?.cancelReasons) return;
                      data.pageConfig.subscriptionCancel.cancelReasons[ri].identifier = e.target.value;
                      markDirty();
                    }}
                  >
                    <option value="">Select an identifier...</option>
                    {Object.values(SubscriptionCancelReasons).map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Buttons sub-list */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-[var(--border-glass)]" />
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                    Buttons
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-glass)]" />
                </div>

                {(reason.buttons ?? []).map((btn: any, bi: number) => (
                  <div key={bi} className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3 ml-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Button {bi + 1}</span>
                      <button
                        className="px-2 py-1 rounded text-[11px] font-medium text-[var(--error)] cursor-pointer hover:bg-[var(--error)]/10 transition-colors"
                        onClick={() => {
                          if (!data.pageConfig?.subscriptionCancel?.cancelReasons?.[ri]?.buttons) return;
                          data.pageConfig.subscriptionCancel.cancelReasons[ri].buttons.splice(bi, 1);
                          markDirty();
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <FormField label="Button Text">
                      <input
                        type="text"
                        className="hippo-input"
                        value={btn.text ?? ''}
                        onChange={(e) => {
                          if (!data.pageConfig?.subscriptionCancel?.cancelReasons?.[ri]?.buttons) return;
                          data.pageConfig.subscriptionCancel.cancelReasons[ri].buttons[bi].text = e.target.value;
                          markDirty();
                        }}
                      />
                    </FormField>

                    <FormField label="Button Link">
                      <input
                        type="text"
                        className="hippo-input"
                        placeholder="https://..."
                        value={btn.link ?? ''}
                        onChange={(e) => {
                          if (!data.pageConfig?.subscriptionCancel?.cancelReasons?.[ri]?.buttons) return;
                          data.pageConfig.subscriptionCancel.cancelReasons[ri].buttons[bi].link = e.target.value;
                          markDirty();
                        }}
                      />
                    </FormField>

                    <FormField label="Button Type" helper="Determines button behavior">
                      <select
                        className="hippo-input"
                        value={btn.type ?? 'link'}
                        onChange={(e) => {
                          if (!data.pageConfig?.subscriptionCancel?.cancelReasons?.[ri]?.buttons) return;
                          data.pageConfig.subscriptionCancel.cancelReasons[ri].buttons[bi].type = e.target.value;
                          markDirty();
                        }}
                      >
                        {Object.values(SubscriptionCancelButtonType).map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                ))}

                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
                  onClick={() => {
                    if (!data.pageConfig) data.pageConfig = {};
                    if (!data.pageConfig.subscriptionCancel) data.pageConfig.subscriptionCancel = {};
                    if (!data.pageConfig.subscriptionCancel.cancelReasons)
                      data.pageConfig.subscriptionCancel.cancelReasons = [];
                    if (!data.pageConfig.subscriptionCancel.cancelReasons[ri].buttons)
                      data.pageConfig.subscriptionCancel.cancelReasons[ri].buttons = [];
                    data.pageConfig.subscriptionCancel.cancelReasons[ri].buttons.push({
                      text: '',
                      link: '',
                      type: 'link',
                    });
                    markDirty();
                  }}
                >
                  + Add Button
                </button>
              </div>
            ))}

            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
              onClick={() => {
                if (!data.pageConfig) data.pageConfig = {};
                if (!data.pageConfig.subscriptionCancel) data.pageConfig.subscriptionCancel = {};
                if (!data.pageConfig.subscriptionCancel.cancelReasons)
                  data.pageConfig.subscriptionCancel.cancelReasons = [];
                data.pageConfig.subscriptionCancel.cancelReasons.push({
                  title: '',
                  text: '',
                  identifier: '',
                  buttons: [],
                });
                markDirty();
              }}
            >
              + Add Reason
            </button>
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
              <HtmlEditor
                value={subscriptionEdit.shipNow?.modalHeadlineContent ?? ''}
                onChange={(html) => setNested(['subscriptionEdit', 'shipNow', 'modalHeadlineContent'], html)}
              />
            </FormField>
            <FormField label="Ship Now Modal Content (HTML)" helper="Use $FREQUENCY for the subscription frequency">
              <HtmlEditor
                value={subscriptionEdit.shipNow?.modalContent ?? ''}
                onChange={(html) => setNested(['subscriptionEdit', 'shipNow', 'modalContent'], html)}
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
              <HtmlEditor value={upsell.mbgText ?? ''} onChange={(html) => setNested(['upsell', 'mbgText'], html)} />
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
            {/* Birthday Banner Configuration */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Birthday Banner
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>

            <FormField label="Banner Content">
              <HtmlEditor
                value={accountDetails.birthdayBannerConfig?.content ?? ''}
                onChange={(html) => setNested(['accountDetails', 'birthdayBannerConfig', 'content'], html)}
              />
            </FormField>
            <FormField label="Link Text">
              <input
                type="text"
                className="hippo-input"
                value={accountDetails.birthdayBannerConfig?.linkText ?? ''}
                onChange={(e) => setNested(['accountDetails', 'birthdayBannerConfig', 'linkText'], e.target.value)}
              />
            </FormField>
            <FormField label="Link URL">
              <input
                type="text"
                className="hippo-input"
                placeholder="https://..."
                value={accountDetails.birthdayBannerConfig?.linkUrl ?? ''}
                onChange={(e) => setNested(['accountDetails', 'birthdayBannerConfig', 'linkUrl'], e.target.value)}
              />
            </FormField>

            {/* Banner Styles */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                Banner Styles
              </span>
              <div className="flex-1 h-px bg-[var(--border-glass)]" />
            </div>

            <FormField label="Display" helper="CSS display value (e.g. flex, block)">
              <input
                type="text"
                className="hippo-input"
                value={accountDetails.birthdayBannerConfig?.styles?.display ?? ''}
                onChange={(e) =>
                  setNested(['accountDetails', 'birthdayBannerConfig', 'styles', 'display'], e.target.value)
                }
              />
            </FormField>
            <FormField label="Align Items" helper="CSS align-items value (e.g. center, flex-start)">
              <input
                type="text"
                className="hippo-input"
                value={accountDetails.birthdayBannerConfig?.styles?.alignItems ?? ''}
                onChange={(e) =>
                  setNested(['accountDetails', 'birthdayBannerConfig', 'styles', 'alignItems'], e.target.value)
                }
              />
            </FormField>
            <FormField label="Margin" helper="CSS margin value (e.g. 10px, 0 auto)">
              <input
                type="text"
                className="hippo-input"
                value={accountDetails.birthdayBannerConfig?.styles?.margin ?? ''}
                onChange={(e) =>
                  setNested(['accountDetails', 'birthdayBannerConfig', 'styles', 'margin'], e.target.value)
                }
              />
            </FormField>
            <FormField label="Padding" helper="CSS padding value (e.g. 16px, 10px 20px)">
              <input
                type="text"
                className="hippo-input"
                value={accountDetails.birthdayBannerConfig?.styles?.padding ?? ''}
                onChange={(e) =>
                  setNested(['accountDetails', 'birthdayBannerConfig', 'styles', 'padding'], e.target.value)
                }
              />
            </FormField>
            <ColorField
              label="Background Color"
              value={accountDetails.birthdayBannerConfig?.styles?.backgroundColor ?? ''}
              fallback="#ffffff"
              onChange={(v) => setNested(['accountDetails', 'birthdayBannerConfig', 'styles', 'backgroundColor'], v)}
            />
            <ColorField
              label="Text Color"
              value={accountDetails.birthdayBannerConfig?.styles?.color ?? ''}
              fallback="#000000"
              onChange={(v) => setNested(['accountDetails', 'birthdayBannerConfig', 'styles', 'color'], v)}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default PagesSection;

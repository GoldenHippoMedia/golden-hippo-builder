import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import {
  BasicHeaderCTAType,
  BasicHeaderLink,
  createCookieConfig,
  createFeatureConfig,
  createFooterConfig,
  createGeneralConfig,
  createHeaderConfig,
  createPageConfig,
  createSupportConfig,
  FooterType,
  HeaderType,
  MediumHeaderDesktopContentType,
  MediumHeaderDropdownType,
  ProductGridFilterType,
  ProductLinkPrefix,
  SubscriptionCancelButtonType,
  SubscriptionCancelReasons,
} from './sections';
import { BuilderContent } from '@builder.io/sdk';

export const createBrandConfigModel = (gridFilterModelId: string, bannerModelId: string): ModelShape => {
  return {
    name: 'gh-brand-config',
    kind: 'data',
    displayName: 'Brand Configuration',
    helperText: 'Manage global features and settings for your website',
    contentTitleField: undefined,
    fields: [
      ...createGeneralConfig(bannerModelId),
      createHeaderConfig(),
      createFooterConfig(),
      createFeatureConfig(gridFilterModelId),
      createSupportConfig(),
      createPageConfig(),
      createCookieConfig(),
    ],
  };
};

export type BuilderBrandConfigContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      brandDisplayName: string;
      images: {
        brandLogoSmall: string;
        brandLogoLarge: string;
        brandLogoFooter: string;
        bbbImage: string;
      };
      links: {
        termsLink: string;
        subscriptionTermsLink: string;
        privacyLink: string;
        supportLink: string;
        ccpaLink: string;
        bbbLink: string;
        accessibilityLink: string;
        socialMedia: {
          twitter: string;
          facebook: string;
          youtube: string;
          instagram: string;
          pinterest: string;
          tiktok: string;
        };
      };
      banners: {
        banner: {
          id: string;
          name: string;
        };
        alwaysShow: boolean;
      }[];
      header: {
        headerType: HeaderType;
        basicHeaderConfig?: {
          logoImage: string;
          mobileLinks: BasicHeaderLink[];
          desktopLinks: BasicHeaderLink[];
          ctas: {
            title: string;
            href: string;
            type: BasicHeaderCTAType;
            newTab: boolean;
            cssClasses: string[];
            hideOnMobile: boolean;
          }[];
          myAccountGuest: BasicHeaderLink &
            {
              icon: string;
            }[];
          myAccountAuthorized: BasicHeaderLink & {
            icon: string;
          };
          stickyHeader: {
            enabled: boolean;
            backgroundColor: string;
            scrollBackgroundColor: string;
            scrollLogo: string;
          };
          showLocaleSelection: boolean;
        };
        mediumHeaderConfig?: {
          wrapperID: string;
          wrapperClasses: string;
          showShippingMessage: boolean;
          mobileMenu: {
            logo: string;
            logoClasses: string;
            navClasses: string;
            dropDownWrapperClasses: string;
            dropDownContent: {
              type: MediumHeaderDropdownType;
              links: {
                itemClasses: string;
                loggedInOnly: boolean;
                loggedOutOnly: boolean;
                text: string;
                URL: string;
                subLinksWrapperClasses: string;
                subLinks: {
                  text: string;
                  URL: string;
                }[];
              }[];
              htmlContent: string;
              inputs: {
                defaultHtml: string;
                temporaryHtml: string;
                startTime: number;
                endTime: number;
              };
            }[];
          };
          desktopMenu: {
            logo: string;
            navClasses: string;
            content: {
              type: MediumHeaderDesktopContentType;
              wrapperClasses: string;
              links: {
                text: string;
                URL: string;
                loggedInOnly: boolean;
                loggedOutOnly: boolean;
                dropdownWrapperClasses: string;
                dropdownItemClasses: string;
                subLinks: {
                  columnHeaderTitle: string;
                  columnContentType: string;
                  links: {
                    text: string;
                    URL: string;
                  }[];
                  content: string;
                  inputs: {
                    defaultHtml: string;
                    temporaryHtml: string;
                    startTime: number;
                    endTime: number;
                  };
                };
              }[];
              htmlContent: string;
            }[];
          };
          bannersAboveHeader: {
            wrapperClasses: string;
            content: string;
          }[];
          contactUrl: string;
        };
        megaMenuConfig?: {
          showShippingMessage: boolean;
          mobileLinks: {
            title: string;
            href: string;
            expanded: boolean;
            links: {
              title: string;
              href: string;
            }[];
          }[];
          desktopShopNavLinks: {
            title: string;
            links: {
              title: string;
              href: string;
            }[];
            shopAllLink: {
              title: string;
              href: string;
            };
          }[];
        };
        dmpHeaderConfig?: {
          logoImage: string;
          mobileLinks: {
            title: string;
            href: string;
          }[];
          desktopLinks: {
            title: string;
            href: string;
          }[];
        };
      };
      footer: {
        footerType: FooterType;
      };
      features: {
        productGridFilterType: ProductGridFilterType;
        productGridFilterGroups: {
          filterConfig: {
            id: string;
          };
        }[];
        productGridHideRestricted: boolean;
        productLinkPrefix: ProductLinkPrefix;
        subscriptionAddOnsEnabled: boolean;
        shippingThresholdNotificationEnabled: boolean;
        bundlingEnabled: boolean;
      };
      support: {
        email: string;
        phone: string;
        phoneDisplay: string;
        address: {
          street: string;
          city: string;
          state: string;
          zipcode: string;
        };
        addressString: string;
      };
      pageConfig: {
        accountDetails: {
          birthdayBannerConfig: {
            content: string;
            linkText: string;
            linkUrl: string;
            styles: {
              display: string;
              alignItems: string;
              margin: string;
              padding: string;
              backgroundColor: string;
              color: string;
            };
          };
        };
        cart: {
          continueShoppingUrl: string;
          imageContainerBGColor: string;
          freeShippingBanner: {
            isVisible: boolean;
            loggedOutBannerContent: string;
            loggedInBannerContent: string;
            styles: {
              backgroundColor: string;
              color: string;
            };
          };
          notices: {
            securePaymentNotice: {
              isVisible: boolean;
              text: string;
              styles: {
                backgroundColor: string;
                color: string;
              };
            };
          };
        };
        checkout: {
          freeShippingBanner: {
            isVisible: boolean;
            loggedOutBannerContent: string;
            loggedInBannerContent: string;
          };
          securePaymentNotice: {
            isVisible: boolean;
            content: string;
          };
          autoSignUp: {
            isVisible: boolean;
            isChecked: boolean;
            labelText: string;
            helpModal: {
              header: string;
              content: string;
            };
          };
          smsOptIn: {
            isVisible: boolean;
            title: string;
            content: string;
          };
        };
        orderDetails: {
          title: string;
          tableHeaderStyle: {
            backgroundColor: string;
            color: string;
          };
          tableContentStyle: {
            backgroundColor: string;
          };
          buyItAgainButton: {
            text: string;
            classes: string;
          };
          reOrderAllButton: {
            text: string;
            classes: string;
          };
        };
        resetPassword: {
          title: string;
        };
        subscriptionCancel: {
          cancelText: string;
          cancelReasons: {
            title: string;
            text: string;
            identifier: SubscriptionCancelReasons;
            buttons: {
              text: string;
              link: string;
              type: SubscriptionCancelButtonType;
            }[];
          }[];
        };
        subscriptionEdit: {
          subscriptionItemDefaultImage: string;
          shipNow: {
            modalHeadlineContent: string;
            modalContent: string;
          };
        };
        upsell: {
          mbgImage: string;
          mbgText: string;
        };
      };
      cookieConfig: {
        popupBanner: {
          content: string;
          bannerStyles: {
            backgroundColor: string;
            borderRadius: string;
          };
          buttonStyles: {
            backgroundColor: string;
            color: string;
          };
        };
      };
    };
  }>;

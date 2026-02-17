import { PageTypes, PdpTypes } from '@core/models/page-types';
import { BuilderContent } from '@builder.io/sdk';

export interface BuilderReference {
  id: string;
  model: string;
  value: (BuilderContent & Record<string, any>) | undefined;
}

interface BasePageDetails {
  id: string;
  title: string;
  description: string;
  path: string;
  thumbnail?: string;
  seoTitle?: string;
  validationStatus: 'valid' | 'warning' | 'invalid';
  issues: string[] | (ValidationIssue | ValidationWarning)[];
  warnings: string[];
  lastUpdated: Date;
  previewUrl: string;
  data?: any;
}

interface BlogInfo {
  author?: string;
  title?: string;
  snippet?: string;
  publicationDate?: Date;
  thumbnail?: string;
  categories: NameAndId[];
}

export interface NameAndId {
  name: string;
  id: string;
}

export interface ProductGroupChild {
  productId: string;
  name: string;
  trialSize: boolean;
  reviews: {
    count: number;
    average: number;
  };
  hidden: boolean;
  inStock: boolean;
  categories: NameAndId[];
  useCases: NameAndId[];
  tags: NameAndId[];
  ingredients: NameAndId[];
  slug: string;
}

export interface PdpInfo {
  type: PdpTypes;
  name: string;
  subHeading: string | null;
  description: string | null;
  slides: string[];
  productDetails: {
    featuredImage?: string;
    secondaryImage?: string;
    flavorsOrSizes: ProductGroupChild[];
    includesTrial: boolean;
    hidden: boolean;
    inStock: boolean;
    reviews: {
      count: number;
      average: number;
    };
    categories: NameAndId[];
    useCases: NameAndId[];
    tags: NameAndId[];
    ingredients: NameAndId[];
    slug: string;
    packagingLabels: {
      plural: string;
      singular: string;
    };
  } | null;
  category?: NameAndId;
}

export interface BlogDetails extends BasePageDetails {
  pageType: PageTypes.BLOG;
  blog: BlogInfo;
  pdp: null;
}

export interface PdpDetails extends BasePageDetails {
  pageType: PageTypes.PRODUCT;
  pdp: PdpInfo | null;
  blog: null;
}

export interface GeneralDetails extends BasePageDetails {
  pageType: PageTypes.GENERAL;
  blog: null;
  pdp: null;
}

export type PageDetails = BlogDetails | PdpDetails | GeneralDetails;

export interface BlogComment {
  id: string;
  blogId: string;
  blogTitle: string;
  name: string;
  date: Date;
  comment: string;
  locale: string;
  language: string;
  parentId: string | null;
  internal: boolean;
  blog: Omit<BlogInfo, 'categories'>;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
}

export enum PageIssue {
  NO_TITLE = 'No title has been provided for this page.',
  NO_SEO_IMAGE = 'No SEO Image has been provided for this page',
  NO_SEO_DESCRIPTION = 'No SEO Description has been provided for this page',
}

export enum PageWarning {
  NO_SEO_TITLE = 'No SEO Title has been provided for this page. The default page title will be used instead.',
}

export enum BlogIssue {
  NOT_CONFIGURED = 'The blog details have not been configured.',
  NO_AUTHOR = 'No author provided.',
  NO_TITLE = 'The blog title has not been set.',
  NO_SNIPPET = 'The blog snippet has not been set.',
  NO_PUBLICATION_DATE = 'The blog publish date has not been set.',
  NO_THUMBNAIL = 'No image has been set for this blog.',
}

export enum PdpIssue {
  NOT_CONFIGURED = 'The PDP details have not been configured.',
  NO_TYPE = 'The type of PDP has not been selected (Product vs Product Group).',
  NO_CATEGORY = 'The category has not been selected. This is required for breadcrumb navigation.',
  NO_PRODUCT = 'This PDP is set to Product, but no product has been set.',
  NO_PRODUCT_GROUP = 'This PDP is set to Product Group, bu no product group has been set.',
  NO_IMAGES = 'No images have been selected for the PDP image slider.',
  NO_DETAILS = 'The product or product group details could not be parsed. Please verify your configuration.',
  NO_FLAVORS_OR_SIZES = 'The selected product group does not have products configured',
  ONLY_TRIAL = 'The selected product group only contains a trial size',
}

export type ValidationIssue = PageIssue | BlogIssue | PdpIssue;
export type ValidationWarning = PageWarning;

import { BuilderContent } from '@builder.io/sdk';
import {
  BlogComment,
  BlogIssue,
  BuilderReference,
  GeneralDetails,
  NameAndId,
  PageDetails,
  PageIssue,
  PageWarning,
  PdpDetails,
  PdpInfo,
  PdpIssue,
  ProductGroupChild,
  ValidationIssue,
  ValidationWarning,
} from './utils.interfaces';
import { PageTypes, PdpTypes } from '@core/models/page-types';
import { IProduct } from '@services/commerce-api/types';

class Utils {
  static parsePages(pages: BuilderContent[]): PageDetails[] {
    const output: PageDetails[] = [];

    for (const page of pages) {
      const { data, id, published, lastUpdated } = page;

      if (id && data && published === 'published') {
        const pageType = (data['pageType'] as PageTypes) ?? 'General';

        const baseProperties = {
          id: id,
          title: data['title'] ?? '',
          description: data['description'] ?? '',
          path: data['url'] ?? '/',
          pageType: pageType,
          thumbnail: data['seoImage'],
          seoTitle: data['heading'],
          validationStatus: 'valid' as const,
          issues: [],
          warnings: [],
          lastUpdated: new Date(lastUpdated ?? ''),
          // @ts-expect-error incomplete types provided by BuilderContent
          previewUrl: (page['previewUrl'] as string) ?? '',
        };

        let formattedPage: PageDetails;

        switch (pageType) {
          case PageTypes.BLOG: {
            const blog = data?.['blog'] as Record<string, any> | undefined;
            formattedPage = {
              ...baseProperties,
              pageType: PageTypes.BLOG,
              blog: {
                author: blog?.author,
                title: blog?.title,
                snippet: blog?.snippet,
                publicationDate: blog?.publicationDate ? new Date(blog.publicationDate) : undefined,
                thumbnail: blog?.thumbnail,
                categories: ((blog?.categories as { category: BuilderReference }[]) ?? []).map((c) => {
                  return {
                    id: c.category.value?.id ?? '',
                    name: c.category.value?.data?.name ?? '',
                  };
                }),
              },
              pdp: null,
            };
            break;
          }

          case PageTypes.PRODUCT: {
            formattedPage = {
              ...baseProperties,
              pageType: PageTypes.PRODUCT,
              pdp: this.getPdpInfo(page),
              blog: undefined as never,
            } as PdpDetails;
            break;
          }

          case PageTypes.GENERAL:
          default: {
            formattedPage = {
              ...baseProperties,
              pageType: PageTypes.GENERAL,
              blog: undefined as never,
              pdp: undefined as never,
            } as GeneralDetails;
            break;
          }
        }

        const generalValidations = Validator.generalValidation(formattedPage);
        let pageSpecificValidation: ValidationResponse = {
          warnings: [],
          issues: [],
        };

        if (formattedPage.pageType === PageTypes.BLOG) {
          pageSpecificValidation = Validator.blogValidation(formattedPage);
        }

        if (formattedPage.pageType === PageTypes.PRODUCT) {
          pageSpecificValidation = Validator.pdpValidation(formattedPage);
        }

        const mergedWarnings = [...generalValidations.warnings, ...pageSpecificValidation.warnings];
        const mergedIssues = [...generalValidations.issues, ...pageSpecificValidation.issues];

        const finalPage: PageDetails = {
          ...formattedPage,
          validationStatus: mergedIssues.length > 0 ? 'invalid' : mergedWarnings.length > 0 ? 'warning' : 'valid',
          warnings: mergedWarnings,
          issues: mergedIssues,
        };

        output.push(finalPage);
      }
    }
    return output;
  }

  static errorDetails(error: ValidationIssue | ValidationWarning): ErrorDetails {
    switch (error) {
      case PageWarning.NO_SEO_TITLE:
        return { message: error, errorType: 'SEO', severity: 'warning' };
      case PageIssue.NO_SEO_IMAGE:
        return { message: error, errorType: 'SEO', severity: 'issue' };
      case PageIssue.NO_SEO_DESCRIPTION:
        return { message: error, errorType: 'SEO', severity: 'issue' };
      case PageIssue.NO_TITLE:
        return { message: error, errorType: 'General', severity: 'issue' };
      case BlogIssue.NOT_CONFIGURED:
      case BlogIssue.NO_AUTHOR:
      case BlogIssue.NO_TITLE:
      case BlogIssue.NO_SNIPPET:
      case BlogIssue.NO_PUBLICATION_DATE:
      case BlogIssue.NO_THUMBNAIL:
        return { message: error, errorType: 'Blog', severity: 'issue' };
      case PdpIssue.NOT_CONFIGURED:
      case PdpIssue.NO_CATEGORY:
      case PdpIssue.NO_TYPE:
      case PdpIssue.NO_PRODUCT:
      case PdpIssue.NO_PRODUCT_GROUP:
      case PdpIssue.NO_IMAGES:
      case PdpIssue.NO_DETAILS:
      case PdpIssue.NO_FLAVORS_OR_SIZES:
      case PdpIssue.ONLY_TRIAL:
        return { message: error, errorType: 'Product', severity: 'issue' };
      default:
        return { message: error, errorType: 'General', severity: 'warning' };
    }
  }

  static parseBlogComments(comments: (BuilderContent & Record<string, any>)[]): BlogComment[] {
    const formattedComments: BlogComment[] = [];
    comments.forEach((content) => {
      const comment = content.data;
      const blogPageInfo = comment?.blog?.value?.data;
      const blogComment: BlogComment = {
        id: content.id ?? '',
        blogId: comment?.blog?.id ?? '',
        blogTitle: blogPageInfo?.blog?.title ?? blogPageInfo?.title ?? '',
        name: comment?.name ?? '',
        comment: (comment?.comment as string) ?? '',
        date: new Date(comment?.date ?? ''),
        locale: (comment?.locale as string) ?? 'US',
        language: (comment?.language as string) ?? 'en',
        parentId: (comment?.parentId as string) ?? null,
        internal: (comment?.internal as boolean) ?? false,
        blog: {
          author: (blogPageInfo?.blog?.author as string) ?? undefined,
          title: (blogPageInfo?.blog?.title as string) ?? undefined,
          snippet: (blogPageInfo?.blog?.snippet as string) ?? undefined,
          publicationDate: new Date(blogPageInfo?.blog?.publicationDate ?? undefined),
          thumbnail: (blogPageInfo?.blog?.thumbnail as string) ?? undefined,
        },
        status: (comment?.status as 'Pending Approval') ?? 'Pending Approval',
      };
      formattedComments.push(blogComment);
    });
    return formattedComments.sort((a, b) => {
      return b.date.getTime() - a.date.getTime();
    });
  }

  static getProductFromCatalog(slug: string, catalog: IProduct[]): IProduct | undefined {
    return catalog.find((p) => p.slug === slug);
  }

  private static getPdpInfo(content: BuilderContent): PdpInfo | null {
    const rawPdp = content.data?.['pdp'] as Record<string, any> | undefined;
    if (!rawPdp) {
      return null;
    }
    const slides = ((rawPdp?.slides as { image: string }[]) ?? []).map((slide) => slide.image);
    const typeOfPdp = (rawPdp?.type as PdpTypes.PRODUCT) ?? PdpTypes.PRODUCT;
    const pageCategory = rawPdp?.category ?? null;
    const pdpProduct = rawPdp?.product?.value?.data ?? null;
    const pdpGroup = rawPdp?.productGroup?.value?.data ?? null;
    if (typeOfPdp === PdpTypes.PRODUCT) {
      return {
        type: typeOfPdp,
        name: pdpProduct?.displayName ?? pdpProduct?.name ?? 'NO NAME???',
        subHeading: pdpProduct?.subHeading ?? null,
        description: pdpProduct?.shortDescription ?? null,
        slides: slides,
        productDetails: pdpProduct
          ? {
              featuredImage: pdpProduct?.featureImage,
              secondaryImage: pdpProduct?.secondaryImage,
              flavorsOrSizes: [],
              includesTrial: false,
              hidden: pdpProduct?.hidden ?? false,
              inStock: !(pdpProduct?.outOfStock ?? false),
              reviews: {
                count: pdpProduct?.reviews?.count ?? 0,
                average: pdpProduct?.reviews?.averageRating ?? 0,
              },
              categories: this.formatProductCategories([...(pdpProduct?.categories ?? [])]),
              useCases: this.formatProductUseCases([...(pdpProduct?.useCases ?? [])]),
              tags: this.formatProductTags([...(pdpProduct?.tags ?? [])]),
              ingredients: this.formatProductIngredients([...(pdpProduct?.ingredients ?? [])]),
              slug: pdpProduct?.gh?.slug ?? '',
              packagingLabels: {
                plural: pdpProduct?.packagingLabels?.plural ?? 'Units',
                singular: pdpProduct?.packagingLabels?.singular ?? 'Unit',
              },
            }
          : null,
        category: pageCategory
          ? {
              id: pageCategory.id,
              name: pageCategory?.value?.data?.name,
            }
          : undefined,
      };
    }
    if (typeOfPdp === PdpTypes.PRODUCT_GROUP) {
      const categoryMap: Map<string, NameAndId> = new Map();
      const tagMap: Map<string, NameAndId> = new Map();
      const useCaseMap: Map<string, NameAndId> = new Map();
      const ingredientMap: Map<string, NameAndId> = new Map();
      const products: ProductGroupChild[] = (
        (pdpGroup?.products as {
          displayName?: string;
          product: BuilderReference;
          isTrialSize?: boolean;
        }[]) ?? []
      ).map((p) => ({
        productId: p.product.value?.data?.gh?.id,
        name: (p.displayName ?? p?.product.value?.data?.displayName ?? p?.product.value?.name ?? '') as string,
        trialSize: p.isTrialSize ?? false,
        reviews: {
          count: p.product.value?.data?.reviews?.count ?? 0,
          average: p.product.value?.data?.reviews?.averageRating ?? 0,
        },
        hidden: p.product.value?.data?.hidden ?? false,
        inStock: !(p.product.value?.data?.outOfStock ?? false),
        categories: this.formatProductCategories([...(p.product.value?.data?.categories ?? [])]),
        useCases: this.formatProductUseCases([...(p.product.value?.data?.useCases ?? [])]),
        tags: this.formatProductTags([...(p.product.value?.data?.tags ?? [])]),
        ingredients: this.formatProductIngredients([...(p.product.value?.data?.ingredients ?? [])]),
        slug: p.product.value?.data?.gh?.slug ?? '',
      }));
      let reviewCount = 0;
      let reviewScore = 0;
      for (const p of products) {
        reviewCount += p.reviews.count ?? 0;
        reviewScore += (p.reviews.count ?? 0) * (p.reviews.average ?? 0);
        p.categories.forEach((cat) => {
          if (!categoryMap.has(cat.id)) categoryMap.set(cat.id, cat);
        });
        p.useCases.forEach((uc) => {
          if (!useCaseMap.has(uc.id)) useCaseMap.set(uc.id, uc);
        });
        p.tags.forEach((tag) => {
          if (!tagMap.has(tag.id)) tagMap.set(tag.id, tag);
        });
        p.ingredients.forEach((ing) => {
          if (!ingredientMap.has(ing.id)) ingredientMap.set(ing.id, ing);
        });
      }
      return {
        type: typeOfPdp,
        name: pdpGroup?.displayName ?? pdpGroup?.name,
        subHeading: pdpGroup?.subHeading ?? null,
        description: pdpGroup?.shortDescription ?? null,
        slides: slides,
        productDetails: pdpGroup
          ? {
              featuredImage: pdpGroup?.featureImage,
              secondaryImage: pdpGroup?.secondaryImage,
              flavorsOrSizes: [...products],
              includesTrial: products.some((p) => p.trialSize ?? false),
              hidden: pdpGroup?.hidden ?? false,
              inStock: !(pdpProduct?.outOfStock ?? false),
              reviews: {
                count: reviewCount,
                average: Math.round((reviewScore / reviewCount) * 100) / 100,
              },
              categories: Array.from(categoryMap.values()),
              useCases: Array.from(useCaseMap.values()),
              tags: Array.from(tagMap.values()),
              ingredients: Array.from(ingredientMap.values()),
              slug: pdpProduct?.gh?.slug ?? '',
              packagingLabels: {
                plural: pdpProduct?.packagingLabels?.plural ?? 'Units',
                singular: pdpProduct?.packagingLabels?.singular ?? 'Unit',
              },
            }
          : null,
        category: !pageCategory
          ? undefined
          : {
              id: pageCategory.id,
              name: pageCategory?.value?.data?.name,
            },
      };
    }
    return null;
  }

  private static formatProductCategories(categories: { category: BuilderReference }[]) {
    return categories.map((category) => ({
      id: category.category.id,
      name: category?.category.value?.data?.name ?? '',
    }));
  }

  private static formatProductUseCases(useCases: { useCase: BuilderReference }[]) {
    return useCases.map((useCase) => ({
      id: useCase.useCase.id,
      name: useCase?.useCase.value?.data?.name ?? '',
    }));
  }

  private static formatProductTags(tags: { tag: BuilderReference }[]) {
    return tags.map((tag) => ({
      id: tag.tag.id,
      name: tag?.tag.value?.data?.name ?? '',
    }));
  }

  private static formatProductIngredients(ingredients: { ingredient: BuilderReference }[]) {
    return ingredients.map((ingredient) => ({
      id: ingredient.ingredient.id,
      name: ingredient?.ingredient.value?.data?.name ?? '',
    }));
  }
}

export default Utils;

export interface ErrorDetails {
  message: string;
  errorType: 'General' | 'Blog' | 'Product' | 'SEO';
  severity: 'issue' | 'warning';
}

interface ValidationResponse {
  warnings: (ValidationIssue | ValidationWarning)[];
  issues: string[];
}

class Validator {
  static generalValidation(page: PageDetails): ValidationResponse {
    const issues: PageIssue[] = [];
    const warnings: PageWarning[] = [];
    if (!page.title || page.title === '') {
      issues.push(PageIssue.NO_TITLE);
    }
    if (!page.description || page.description === '') {
      issues.push(PageIssue.NO_SEO_DESCRIPTION);
    }
    if (!page.thumbnail || page.thumbnail === '') {
      issues.push(PageIssue.NO_SEO_IMAGE);
    }
    if (!page.seoTitle || page.seoTitle === '') {
      warnings.push(PageWarning.NO_SEO_TITLE);
    }
    return { warnings, issues };
  }

  static blogValidation(page: PageDetails): ValidationResponse {
    const issues: BlogIssue[] = [];
    if (!page.blog) {
      return { issues: [BlogIssue.NOT_CONFIGURED], warnings: [] };
    }
    if (!page.blog.author) issues.push(BlogIssue.NO_AUTHOR);
    if (!page.blog.title) issues.push(BlogIssue.NO_TITLE);
    if (!page.blog.snippet) issues.push(BlogIssue.NO_SNIPPET);
    if (!page.blog.publicationDate) issues.push(BlogIssue.NO_PUBLICATION_DATE);
    if (!page.blog.thumbnail) issues.push(BlogIssue.NO_THUMBNAIL);
    return {
      warnings: [],
      issues: issues.length === 5 ? [BlogIssue.NOT_CONFIGURED] : issues,
    };
  }

  static pdpValidation(page: PageDetails): ValidationResponse {
    const { pdp } = page;
    const issues: PdpIssue[] = [];
    if (!pdp) {
      return { issues: [PdpIssue.NOT_CONFIGURED], warnings: [] };
    }
    if (!pdp.type) issues.push(PdpIssue.NO_TYPE);
    if (!pdp.category) issues.push(PdpIssue.NO_CATEGORY);
    if (!pdp.productDetails) issues.push(PdpIssue.NO_PRODUCT);
    if (!pdp.slides || pdp.slides.length === 0) issues.push(PdpIssue.NO_IMAGES);
    if (!pdp.productDetails) issues.push(PdpIssue.NO_DETAILS);
    if (pdp.type === PdpTypes.PRODUCT_GROUP) {
      if ((pdp.productDetails?.flavorsOrSizes.length ?? 0) < 1) {
        issues.push(PdpIssue.NO_FLAVORS_OR_SIZES);
      }
      if (pdp.productDetails?.flavorsOrSizes.length === 1 && pdp.productDetails.includesTrial) {
        issues.push(PdpIssue.ONLY_TRIAL);
      }
    }
    return { warnings: [], issues };
  }
}

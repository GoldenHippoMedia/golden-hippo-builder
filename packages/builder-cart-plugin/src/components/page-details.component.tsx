import React from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import { StarRating } from '@goldenhippo/builder-ui';
import { PageDetails, PdpInfo } from '@utils/utils.interfaces';

export interface PageDetailsComponentProps {
  page: PageDetails;
}

function PdpSection({ pdp }: { pdp: PdpInfo }) {
  return (
    <div className="mt-4">
      <h4 className="font-semibold text-sm mb-2">Product Details</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-base-content/60">Type:</span> <span className="font-medium">{pdp.type}</span>
        </div>
        <div>
          <span className="text-base-content/60">Name:</span> <span className="font-medium">{pdp.name}</span>
        </div>
        {pdp.category && (
          <div>
            <span className="text-base-content/60">Category:</span>{' '}
            <span className="font-medium">{pdp.category.name}</span>
          </div>
        )}
        {pdp.productDetails && (
          <>
            <div>
              <span className="text-base-content/60">In Stock:</span>{' '}
              <span className={pdp.productDetails.inStock ? 'text-success' : 'text-error'}>
                {pdp.productDetails.inStock ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-base-content/60">Hidden:</span>{' '}
              <span>{pdp.productDetails.hidden ? 'Yes' : 'No'}</span>
            </div>
            {pdp.productDetails.reviews.count > 0 && (
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-base-content/60">Reviews:</span>
                <StarRating rating={pdp.productDetails.reviews.average} />
                <span className="text-xs text-base-content/50">({pdp.productDetails.reviews.count})</span>
              </div>
            )}
            {pdp.productDetails.flavorsOrSizes.length > 0 && (
              <div className="col-span-2">
                <span className="text-base-content/60">Variants:</span>{' '}
                <span>{pdp.productDetails.flavorsOrSizes.length} options</span>
              </div>
            )}
          </>
        )}
      </div>
      {pdp.slides.length > 0 && (
        <div className="mt-3">
          <span className="text-sm text-base-content/60">
            {pdp.slides.length} slider image{pdp.slides.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export function PageDetailsComponent({ page }: PageDetailsComponentProps) {
  const statusIcon = () => {
    switch (page.validationStatus) {
      case 'valid':
        return <HiOutlineCheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <HiOutlineExclamationTriangle className="h-5 w-5 text-warning" />;
      case 'invalid':
        return <HiOutlineXCircle className="h-5 w-5 text-error" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3">
        {page.thumbnail ? (
          <img src={page.thumbnail} alt={page.title} className="w-20 h-14 object-cover rounded" />
        ) : (
          <div className="w-20 h-14 bg-base-200 rounded flex items-center justify-center">
            <HiOutlineDocumentText className="h-6 w-6 text-base-content/30" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg">{page.title}</h3>
          <p className="text-sm text-base-content/60">{page.path}</p>
        </div>
      </div>

      {/* Status & Type */}
      <div className="flex items-center gap-3 mt-4">
        <div className="flex items-center gap-1">
          {statusIcon()}
          <span className="text-sm capitalize">{page.validationStatus}</span>
        </div>
        <div className="badge badge-ghost">{page.pageType}</div>
        {page.previewUrl && (
          <a href={page.previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs gap-1">
            <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
            Preview
          </a>
        )}
      </div>

      {/* Description */}
      {page.description && (
        <div className="mt-3">
          <p className="text-sm text-base-content/70">{page.description}</p>
        </div>
      )}

      {/* SEO */}
      {page.seoTitle && (
        <div className="mt-3">
          <span className="text-xs text-base-content/50">SEO Title:</span>
          <p className="text-sm">{page.seoTitle}</p>
        </div>
      )}

      {/* Issues */}
      {page.issues.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm text-error mb-1">Issues</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {page.issues.map((issue, i) => (
              <li key={i} className="text-error/80">
                {typeof issue === 'string' ? issue : issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {page.warnings.length > 0 && (
        <div className="mt-3">
          <h4 className="font-semibold text-sm text-warning mb-1">Warnings</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {page.warnings.map((warning, i) => (
              <li key={i} className="text-warning/80">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Blog Info */}
      {page.pageType === 'Blog' && page.blog && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">Blog Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {page.blog.author && (
              <div>
                <span className="text-base-content/60">Author:</span>{' '}
                <span className="font-medium">{page.blog.author}</span>
              </div>
            )}
            {page.blog.publicationDate && (
              <div>
                <span className="text-base-content/60">Published:</span>{' '}
                <span>{page.blog.publicationDate.toLocaleDateString()}</span>
              </div>
            )}
            {page.blog.categories.length > 0 && (
              <div className="col-span-2">
                <span className="text-base-content/60">Categories:</span>{' '}
                {page.blog.categories.map((c) => (
                  <span key={c.id} className="badge badge-ghost badge-xs mr-1">
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDP Info */}
      {page.pageType === 'Product' && page.pdp && <PdpSection pdp={page.pdp} />}

      {/* Metadata */}
      <div className="mt-4 text-xs text-base-content/40">
        <p>ID: {page.id}</p>
        <p>Last Updated: {page.lastUpdated.toLocaleString()}</p>
      </div>
    </div>
  );
}

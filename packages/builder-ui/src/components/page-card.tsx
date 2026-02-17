import React from 'react';
import clsx from 'clsx';
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineDocumentText } from 'react-icons/hi2';

export interface PageCardProps {
  title: string;
  path: string;
  pageType: string;
  thumbnail?: string;
  description?: string;
  metadata?: string;
  validationStatus: 'valid' | 'warning' | 'invalid';
  issueCount?: number;
  warningCount?: number;
  lastUpdated?: Date;
  onClick?: () => void;
  className?: string;
}

export function PageCard({
  title,
  path,
  pageType,
  thumbnail,
  description,
  metadata,
  validationStatus,
  issueCount = 0,
  warningCount = 0,
  lastUpdated,
  onClick,
  className,
}: PageCardProps) {
  const statusBadge = () => {
    switch (validationStatus) {
      case 'valid':
        return (
          <div className="badge badge-success badge-sm gap-1">
            <HiOutlineCheckCircle className="h-3 w-3" />
            Valid
          </div>
        );
      case 'warning':
        return (
          <div className="badge badge-warning badge-sm gap-1">
            <HiOutlineExclamationTriangle className="h-3 w-3" />
            {warningCount} Warning{warningCount !== 1 ? 's' : ''}
          </div>
        );
      case 'invalid':
        return (
          <div className="badge badge-error badge-sm gap-1">
            <HiOutlineExclamationTriangle className="h-3 w-3" />
            {issueCount} Issue{issueCount !== 1 ? 's' : ''}
          </div>
        );
    }
  };

  return (
    <div
      className={clsx('card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer', className)}
      onClick={onClick}
    >
      <figure className="h-32 overflow-hidden bg-base-200 flex items-center justify-center">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-base-content/30">
            <HiOutlineDocumentText className="h-10 w-10 mb-1" />
            <span className="text-xs">No Image</span>
          </div>
        )}
      </figure>
      <div className="card-body p-3">
        <div className="flex justify-between items-start">
          {statusBadge()}
          <div className="badge badge-ghost badge-xs">{pageType}</div>
        </div>
        <h3 className="card-title text-sm line-clamp-2 mt-1">{title}</h3>
        {description && <p className="text-xs text-base-content/70 line-clamp-2">{description}</p>}
        <p className="text-xs text-base-content/60 truncate">{path}</p>
        {metadata && <p className="text-xs text-base-content/50">{metadata}</p>}
        {lastUpdated && <p className="text-xs text-base-content/40">Updated {lastUpdated.toLocaleDateString()}</p>}
      </div>
    </div>
  );
}

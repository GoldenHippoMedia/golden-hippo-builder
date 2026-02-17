import React from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

export interface PageNotFoundProps {
  onNavigateHome?: () => void;
  message?: string;
}

export function PageNotFound({
  onNavigateHome,
  message = 'The page you are looking for could not be found.',
}: PageNotFoundProps) {
  return (
    <div className="bg-base-100 min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
      <HiOutlineExclamationTriangle className="h-16 w-16 text-warning mb-4" />
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-base-content/70 mb-6">{message}</p>
      {onNavigateHome && (
        <button className="btn btn-primary" onClick={onNavigateHome}>
          Go Home
        </button>
      )}
    </div>
  );
}

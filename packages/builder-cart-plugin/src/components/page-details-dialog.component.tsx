import React from 'react';
import { PageDetails } from '@utils/utils.interfaces';
import { PageDetailsComponent } from './page-details.component';

export interface PageDetailsDialogProps {
  page: PageDetails | null;
  open: boolean;
  onClose: () => void;
}

export function PageDetailsDialog({ page, open, onClose }: PageDetailsDialogProps) {
  if (!open || !page) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>
          ✕
        </button>
        <PageDetailsComponent page={page} />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

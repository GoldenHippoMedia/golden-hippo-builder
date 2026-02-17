import React, { useState } from 'react';
import { BlogComment } from '@utils/utils.interfaces';

export interface CommentReplyModalProps {
  comment: BlogComment;
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: BlogComment, replyText: string) => void;
}

export function CommentReplyModal({ comment, open, onClose, onSubmit }: CommentReplyModalProps) {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      onSubmit(comment, replyText.trim());
      setReplyText('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Reply to Comment</h3>

        <div className="mt-4 p-3 bg-base-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">{comment.name}</span>
            <span className="text-xs text-base-content/50">{new Date(comment.date).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-base-content/70">{comment.comment}</p>
          <p className="text-xs text-base-content/50 mt-1">on {comment.blogTitle}</p>
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Your Reply</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!replyText.trim() || submitting}>
            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Send Reply'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

import React, { useMemo, useState } from 'react';
import {
  HiMagnifyingGlass,
  HiOutlineChatBubbleLeft,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineFunnel,
  HiChevronLeft,
  HiChevronRight,
  HiArrowsUpDown,
} from 'react-icons/hi2';
import clsx from 'clsx';
import { LoadingSection } from '@goldenhippo/builder-ui';
import { BlogComment } from '@utils/utils.interfaces';

type CommentStatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';
type SortDirection = 'newest' | 'oldest';

export interface BlogCommentListProps {
  comments: BlogComment[];
  onApprove: (comment: BlogComment) => void;
  onReject: (comment: BlogComment) => void;
  onReply: (comment: BlogComment) => void;
  onViewBlog: (comment: BlogComment) => void;
  loading: boolean;
  pageSize: number;
}

const STATUS_BADGE_CLASS: Record<BlogComment['status'], string> = {
  'Pending Approval': 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-error',
};

const STATUS_LABEL: Record<BlogComment['status'], string> = {
  'Pending Approval': 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

function matchesStatusFilter(status: BlogComment['status'], filter: CommentStatusFilter): boolean {
  if (filter === 'All') return true;
  if (filter === 'Pending') return status === 'Pending Approval';
  if (filter === 'Approved') return status === 'Approved';
  if (filter === 'Rejected') return status === 'Rejected';
  return true;
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export function BlogCommentList({
  comments,
  onApprove,
  onReject,
  onReply,
  onViewBlog,
  loading,
  pageSize,
}: BlogCommentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommentStatusFilter>('All');
  const [sortDirection, setSortDirection] = useState<SortDirection>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredComments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let filtered = comments.filter((comment) => {
      if (!matchesStatusFilter(comment.status, statusFilter)) return false;
      if (query) {
        const nameMatch = comment.name.toLowerCase().includes(query);
        const blogTitleMatch = comment.blogTitle.toLowerCase().includes(query);
        const commentTextMatch = stripHtml(comment.comment).toLowerCase().includes(query);
        if (!nameMatch && !blogTitleMatch && !commentTextMatch) return false;
      }
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [comments, searchQuery, statusFilter, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedComments = filteredComments.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter: CommentStatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSection message="Loading comments..." size="lg" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search by name, blog title, or comment text..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Sort Toggle */}
        <button
          className="btn btn-outline gap-2"
          onClick={() => setSortDirection((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
        >
          <HiArrowsUpDown className="h-4 w-4" />
          {sortDirection === 'newest' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2">
        <HiOutlineFunnel className="h-4 w-4 text-base-content/50" />
        <div className="tabs tabs-boxed">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((filter) => (
            <button
              key={filter}
              className={clsx('tab', statusFilter === filter && 'tab-active')}
              onClick={() => handleStatusFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-base-content/60">
        Showing {paginatedComments.length} of {filteredComments.length} comment
        {filteredComments.length !== 1 ? 's' : ''}
      </div>

      {/* Comment List */}
      {paginatedComments.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          <HiOutlineChatBubbleLeft className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No comments found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {paginatedComments.map((comment) => (
            <div key={comment.id} className="card bg-base-100 shadow-sm border border-base-300">
              <div className="card-body p-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
                        <span className="text-xs">
                          {comment.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{comment.name}</span>
                      <span className="text-xs text-base-content/50 ml-2">
                        {new Date(comment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={clsx('badge badge-sm', STATUS_BADGE_CLASS[comment.status])}>
                    {STATUS_LABEL[comment.status]}
                  </div>
                </div>

                {/* Blog Title */}
                <div className="text-xs text-base-content/60 mt-1">
                  on <span className="font-medium text-base-content/80">{comment.blogTitle || 'Untitled Blog'}</span>
                </div>

                {/* Comment Preview */}
                <p className="text-sm text-base-content/80 mt-1 line-clamp-2">{stripHtml(comment.comment)}</p>

                {/* Action Buttons */}
                <div className="card-actions justify-end mt-2">
                  {comment.status !== 'Approved' && (
                    <button className="btn btn-success btn-xs gap-1" onClick={() => onApprove(comment)}>
                      <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </button>
                  )}
                  {comment.status !== 'Rejected' && (
                    <button className="btn btn-error btn-xs gap-1" onClick={() => onReject(comment)}>
                      <HiOutlineXCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  )}
                  <button className="btn btn-ghost btn-xs gap-1" onClick={() => onReply(comment)}>
                    <HiOutlineChatBubbleLeft className="h-3.5 w-3.5" />
                    Reply
                  </button>
                  <button className="btn btn-ghost btn-xs gap-1" onClick={() => onViewBlog(comment)}>
                    <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
                    View Blog
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            className="btn btn-sm btn-ghost"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <HiChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-base-content/70">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-ghost"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <HiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

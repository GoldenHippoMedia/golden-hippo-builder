import React, { useCallback } from 'react';
import { BlogComment } from '@utils/utils.interfaces';
import { LoadingSection } from '@goldenhippo/builder-ui';
import { BlogCommentList } from '@components/blog-comment-list.component';

interface BlogCommentPageProps {
  comments: BlogComment[];
  loading: boolean;
}

const BlogCommentPage: React.FC<BlogCommentPageProps> = ({ comments, loading }) => {
  const handleApprove = useCallback((comment: BlogComment) => {
    console.info('[Hippo Commerce] Approve comment', comment.id);
  }, []);

  const handleReject = useCallback((comment: BlogComment) => {
    console.info('[Hippo Commerce] Reject comment', comment.id);
  }, []);

  const handleReply = useCallback((comment: BlogComment) => {
    console.info('[Hippo Commerce] Reply to comment', comment.id);
  }, []);

  const handleViewBlog = useCallback((comment: BlogComment) => {
    console.info('[Hippo Commerce] View blog', comment.blogId);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Blog Comments</h2>
        <p className="text-base-content/70">{comments.length} total comments</p>
      </div>

      <BlogCommentList
        comments={comments}
        loading={loading}
        pageSize={20}
        onApprove={handleApprove}
        onReject={handleReject}
        onReply={handleReply}
        onViewBlog={handleViewBlog}
      />
    </div>
  );
};

export default BlogCommentPage;

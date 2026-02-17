import React, { useState, useMemo } from 'react';
import { PageDetails } from '@utils/utils.interfaces';
import { PageTypes } from '@core/models/page-types';
import { LoadingSection, PageCard } from '@goldenhippo/builder-ui';

interface BlogHomePageProps {
  pages: PageDetails[];
  loading: boolean;
}

const BlogHomePage: React.FC<BlogHomePageProps> = ({ pages, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const blogPages = useMemo(() => {
    return pages
      .filter((p) => p.pageType === PageTypes.BLOG)
      .filter(
        (p) =>
          !searchTerm ||
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.path.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const dateA = a.blog?.publicationDate?.getTime() ?? 0;
        const dateB = b.blog?.publicationDate?.getTime() ?? 0;
        return dateB - dateA;
      });
  }, [pages, searchTerm]);

  if (loading) {
    return <LoadingSection message="Loading blogs..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <p className="text-base-content/70">{blogPages.length} blog posts published</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogPages.map((page) => (
          <PageCard
            key={page.id}
            title={page.blog?.title ?? page.title}
            description={page.blog?.snippet ?? page.description}
            thumbnail={page.blog?.thumbnail ?? page.thumbnail}
            path={page.path}
            validationStatus={page.validationStatus}
            pageType="Blog"
            metadata={page.blog?.author ? `By ${page.blog.author}` : undefined}
          />
        ))}
      </div>

      {blogPages.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-lg">No blog posts found.</p>
        </div>
      )}
    </div>
  );
};

export default BlogHomePage;

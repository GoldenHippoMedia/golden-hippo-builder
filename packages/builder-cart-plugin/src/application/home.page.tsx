import React from 'react';
import { StatGridContainer, StatGridCard } from '@goldenhippo/builder-ui';
import { HiOutlineDocumentText, HiOutlineShoppingCart, HiOutlineChatBubbleLeft } from 'react-icons/hi2';
import { PageDetails, BlogComment } from '@utils/utils.interfaces';
import { IProduct } from '@services/commerce-api/types';

export enum PageOption {
  HOME = 'HOME',
  PAGES = 'PAGES',
  PRODUCTS = 'PRODUCTS',
  BLOGS = 'BLOGS',
  BLOG_COMMENTS = 'blogs:*comments',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT',
}

interface HomePageProps {
  pages: PageDetails[];
  products: IProduct[];
  blogComments: BlogComment[];
  loading: boolean;
  setPage: (page: PageOption) => void;
}

const HomePage: React.FC<HomePageProps> = ({ pages, products, blogComments, loading, setPage }) => {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-base-content/70">Overview of your Builder.io content and commerce data.</p>
      </div>

      <StatGridContainer>
        <StatGridCard
          title="Pages"
          metric={pages.length}
          loading={loading}
          variant="info"
          icon={<HiOutlineDocumentText />}
          actionLabel="View Pages"
          onActionClick={() => setPage(PageOption.PAGES)}
          subtitle="Published pages in Builder.io"
        />
        <StatGridCard
          title="Products"
          metric={products.length}
          loading={loading}
          variant="success"
          icon={<HiOutlineShoppingCart />}
          actionLabel="View Products"
          onActionClick={() => setPage(PageOption.PRODUCTS)}
          subtitle="Products in commerce catalog"
        />
        <StatGridCard
          title="Blog Comments"
          metric={blogComments.length}
          loading={loading}
          variant="warning"
          icon={<HiOutlineChatBubbleLeft />}
          actionLabel="View Comments"
          onActionClick={() => setPage(PageOption.BLOG_COMMENTS)}
          subtitle="Total blog comments"
        />
      </StatGridContainer>
    </div>
  );
};

export default HomePage;

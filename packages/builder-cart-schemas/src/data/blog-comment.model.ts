import { BuilderContentReference, BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';
import { BuilderBlogPageContent } from '../page';

const BlogCommentModel: ModelShape = {
  name: 'blog-comment',
  displayName: 'Blog Comment',
  kind: 'data',
  helperText: `Comments on your website's blogs`,
  contentTitleField: undefined,
  fields: [
    {
      name: 'name',
      friendlyName: 'Name',
      helperText: 'Name of the user who submitted this comment',
      type: 'text',
      defaultCollapsed: false,
      localized: false,
      required: true,
    },
    {
      name: 'date',
      friendlyName: 'Date',
      helperText: 'Date this comment was submitted',
      type: 'timestamp',
      defaultCollapsed: false,
      localized: false,
      required: true,
    },
    {
      name: 'status',
      friendlyName: 'Status',
      helperText: `Select the status of this comment. Only Approved comments will be displayed`,
      type: 'select',
      enum: ['Pending Approval', 'Approved', 'Rejected'],
      defaultValue: 'Pending Approval',
      defaultCollapsed: false,
      localized: false,
      required: true,
    },
    {
      type: 'text',
      name: 'email',
      friendlyName: 'Email',
      required: false,
      defaultCollapsed: false,
    },
    {
      type: 'html',
      name: 'comment',
      friendlyName: 'Comment',
      helperText: 'HTML content of the comment',
      required: true,
      defaultCollapsed: false,
    },
    {
      name: 'language',
      friendlyName: 'Language',
      helperText: `The language code of this comment. Legacy comments are synced as 'en'`,
      type: 'select',
      enum: ['en'],
      defaultCollapsed: true,
      localized: false,
      defaultValue: 'en',
      required: true,
    },
    {
      name: 'locale',
      friendlyName: 'Locale',
      helperText: `The country code of this comment. Legacy comments are synced as 'US'`,
      type: 'select',
      enum: ['US'],
      defaultValue: 'US',
      defaultCollapsed: true,
      localized: false,
      required: true,
    },
    {
      name: 'parentId',
      friendlyName: 'Parent Comment Id',
      helperText: 'If this comment is a reply, this is the Id of the parent',
      type: 'text',
      required: false,
      defaultCollapsed: true,
    },
    {
      name: 'internal',
      friendlyName: 'Brand Response',
      helperText: 'Indicates that this is a comment provided by the brand (i.e. a response)',
      type: 'boolean',
      defaultCollapsed: false,
      required: false,
    },
  ],
  hideFromUI: true,
};

export const createBlogCommentModel = (pageModelId: string): ModelShape => {
  return {
    ...BlogCommentModel,
    fields: [
      ...BlogCommentModel.fields,
      {
        name: 'blog',
        friendlyName: 'Blog Post',
        helperText: 'The blog that this comment is linked to',
        type: 'reference',
        modelId: pageModelId,
        required: true,
        defaultCollapsed: false,
        copyOnAdd: false,
      },
    ],
  };
};

export type BuilderBlogCommentContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      name: string;
      date: string;
      status: 'Pending Approval' | 'Approved' | 'Rejected';
      email?: string;
      comment: string;
      language: string;
      locale: string;
      parentId?: string;
      internal?: boolean;
      blog: {
        id: string;
        name: string;
        value: BuilderContentReference<BuilderBlogPageContent>;
      };
    };
  }>;

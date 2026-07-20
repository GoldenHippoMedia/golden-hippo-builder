import { BuilderResponseBaseData, ModelShape } from '@goldenhippo/builder-types';
import { BuilderContent } from '@builder.io/sdk';

/** Access level a user has for a single tab. 'write' implies 'read'. */
export type TabAccessLevel = 'none' | 'read' | 'write';

export interface TabAccessGrant {
  userId: string;
  email: string;
  readTabs?: string[];
  writeTabs?: string[];
}

export const createTabAccessModel = (): ModelShape => ({
  name: 'gh-tab-access',
  displayName: 'Tab Access',
  kind: 'data',
  helperText: 'Per-user plugin tab access. Managed from the Hippo Admin page.',
  contentTitleField: undefined,
  hideFromUI: true,
  fields: [
    {
      name: 'grants',
      friendlyName: 'User Grants',
      type: 'list',
      required: false,
      defaultCollapsed: false,
      localized: false,
      helperText: 'Each entry grants a single user read and/or write access to a set of plugin tabs.',
      subFields: [
        {
          name: 'userId',
          friendlyName: 'User ID',
          type: 'text',
          required: false,
          defaultCollapsed: false,
          localized: false,
        },
        {
          name: 'email',
          friendlyName: 'Email',
          type: 'text',
          required: false,
          defaultCollapsed: false,
          localized: false,
        },
        {
          name: 'readTabs',
          friendlyName: 'Read Tabs',
          type: 'Tags',
          required: false,
          defaultCollapsed: false,
          localized: false,
        },
        {
          name: 'writeTabs',
          friendlyName: 'Write Tabs',
          type: 'Tags',
          required: false,
          defaultCollapsed: false,
          localized: false,
        },
      ],
    },
  ],
});

export type BuilderTabAccessContent = BuilderContent &
  Partial<{
    data: BuilderResponseBaseData & {
      grants?: TabAccessGrant[];
    };
  }>;

/**
 * Resolve a user's access level for a single tab from their grant. Legacy
 * `tabs` entries (pre-read/write) are treated as write access.
 */
export const grantLevelForTab = (grant: TabAccessGrant | undefined, tabPath: string): TabAccessLevel => {
  if (!grant) return 'none';
  const write = new Set([...(grant.writeTabs ?? []), ...(grant.tabs ?? [])]);
  if (write.has(tabPath)) return 'write';
  if ((grant.readTabs ?? []).includes(tabPath)) return 'read';
  return 'none';
};

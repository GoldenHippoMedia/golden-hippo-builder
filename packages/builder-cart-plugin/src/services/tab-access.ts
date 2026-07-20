import { grantLevelForTab, TabAccessGrant, TabAccessLevel } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import UserManagementService from './user-management';
import BuilderApi from './builder-api';

/** Find the grant that applies to a user, matching by id or email. */
export const findGrantForUser = (
  grants: TabAccessGrant[] | undefined,
  user: { id: string; email: string },
): TabAccessGrant | undefined =>
  grants?.find((g) => (g.userId && g.userId === user.id) || (g.email && g.email === user.email));

export const resolveCurrentUserTabLevel = async (
  context: ExtendedApplicationContext,
  tabPath: string,
): Promise<TabAccessLevel> => {
  const user = UserManagementService.getUserDetails(context);
  if (user.permissions.admin) return 'write';
  try {
    const api = new BuilderApi(context);
    const entry = await api.getTabAccess();
    const grant = findGrantForUser(entry?.data?.grants, { id: user.id, email: user.email });
    const level = grantLevelForTab(grant, tabPath);
    return level === 'write' ? 'write' : 'read';
  } catch (e) {
    console.error('[Hippo Commerce - CART] Failed to resolve tab access level', e);
    return 'read';
  }
};

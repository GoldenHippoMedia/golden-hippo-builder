import { pluginId } from '../../constants';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';

export interface HippoUser {
  id: string;
  brand: string;
  email: string;
  name: string;
  permissions: {
    admin: boolean;
    createContent: boolean;
    editCode: boolean;
    editDesigns: boolean;
  };
  hippoApi: {
    user: string;
    password: string;
    url: string;
  };
}

class UserManagementService {
  static getUserDetails(context: ExtendedApplicationContext): HippoUser {
    const { user } = context;
    console.info('[Hippo Commerce] USER', JSON.parse(JSON.stringify(user)));
    const currentOrg = user.organizations.find((org) => org.value.id === user.currentOrganization);
    const appSettings = currentOrg?.value.settings.plugins.toJSON()[pluginId];
    return {
      id: user.id,
      brand: (appSettings?.brand as string) ?? '',
      email: user.data.email,
      name: user.data.displayName,
      permissions: {
        admin: user.can('admin'),
        createContent: user.can('createContent'),
        editCode: user.can('editCode'),
        editDesigns: user.can('editDesigns'),
      },
      hippoApi: {
        user: (appSettings?.apiUser as string) ?? '',
        password: (appSettings?.apiPassword as string) ?? '',
        url: appSettings?.apiUrl,
      },
    };
  }
}

export default UserManagementService;

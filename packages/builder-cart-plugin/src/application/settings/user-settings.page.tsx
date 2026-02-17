import React from 'react';
import { HippoUser } from '@services/user-management';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';

interface UserSettingsPageProps {
  user: HippoUser;
  context: ExtendedApplicationContext;
}

const UserSettingsPage: React.FC<UserSettingsPageProps> = ({ user, context }) => {
  const builderUser = context.user;
  const currentOrg = builderUser.organizations.find((org) => org.value.id === builderUser.currentOrganization);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">User Settings</h2>
        <p className="text-base-content/70">Your profile and account information. These settings are read-only.</p>
      </div>

      {/* Profile Information */}
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h3 className="card-title text-lg">Profile</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Display Name</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed">
                {builderUser.data.displayName || 'N/A'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed">
                {builderUser.data.email || 'N/A'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">User ID</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed text-xs">
                {builderUser.id || 'N/A'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Email Verified</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed">
                {builderUser.data.emailVerified ? (
                  <span className="badge badge-success badge-sm">Verified</span>
                ) : (
                  <span className="badge badge-warning badge-sm">Not Verified</span>
                )}
              </div>
            </div>
          </div>
          {builderUser.data.photoURL && (
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-semibold">Photo</span>
              </label>
              <div className="avatar">
                <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={builderUser.data.photoURL} alt={builderUser.data.displayName} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Details */}
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h3 className="card-title text-lg">Account Details</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Brand</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed">
                {user.brand || 'Not configured'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">API URL</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed text-xs">
                {user.hippoApi.url || 'Not configured'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h3 className="card-title text-lg">Professional Info</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Auth Provider</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed">
                {builderUser.settings.authProvider || 'N/A'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Signup Date</span>
              </label>
              <div className="input input-bordered flex items-center bg-base-300 cursor-not-allowed">
                {builderUser.settings.signupDate
                  ? new Date(builderUser.settings.signupDate).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Tech Stack</span>
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {(builderUser.settings.techStack ?? []).map((tech) => (
                  <span key={tech} className="badge badge-outline badge-sm">
                    {tech}
                  </span>
                ))}
                {(builderUser.settings.techStack ?? []).length === 0 && (
                  <span className="text-sm text-base-content/50">No tech stack listed</span>
                )}
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Job Functions</span>
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {(builderUser.settings.jobFunctions ?? []).map((fn) => (
                  <span key={fn} className="badge badge-outline badge-sm">
                    {fn}
                  </span>
                ))}
                {(builderUser.settings.jobFunctions ?? []).length === 0 && (
                  <span className="text-sm text-base-content/50">No job functions listed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h3 className="card-title text-lg">Permissions</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold mb-1">Admin</span>
              {user.permissions.admin ? (
                <span className="badge badge-success">Yes</span>
              ) : (
                <span className="badge badge-ghost">No</span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold mb-1">Create Content</span>
              {user.permissions.createContent ? (
                <span className="badge badge-success">Yes</span>
              ) : (
                <span className="badge badge-ghost">No</span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold mb-1">Edit Code</span>
              {user.permissions.editCode ? (
                <span className="badge badge-success">Yes</span>
              ) : (
                <span className="badge badge-ghost">No</span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold mb-1">Edit Designs</span>
              {user.permissions.editDesigns ? (
                <span className="badge badge-success">Yes</span>
              ) : (
                <span className="badge badge-ghost">No</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Organizations */}
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body">
          <h3 className="card-title text-lg">Organizations</h3>
          <div className="divider mt-0"></div>
          {builderUser.organizations.length === 0 ? (
            <p className="text-base-content/50">No organizations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {builderUser.organizations.map((org) => (
                    <tr key={org.value.id}>
                      <td className="font-medium">{org.value.name}</td>
                      <td className="text-xs text-base-content/60">{org.value.id}</td>
                      <td>
                        {org.value.id === builderUser.currentOrganization ? (
                          <span className="badge badge-primary badge-sm">Current</span>
                        ) : (
                          <span className="badge badge-ghost badge-sm">Member</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;

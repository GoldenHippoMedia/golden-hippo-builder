import React from 'react';

interface AdminHomePageProps {
  user: {
    name: string;
    permissions: {
      admin: boolean;
    };
  };
}

const AdminHomePage: React.FC<AdminHomePageProps> = ({ user }) => {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="card bg-base-200 shadow-md">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl">Admin Panel</h2>
          <p className="text-base-content/70">Welcome, {user.name}. This section is under development.</p>
          <div className="divider"></div>
          <p className="text-lg font-semibold text-warning">Coming soon...</p>
          <p className="text-sm text-base-content/50">
            Admin tools and configuration options will be available here in a future update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;

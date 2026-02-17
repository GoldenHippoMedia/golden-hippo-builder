import React from 'react';
import './styles.css';
import { HiOutlineRocketLaunch, HiOutlineDocumentText, HiOutlineCog6Tooth } from 'react-icons/hi2';

const App: React.FC = () => {
  return (
    <div id="hippo-funnel-app">
      <div className="min-h-screen bg-base-100" data-theme="ghippo">
        <div className="navbar bg-base-200 shadow-sm px-4">
          <div className="navbar-start">
            <span className="font-bold text-lg">Hippo Funnels</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <HiOutlineRocketLaunch className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Hippo Funnel Manager</h1>
            <p className="text-base-content/70 text-lg">Sales funnel management for Golden Hippo brands.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <HiOutlineDocumentText className="h-8 w-8 text-info" />
                  <h2 className="card-title">Funnel Pages</h2>
                </div>
                <p className="text-base-content/60 mt-2">
                  Manage landing pages, sales pages, and checkout flows for your funnel sites.
                </p>
                <div className="badge badge-info badge-outline mt-3">Coming Soon</div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <HiOutlineCog6Tooth className="h-8 w-8 text-secondary" />
                  <h2 className="card-title">Configuration</h2>
                </div>
                <p className="text-base-content/60 mt-2">
                  Configure funnel settings, A/B tests, and integration with the commerce platform.
                </p>
                <div className="badge badge-secondary badge-outline mt-3">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

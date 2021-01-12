import Navbar from 'components/navbar/navbar';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MTabs from 'components/ui/MTabs';
import React from 'react';
import DataProvidersTab from './DataProvidesTab';
import './ImportDataOverview.scss';

const ImportDataOverview = () => (
  <div className="imp-data-overview-cont">
    <Navbar />
    <MBreadcrumb
      className="bg-light px-3"
      items={[
        { name: 'Namespace' },
        { name: 'Project Name' },
        { name: 'Data' },
        { name: 'Import' },
      ]}
    />
    <MTabs>
      <MTabs.Section
        id="data-providers"
        defaultActive
        label="Data providers"
      >
        <DataProvidersTab />
      </MTabs.Section>
      <MTabs.Section
        id="Data sets"
        disabled
        label="Data sets"
      >
        <div>
          Datasets tab
        </div>
      </MTabs.Section>
    </MTabs>
  </div>
);

export default ImportDataOverview;

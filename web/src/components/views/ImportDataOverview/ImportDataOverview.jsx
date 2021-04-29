import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from 'components/navbar/navbar';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MTabs from 'components/ui/MTabs';
import DataProvidersTab from './DataProvidesTab';
import './ImportDataOverview.scss';

const ImportDataOverview = () => {
  const { namespace, slug } = useParams();
  return (
    <div className="imp-data-overview-cont">
      <Navbar />
      <MBreadcrumb
        className="px-3"
        items={[
          { name: namespace, href: `/${namespace}` },
          { name: slug, href: `/${namespace}/${slug}` },
          { name: 'Data', href: `/${namespace}/${slug}` },
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
};

export default ImportDataOverview;

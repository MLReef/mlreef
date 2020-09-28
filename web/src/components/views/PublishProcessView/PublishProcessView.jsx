import React from 'react';
import PropTypes from 'prop-types';
import Navbar from 'components/navbar/navbar';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MSimpleTabs from 'components/ui/MSimpleTabs/MSimpleTabsRouted';
import MPipes from 'components/ui/MPipes';
import ParameterList from './PublishProcessViewParameterList';
import RequirementList from './PublishProcessViewRequirementList';
import './PublishProcessView.scss';
import { stages, parameters, requeriments } from './info';

const PublishProcessView = (props) => {
  const {
    match: {
      params: { namespace, slug },
    },
  } = props;

  const breadcrumbs = [
    {
      name: namespace,
      href: '/',
    },
    {
      name: slug,
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Publishing',
      href: `/${namespace}/${slug}/-/publishing`,
    },
    {
      name: 'Processing',
    },
  ];

  return (
    <div className="publishing-process-view">
      <Navbar />
      <MBreadcrumb className="bg-light px-3" items={breadcrumbs} />
      <div className="publishing-process-view pt-4">
        <div className="publishing-process-view-content">
          <MSimpleTabs
            vertical
            pills
            sections={[
              {
                label: 'Overview',
                content: (
                  <div>
                    <MPipes
                      stages={stages}
                      status="failed"
                    />
                  </div>
                ),
                defaultActive: true,
              },
              {
                label: 'Environment',
                content: (
                  <div>TODO</div>
                ),
              },
              {
                label: 'Parameters',
                content: (
                  <div>
                    <h4 className="mt-0 t-dark">
                      Parameters found for model_name
                    </h4>
                    <ParameterList parameters={parameters} />
                  </div>
                ),
              },
              {
                label: 'Requirements',
                content: (
                  <div>
                    <h4 className="mt-0 t-dark">
                      2 dependencies found in the requirements.txt file
                    </h4>
                    <RequirementList requeriments={requeriments} />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

PublishProcessView.defaultProps = {

};

PublishProcessView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PublishProcessView;

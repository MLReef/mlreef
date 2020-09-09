import React from 'react';
import PropTypes from 'prop-types';
import Navbar from 'components/navbar/navbar';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MSimpleTabs from 'components/ui/MSimpleTabs/MSimpleTabsRouted';
import MFileExplorer from 'components/ui/MFileExplorer';
import MBricksWall from 'components/ui/MBricksWall';
import MDataFilters from 'components/ui/MDataFilters';
import './PublishingView.scss';
import branches from './info.json';
import { files, bricks, filters } from './info2';

const PublishingView = (props) => {
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
    },
  ];

  return (
    <div className="publishing-view">
      <Navbar />
      <MBreadcrumb className="bg-light px-3" items={breadcrumbs} />
      <div className="publishing-view pt-4">
        <div className="publishing-view-content">
          <MSimpleTabs
            steps
            sections={[
              {
                label: 'Select entry point and branch',
                done: true,
                content: (
                  <div style={{ minHeight: '60vh' }}>
                    <div className="statement">
                      <div className="statement-title">
                        Select the entry point for your model
                      </div>
                      <div className="statement-subtitle">
                        The make your model automatically executable for the entire
                        community, you need to select the entry python file of a given branch.
                      </div>
                    </div>
                    <MFileExplorer
                      selectable
                      files={files}
                      branches={branches}
                      onEnterDir={() => {}}
                    />
                  </div>
                ),
              },
              {
                label: 'Select base environment',
                done: false,
                defaultActive: true,
                content: (
                  <div className="row" style={{ minHeight: '60vh' }}>
                    <div className="col-3" />
                    <div className="col-6">
                      <div className="statement">
                        <div className="statement-title">
                          Select a base environment for your model
                        </div>
                        <div className="statement-subtitle">
                          MLReef provides a set of base environment images including
                          a set of pre-installed packages. Select one, that works best
                          with your code!
                        </div>
                      </div>
                      <MBricksWall animated bricks={bricks} />
                    </div>
                    <div className="col-3">
                      <MDataFilters filters={filters} />
                    </div>
                  </div>
                ),
              },
              {
                label: 'Publish model',
                done: false,
                content: (
                  <div style={{ minHeight: '60vh' }}>
                    <div className="statement">
                      <div className="statement-title">
                        Review publishing pipeline
                      </div>
                      <div className="statement-subtitle">
                        MLReef provides a set of base environment images including
                        a set of pre-installed packages. Select one, that works best
                        with your code!
                      </div>
                    </div>
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

PublishingView.defautProps = {

};

PublishingView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PublishingView;

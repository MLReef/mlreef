import React, { useEffect, useMemo, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import Navbar from 'components/navbar/navbar';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import hooks from 'customHooks/useSelectedProject';
import './Publications.scss';
import iconGrey from 'images/icon_grey-01.png';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MTabs from 'components/ui/MTabs';
import * as projectActions from 'store/actions/projectInfoActions';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import actionsAndFunctions from './PublicationActionsAndFunctions';
import PublicationInfoRow from './PublicationInfoRow';

const Publications = (props) => {
  const {
    match: {
      params: {
        namespace,
        slug,
      },
    },
    actions,
    user: { globalColorMarker },
  } = props;

  const [{
    gid,
    name: projectName,
  }, isFetching] = hooks.useSelectedProject(namespace, slug);

  const [selectedStatus, setStatus] = useState('all');
  const [pipes, setPipes] = useState([]);
  const sortedPipes = useMemo(
    () => actionsAndFunctions.sortPipelines(pipes),
    [pipes],
  );

  const selectedPipes = selectedStatus === 'all'
    ? pipes
    : sortedPipes.filter((sP) => sP.status === selectedStatus)[0].items;
  const hasPublicationPipes = selectedPipes.length > 0;

  useEffect(() => {
    if (gid) {
      actions.getProjectPipelines(gid)
        .then((pipelines) => actionsAndFunctions.getPipelinesAdditionalInformation(gid, pipelines))
        .then((pipesAddInfo) => setPipes(pipesAddInfo))
        .catch((err) => toastr.error('Error', err?.message));
    }
  }, [gid]);

  const customCrumbs = [
    {
      name: namespace,
      href: '/',
    },
    {
      name: projectName,
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Publications',
    },
  ];

  const handler = (status) => () => setStatus(status);

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <div className="publications" style={{ backgroundColor: 'var(--almostWhite)' }}>
      <Navbar />
      <MBreadcrumb className="px-3" items={customCrumbs} />
      <MTabs>
        <MTabs.Section
          id="publications"
          defaultActive
          label="Publications"
          color={globalColorMarker}
        >
          <br />
          <div className="publications-content">
            <div className="d-flex publications-content-top">
              <div className="publications-content-top-filters">
                {[
                  'All',
                  'Pending',
                  'Running',
                  'Failed',
                  'Finished',
                ].map((id, ind) => {
                  const lcId = id.toLowerCase();
                  return (
                    <button key={lcId} id={lcId} type="button" className="btn btn-switch" onClick={handler(lcId)}>
                      {`${id} ${lcId === 'all' ? pipes.length : sortedPipes[ind - 1].items.length}`}
                    </button>
                  );
                })}
              </div>
            </div>
            <br />
            <div className="d-flex publications-content-bottom">
              <table className="publications-content-bottom-table">
                <thead>
                  <tr className="publications-content-bottom-table-heading">
                    <th className="first"><p>Status</p></th>
                    <th><p>Method</p></th>
                    <th><p>Usable</p></th>
                    <th><p>Branch</p></th>
                    <th><p>Job</p></th>
                    <th className="last"><p>Timing</p></th>
                  </tr>
                </thead>
                <tbody>
                  {hasPublicationPipes && selectedPipes.map((pipe) => (
                    <PublicationInfoRow
                      key={pipe.id}
                      namespace={namespace}
                      slug={slug}
                      pipe={pipe}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {!hasPublicationPipes && (
            <div className="d-flex w-100 mt-3 publications-content-bottom-not-found">
              <img src={iconGrey} alt="no-publication-found" height="50" />
              <p style={{ height: 'unset' }}>No publications have been made so far</p>
            </div>
            )}
          </div>
        </MTabs.Section>
        <MTabs.Section
          id="statistics"
          disabled
          label="Statistics"
        />
      </MTabs>

    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user,
    project: state.projects.selectedProject,
  };
}

Publications.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string,
      slug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  project: PropTypes.shape({
    name: PropTypes.string,
    gid: PropTypes.number,
    pipelines: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Publications);

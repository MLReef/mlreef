import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import Navbar from 'components/navbar/navbar';
import { connect } from 'react-redux';
import { shape, string } from 'prop-types';
import hooks from 'customHooks/useSelectedProject';
import './Publications.scss';
import iconGrey from 'images/icon_grey-01.png';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MTabs from 'components/ui/MTabs';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import actionsAndFunctions from './PublicationActionsAndFunctions';
import PublicationInfoRow from './PublicationInfoRow';
import { sortTypedPipelines } from 'domain/Publications/metaData';
import useLoading from 'customHooks/useLoading';
import useEffectNoFirstRender from 'customHooks/useEffectNoFirstRender';

const Publications = (props) => {
  const {
    match: {
      params: {
        namespace,
        slug,
      },
    },
    user: { globalColorMarker },
  } = props;

  const [{
    gid,
    id,
    name: projectName,
  }, isFetching] = hooks.useSelectedProject(namespace, slug);

  const [selectedStatus, setStatus] = useState('all');
  const [pipes, setPipes] = useState([]);
  const sortedPipes = useMemo(
    () => sortTypedPipelines(pipes),
    [pipes],
  );

  const selectedPipes = selectedStatus === 'all'
    ? pipes
    : sortedPipes.filter((sP) => sP.status === selectedStatus)[0].items;
  const hasPublicationPipes = selectedPipes.length > 0;

  const getPubsCallback = useCallback(() => actionsAndFunctions.getPiblicationsList(id, gid)
    .then(setPipes)
    .catch((err) => toastr.error('Error', err?.message))
  , [id, gid]);

  const [isLoading, executeCall] = useLoading(getPubsCallback);

  useEffect(() => {
    if(!isFetching){
      executeCall();
    }
  }, [isFetching]);

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
            {<MLoadingSpinnerContainer active={isLoading}>
                <div className="d-flex publications-content-bottom">
                
                <table className="publications-content-bottom-table">
                  <thead>
                    <tr className="publications-content-bottom-table-heading">
                      <th className="first"><p>Status</p></th>
                      <th><p>Version</p></th>
                      <th><p>Usable</p></th>
                      <th><p>Branch</p></th>
                      <th><p>Job</p></th>
                      <th className="last"><p>Timing</p></th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasPublicationPipes && selectedPipes.map((publication) => (
                      <PublicationInfoRow
                        key={publication.id}
                        gid={gid}
                        namespace={namespace}
                        slug={slug}
                        publication={publication}
                      />
                    ))}
                  </tbody>
                </table>
                </div>
              </MLoadingSpinnerContainer>
            }
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

function mapStateToProps({ user, projects: { selectedProject } }) {
  return {
    user,
    project: selectedProject,
  };
}

Publications.propTypes = {
  match: shape({
    params: shape({
      namespace: string,
      slug: string,
    }).isRequired,
  }).isRequired,
  user: shape({
    globalColorMarker: string,
  }).isRequired,
};

export default connect(mapStateToProps)(Publications);

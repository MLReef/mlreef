// this view doesn't fork, it just is visible while a long forking is taking place
// and will check every 20 seconds if branches are ready.
import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ForkView.scss';
import forkingImage from 'images/forking.png';
import BranchesApi from 'apis/BranchesApi.ts';
import Navbar from 'components/navbar/navbar';
import hooks from 'customHooks/useSelectedProject';

const branchesApi = new BranchesApi();

const ForkProgressView = (props) => {
  const {
    history,
    match: {
      params: {
        namespace, slug,
      },
    },
  } = props;

  const [{ gid }] = hooks.useSelectedProject(namespace, slug);

  const checkBranches = useCallback(
    () => branchesApi.getBranches(gid)
      .then((branches) => {
        if (branches.length) {
          // eslint-disable-next-line
          console.log('push!');
          history.push(`/${namespace}/${slug}`);
        }
      }),
    [namespace, slug, gid, history],
  );

  useEffect(
    () => {
      const intId = setInterval(() => { checkBranches(); }, 10 * 1000);

      return () => clearInterval(intId);
    },
    [checkBranches],
  );

  return (
    <div className="project-component">
      <Navbar />
      <div
        className="mx-auto mt-5 t-center"
        style={{ maxWidth: '250px' }}
      >
        <div>
          <h2 className="t-dark">Forking in process</h2>
          <p className="t-secondary">You may wait while we import the repository for you. You may refresh at will.</p>
        </div>
        <div
          className="bg-image m-auto"
          style={{
            backgroundImage: `url(${forkingImage})`,
            width: '200px',
            height: '160px',
          }}
        />
      </div>
    </div>
  );
};

ForkProgressView.defaultProps = {

};

ForkProgressView.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    hash: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ForkProgressView;

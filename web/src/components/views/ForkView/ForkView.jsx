import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './ForkView.scss';
import forkingImage from 'images/forking.png';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import Navbar from 'components/navbar/navbar';
import hooks from 'customHooks/useSelectedProject';

const projectGeneralInfoApi = new ProjectGeneralInfoApi();

const ForkView = (props) => {
  const {
    history,
    match: {
      params: {
        namespace, slug,
      },
    },
  } = props;

  const [selectedProject] = hooks.useSelectedProject(namespace, slug);

  const { id, gid, gitlabName } = selectedProject;

  const handleFork = useCallback(
    () => projectGeneralInfoApi.fork(id, null, gitlabName, null)
      .then((project) => history.push(`/${project.gitlab_namespace}/${project.slug}`))
      .catch((err) => {
        toastr.error('Error:', err?.message);
        history.goBack();
      }),
    [history, id, gitlabName],
  );

  useEffect(() => {
    if (gid) handleFork();
  }, [gid, handleFork]);

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

ForkView.defaultProps = {

};

ForkView.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ForkView;

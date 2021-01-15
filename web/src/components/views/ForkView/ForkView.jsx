import React, { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './ForkView.scss';
import forkingImage from 'images/forking.png';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
// import { getProjectDetails } from 'store/actions/projectInfoActions';
import Navbar from 'components/navbar/navbar';

const projectGeneralInfoApi = new ProjectGeneralInfoApi();

const ForkView = (props) => {
  const {
    history,
    match: {
      params: {
        projectId,
      },
    },
  } = props;

  const projectInfo = useSelector(({ projects }) => projects.selectedProject);

  const handleFork = useCallback(
    () => {
      projectGeneralInfoApi.fork(projectId, null, projectInfo.gitlabName, null)
        .then((project) => {
          history.push(`/${project.gitlab_namespace}/${project.slug}`);
        })
        .catch((err) => {
          toastr.error('Error:', err?.message);
          history.goBack();
        });
    },
    [history, projectId, projectInfo],
  );

  useEffect(() => {
    handleFork();
  }, [handleFork]);

  return (
    <div className="project-component">
      <Navbar />
      <div
        className="mx-auto mt-5 t-center"
        style={{ maxWidth: '250px' }}
      >
        <div>
          <h2 className="t-dark">Froking in process</h2>
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

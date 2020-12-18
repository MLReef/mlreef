import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './ForkView.scss';
import forkingImage from 'images/forking.png';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { getProjectDetails } from 'store/actions/projectInfoActions';
import Navbar from '../navbar/navbar';

const ForkView = (props) => {
  const {
    history,
    match: {
      params: {
        projectId,
      },
    },
  } = props;

  const dispatch = useDispatch();
  const projectInfo = useSelector(({ projects }) => projects.selectedProject);
  const { username } = useSelector(({ user }) => user);

  const handleFork = () => {
    dispatch(getProjectDetails(projectId))
      .then(() => Promise.reject())
      .then(() => {
        const projApi = new ProjectGeneralInfoApi();
        return projApi.forkProject(projectInfo.id, username, projectInfo.name);
      })
      .then(() => {
        setTimeout(() => {
          history.push('/');
        }, 2000);
      })
      .catch((err) => {
        toastr.error('Failed fork:', err);
        history.goBack();
      });
  };

  useEffect(() => {
    handleFork();
    // eslint-disable-next-line
  }, []);

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
  match: {
    params: {
      projectId: '',
    },
  },
};

ForkView.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
    }),
  }),
};

export default ForkView;

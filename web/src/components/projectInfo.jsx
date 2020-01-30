import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { _ } from 'core-js';
import {
  func, shape, string, number,
} from 'prop-types';
import star01 from '../images/star_01.svg';
import fork01 from '../images/fork_01.svg';
import clone01 from '../images/clone_01.svg';
import projectGeneralInfoApi from '../apis/projectGeneralInfoApi';
import arrow01 from '../images/arrow_down_blue-01.png';
import * as projectActions from '../actions/projectInfoActions';

const ProjectInfo = ({ project, actions }) => {

  let id, iconUrl, default_branch, name, stars, forks, http_url_to_repo, ssh_url_to_repo;

  if(project) {
    iconUrl = project.avatar_url;
    default_branch = project.default_branch;
    id = project.id;
    name = project.name;
    stars = project.star_count;
    forks = project.forks_count;
    http_url_to_repo = project.http_url_to_repo;
    ssh_url_to_repo = project.ssh_url_to_repo;
  }
  const [redirect, setRedirect] = React.useState(false);

  function handleFork() {
    /**
     * @var nameSpace: mlreefdemo is hardcoded
     * because we do not have a real user authentication mechanism
     */
    let id, projectName, forks;
    if(project) {
      id = project.id;
      projectName = project.name;
      forks = project.forks_count;
    }
    const nameSpace = 'mlreefdemo';
    const newNumberOfForks = forks + 1;
    const name = `${projectName} forked ${newNumberOfForks}`;
    projectGeneralInfoApi.forkProject(id, nameSpace, name)
      .then(
        () => {
          actions.getProjectsList();
          setRedirect(true);
        },
      );
  }

  return (
    <div className="project-info">
      <div className="project-id">
        <Link to={`/my-projects/${id}/${default_branch}`}>
          <div className="project-pic">
            <img style={{ minWidth: '100%' }} src={iconUrl} alt="" />
          </div>
        </Link>
        <div className="project-name">
          <Link to={`/my-projects/${id}/${default_branch}`} id="projectName">{name}</Link>
          <p id="projectId">
            Project ID:
            {id}
            {' '}
            | 526MB used
          </p>
        </div>
      </div>
      {redirect ? <Redirect to="/my-projects" /> : null}
      <div className="project-options">
        <div className="options">
          <button
            type="button"
            className="option-name"
          >
            <img
              id="option-image"
              src={star01}
              alt=""
            />
            <p>Star</p>
          </button>

          <div className="counter">
            <p>{stars}</p>
          </div>
        </div>

        <div className="options">
          <button
            type="button"
            className="option-name"
            onClick={handleFork}
          >
            <img id="option-image" src={fork01} alt="" />
            <p>Fork</p>
          </button>

          <div className="counter">
            <p>{forks}</p>
          </div>
        </div>
        <div className="options">
          <button
            type="button"
            className="option-name"
          >
            <img id="option-image" src={clone01} alt="" />
            <p>Clone</p>
          </button>
          <Clonedropdown http={http_url_to_repo} ssh={ssh_url_to_repo} />
        </div>
      </div>
    </div>
  );
};

function Clonedropdown({ ssh, http }) {
  // The following code can be used to refactor the rest of the code. New way of writing the code.
  const node = React.useRef();
  const [open, setOpen] = React.useState(false);

  const handleClickOutside = (e) => {
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setOpen(false);
  };

  React.useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <div
        className="counter clone-dropdown"
        ref={node}
        onClick={() => setOpen(!open)}
      >
        <img className="dropdown-white" src={arrow01} alt="Clone" />
        {open && (
          <div className="clone-box">
            <div className="link-box">
              <p>Clone with SSH</p>
              <div className="clone-link">
                <input type="text" value={ssh} className="ssh-http-link" readOnly />
                <img className="clone-icon" src={clone01} alt="" />
              </div>
            </div>
            <div className="link-box">
              <p>Clone with HTTPS</p>
              <div className="clone-link">
                <input type="text" value={http} className="ssh-http-link" readOnly />
                <img className="clone-icon" src={clone01} alt="" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

Clonedropdown.propTypes = {
  ssh: string.isRequired,
  http: string.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
    }, dispatch),
  };
}

ProjectInfo.propTypes = {
  project: shape({
    avatar_url: string.isRequired,
    forks_count: number.isRequired,
    name: string.isRequired,
    id: number.isRequired,
    default_branch: string.isRequired,
    star_count: number.isRequired,
    http_url_to_repo: string.isRequired,
    ssh_url_to_repo: string.isRequired,
  }).isRequired,
  actions: shape({
    getProjectsList: func.isRequired,
  }).isRequired,
};

export default connect(_, mapDispatchToProps)(ProjectInfo);

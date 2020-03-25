import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import {
  func, shape, string, number,
} from 'prop-types';
import star01 from '../images/star_01.svg';
import fork01 from '../images/fork_01.svg';
import clone01 from '../images/clone_01.svg';
import projectGeneralInfoApi from '../apis/projectGeneralInfoApi';
import * as projectActions from '../actions/projectInfoActions';

const ProjectInfo = (props) => {
  const {
    project,
    actions,
    userNamespace,
    setIsForking,
  } = props;

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
    let Id;
    let projectName;
    if (project) {
      Id = project.id;
      projectName = project.name;
    }

    setIsForking(true);

    projectGeneralInfoApi.forkProject(Id, userNamespace, projectName)
      .then(
        () => {
          actions.getProjectsList();
          setRedirect(true);
        },
      )
      .finally(() => {
        setIsForking(false);
      });
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
        <div className="options d-flex mr-2">
          <button
            type="button"
            className="option-name btn btn-hidden border-rounded-left py-2 px-3 my-0"
          >
            <img
              className="mr-0 mr-lg-1"
              id="option-image"
              src={star01}
              alt=""
            />
            <span className="my-auto d-none d-lg-block">Star</span>
          </button>

          <div className="counter border-rounded-right h-100">
            <span>{stars}</span>
          </div>
        </div>

        {default_branch !== null && (
        <div className="options d-flex mr-2">
          <button
            type="button"
            className="option-name btn btn-hidden border-rounded-left py-2 px-3 my-0"
            onClick={handleFork}
          >
            <img className="mr-0 mr-lg-1" id="option-image" src={fork01} alt="" />
            <span className="my-auto d-none d-lg-block">Fork</span>
          </button>

          <div className="counter border-rounded-right h-100">
            <span>{forks}</span>
          </div>
        </div>
        )}
        <div className="options d-flex">
          <div className="option-name border-rounded-left py-2 px-3 my-0">
            <img className="mr-0 mr-lg-1" id="option-image" src={clone01} alt="" />
            <span className="my-auto d-none d-lg-block">Clone</span>
          </div>
          <Clonedropdown className="border-rounded-right h-100" http={http_url_to_repo} ssh={ssh_url_to_repo} />
        </div>
      </div>
    </div>
  );
};

export function Clonedropdown(props) {
  const {
    ssh,
    http,
    className,
  } = props;

  // The following code can be used to refactor the rest of the code. New way of writing the code.
  const node = React.useRef();
  const sshRef = React.useRef(null);
  const httpRef = React.useRef(null);
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

  const handleCopySsh = e => {
    sshRef && sshRef.current.select();
    document.execCommand('copy');
    setOpen(false);
  };

  const handleCopyHttp = e => {
    httpRef && httpRef.current.select();
    document.execCommand('copy');
    setOpen(false);
  };

  const handleClickInput = e => {
    e.target.select();
  };

  return (
    <div
      id="t-clonedropdown-toggle"
      className={`${className} counter clone-dropdown`}
      ref={node}
      onClick={ () => setOpen(!open) }
      style={{ cursor: 'pointer' }}
    >
      <span
        role="button"
        className={`fa fa-chevron-${open ? 'up' : 'down'}`}
      />
      {open && (
        <div className="clone-box mt-1">
          <div className="link-box">
            <p>Clone with SSH</p>
            <div className="clone-link">
              <input
                ref={sshRef}
                onClick={handleClickInput}
                type="text"
                value={ssh}
                className="ssh-http-link"
                readOnly
              />
              <img
                onClick={handleCopySsh}
                className="clone-icon ssh"
                src={clone01}
                alt="copy-icon" />
            </div>
          </div>
          <div className="link-box">
            <p>Clone with HTTPS</p>
            <div className="clone-link">
              <input
                ref={httpRef}
                onClick={handleClickInput}
                type="text"
                value={http}
                className="ssh-http-link"
                readOnly
              />
              <img
                onClick={handleCopyHttp}
                className="clone-icon http"
                src={clone01}
                alt="copy-icon" />
            </div>
          </div>
        </div>
      )}
    </div>
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

function mapStateToProps({ user }) {
  return {
    userNamespace: user.username || '',
  };
}
ProjectInfo.defaultProps = {
  setIsForking: () => {},
};

ProjectInfo.propTypes = {
  project: shape({
    avatar_url: string,
    forks_count: number.isRequired,
    name: string.isRequired,
    id: number.isRequired,
    default_branch: string,
    star_count: number.isRequired,
    http_url_to_repo: string.isRequired,
    ssh_url_to_repo: string.isRequired,
  }).isRequired,
  actions: shape({
    getProjectsList: func.isRequired,
  }).isRequired,
  userNamespace: string.isRequired,
  setIsForking: func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectInfo);

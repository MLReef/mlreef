import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import {
  func, shape, string, number,
} from 'prop-types';
import ProjectGeneralInfoApi from '../apis/projectGeneralInfoApi.ts';
import * as projectActions from '../actions/projectInfoActions';
import { plainToClass } from 'class-transformer';
import DataProject from 'domain/project/DataProject';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import CodeProject from 'domain/project/CodeProject';

const ProjectInfo = (props) => {
  const {
    project,
    actions,
    userNamespace,
    setIsForking,
  } = props;
  const classProject = project.projectType === PROJECT_TYPES.DATA_PROJ
    ? plainToClass(DataProject, project)
    : plainToClass(CodeProject, project);
  const [redirect, setRedirect] = React.useState(false);

  function handleFork() {
    let Id;
    let projectName;
    if (classProject) {
      Id = classProject.id;
      projectName = classProject.name;
    }

    setIsForking(true);
    const projectGeneralInfoApi = new ProjectGeneralInfoApi();
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
        <Link to={`/my-projects/${classProject.id}/${classProject.defaultBranch}`}>
          <div className="project-pic overflow-hidden">
            <img style={{ minWidth: '100%' }} src={classProject.avatarUrl} alt="" />
          </div>
        </Link>
        <div className="project-name">
          <Link to={`/my-projects/${classProject.id}/${classProject.defaultBranch}`} id="projectName">{classProject.gitlabName}</Link>
          <p id="projectId">
            Project ID:
            {classProject.id}
            {' '}
            | {classProject.getRepositorySize()} used
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
              src="/images/svg/star_01.svg"
              alt=""
            />
            <span className="my-auto d-none d-lg-block">Star</span>
          </button>

          <div className="counter border-rounded-right h-100">
            <span>{classProject.starCount}</span>
          </div>
        </div>

        {classProject.defaultBranch !== null && (
        <div className="options d-flex mr-2">
          <button
            type="button"
            className="option-name btn btn-hidden border-rounded-left py-2 px-3 my-0"
            onClick={handleFork}
          >
            <img className="mr-0 mr-lg-1" id="option-image" src="/images/svg/fork_01.svg" alt="" />
            <span className="my-auto d-none d-lg-block">Fork</span>
          </button>

          <div className="counter border-rounded-right h-100">
            <span>{classProject.forksCount}</span>
          </div>
        </div>
        )}
        <div className="options d-flex">
          <div className="option-name border-rounded-left py-2 px-3 my-0">
            <img className="mr-0 mr-lg-1" id="option-image" src="/images/svg/clone_01.svg" alt="" />
            <span className="my-auto d-none d-lg-block">Clone</span>
          </div>
          <Clonedropdown className="border-rounded-right h-100" http={classProject.httpUrlToRepo} ssh={classProject.sshUrlToRepo} />
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
                src="/images/svg/clone_01.svg"
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
                src="/images/svg/clone_01.svg"
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
    avatarUrl: string,
    forksCount: number.isRequired,
    gitlabName: string.isRequired,
    id: number.isRequired,
    defaultBranch: string,
    starCount: number.isRequired,
    httpUrlToRepo: string.isRequired,
    sshUrlToRepo: string.isRequired,
  }).isRequired,
  actions: shape({
    getProjectsList: func.isRequired,
  }).isRequired,
  userNamespace: string.isRequired,
  setIsForking: func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectInfo);

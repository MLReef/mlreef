import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { string, shape, number, objectOf, arrayOf } from 'prop-types';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './commitsView.css';
import arrowBlue from '../../images/arrow_down_blue_01.svg';
import file01 from '../../images/file_01.svg';
import folder01 from '../../images/folder_01.svg';
import commitsApi from '../../apis/CommitsApi';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';

class CommitsView extends Component {
  constructor(props) {
    super(props);
    const { projects } = this.props;
    this.state = {
      show: false,
      commits: [],
      project: projects && projects.selectedProject,
    };
  }

  componentDidMount() {
    const { match: { params: { projectId, branch, pathParam } } } = this.props;
    commitsApi.getCommits(projectId, branch, pathParam)
      .then((response) => this.setState({ commits: response }));
  }

  handleBlur = (e) => {
    if (this.node.contains(e.target)) {
      return;
    }
    this.handleDrop();
  };

  handleDrop = () => {
    const { show } = this.state;
    if (!show) {
      document.addEventListener('click', this.handleBlur, false);
    } else {
      document.removeEventListener('click', this.handleBlur, false);
    }
    this.setState((prevState) => ({
      show: !prevState.show,
    }));
  };

  render() {
    const {
      project,
      branches,
      commits,
      show,
    } = this.state;
    const groupName = project.namespace.name;
    const { users } = this.props;
    const { match: { params: { branch } } } = this.props;
    const distinct = [
      ...new Set(
        commits.map(
          (x) => new Date(x.committed_date)
            .toLocaleString(
              'en-eu', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              },
            ),
        ),
      )];
    return (
      <div id="commits-view-container">
        <Navbar />
        <ProjectContainer project={project} activeFeature="data" folders={[groupName, project.name, 'Data', 'Commits']} />
        <br />
        <br />
        <div className="main-content">
          <div className="commit-path">
            <div className="btn" ref={(node) => { this.node = node; }}>
              <button type="button" onClick={this.handleDrop}>
                <span>{decodeURIComponent(branch)}</span>
                <img className="dropdown-white" src={arrowBlue} alt="" />
              </button>
            </div>
            {show && (
              <div id="branches-list" className="select-branch commitview-select">
                <div
                  style={{ margin: '0 50px', fontSize: '14px', padding: '0 40px' }}
                >
                  <p>Switch Branches</p>
                </div>
                <hr />
                <div className="search-branch">
                  <input
                    type="text"
                    placeholder="Search branches or tags"
                  />
                  <div className="branches">
                    <ul>
                      <li className="branch-header">Branches</li>
                      {branches && branches.filter((branchItem) => !branchItem.name.startsWith('data-pipeline/')
                        && !branchItem.name.startsWith('experiment/')).map((item) => {
                        const encoded = encodeURIComponent(item.name);
                        return (
                          <li key={encoded}>
                            <Link id={item.name} to={`/my-projects/${project.id}/${encoded}/commits`} onClick={this.handleClick}><p>{item.name}</p></Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <input type="text" placeholder="Filter by commit message" />
          </div>
          {distinct.map((commit, index) => (
            <div key={index.toString()} className="commit-per-date">
              <div className="commit-header">
                <p>
                  Commits on
                  {' '}
                  {commit}
                </p>
              </div>
              {commits.map((item) => {
                let avatar = 'https://assets.gitlab-static.net/uploads/-/system/user/avatar/3839940/avatar.png';
                if (users) {
                  users.forEach((user) => {
                    const { name } = user;
                    const avatarUrl = user.avatar_url;
                    if (name === item.author_name) {
                      avatar = avatarUrl;
                    }
                  });
                }
                return (
                  new Date(item.committed_date).toLocaleString('en-eu', { day: 'numeric', month: 'short', year: 'numeric' }) === commit
                    ? (
                      <CommitDiv
                        key={item.short_id}
                        projectId={project.id}
                        commitid={item.id}
                        title={item.title}
                        name={item.author_name}
                        id={item.short_id}
                        time={item.committed_date}
                        avatarName={avatar}
                      />
                    )
                    : ''
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export function CommitDiv(props) {
  const {
    time,
    id,
    name,
    title,
    commitid,
    projectId,
    avatarName,
  } = props;
  const today = new Date();
  const previous = new Date(time);
  const timediff = getTimeCreatedAgo(previous, today);
  return (
    <div className="commits" key={id}>
      <div className="commit-list">
        <div className="commit-pic-circle">
          <img src={avatarName} alt="avatar" />
        </div>
        <div className="commit-data">
          <Link to={`/my-projects/${projectId}/commit/${commitid}`}>{title}</Link>
          <span>
            {name}
            {' '}
            authored
            {' '}
            {timediff}
          </span>
        </div>
        <div className="commit-details">
          <span>{id}</span>
          <img className="file-icon" src={file01} alt="" />
          <img className="folder-icon" src={folder01} alt="" />
        </div>
      </div>
    </div>
  );
}

CommitDiv.propTypes = {
  time: string.isRequired,
  id: string.isRequired,
  name: string.isRequired,
  title: string.isRequired,
  commitid: string.isRequired,
  projectId: number.isRequired,
  avatarName: string.isRequired,
};

CommitsView.defaultProps = {
  match: {
    params: {},
  },
};

CommitsView.propTypes = {
  match: shape({
    params: shape({
      projectId: string.isRequired,
      branch: string.isRequired,
      path: string,
    }),
  }),
  users: arrayOf(shape({
    name: string.isRequired,
    avatar_url: string.isRequired,
  })).isRequired,
  projects: shape({
    selectedProject: objectOf(shape).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
    users: state.users,
  };
}

export default connect(mapStateToProps)(CommitsView);

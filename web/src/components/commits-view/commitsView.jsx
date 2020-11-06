import React, { Component, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import {
  string,
  shape,
  objectOf,
  func,
  arrayOf,
} from 'prop-types';
import { generateBreadCrumbs } from 'functions/helpers';
import MSelect from 'components/ui/MSelect';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './commitsView.css';
import CommitsApi from '../../apis/CommitsApi.ts';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';

const commitsApi = new CommitsApi();

class CommitsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: [],
      commitMessageSearchedFor: '',
    };
  }

  componentDidMount() {
    const {
      projects: { selectedProject: { gitlabId } },
      match: {
        params: {
          branch,
          path,
        },
      },
    } = this.props;
    this.getCommits(gitlabId, branch, path)
      .catch(this.handleErrorsGettingCommits);
  }

  getCommits = (gitlabId, branch, path) => commitsApi.getCommits(gitlabId, branch, path)
    .then((response) => this.setState({ commits: response }))

  handleErrorsGettingCommits = (error) => toastr.error('Error', error?.message);

  onBranchSelected = (val) => {
    const { projects: { selectedProject: project }, history } = this.props;
    const { match: { params: { namespace, slug } } } = this.props;
    const { gitlabId } = project;
    this.getCommits(gitlabId, val)
      .then(history.push(`/${namespace}/${slug}/-/commits/${val}`))
      .catch(this.handleErrorsGettingCommits);
  }

  render() {
    const {
      commits,
      commitMessageSearchedFor,
    } = this.state;
    const {
      projects: { selectedProject: project },
      users,
      branches,
      match: { params: { branch, namespace, slug } },
    } = this.props;

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Commits',
      },
    ];

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
        <ProjectContainer
          activeFeature="data"
          breadcrumbs={generateBreadCrumbs(project, customCrumbs)}
        />
        <br />
        <br />
        <div className="main-content">
          <div className="commit-path">
            <MSelect
              label={branch || 'Select branch'}
              options={branches.map(({ name }) => ({ label: name, value: name }))}
              onSelect={this.onBranchSelected}
            />
            <input
              type="text"
              id="commits-filter-input"
              placeholder="Filter by commit message"
              onChange={(e) => {
                const val = e.target.value;
                this.setState({ commitMessageSearchedFor: val });
              }}
            />
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
              {commits
                .filter((comm) => comm.title.includes(commitMessageSearchedFor)).map((item) => {
                  let avatarImage = 'https://assets.gitlab-static.net/uploads/-/system/user/avatar/3839940/avatar.png';
                  let userName = '';
                  if (users) {
                    users.forEach((user) => {
                      const { name } = user;
                      const avatarUrl = user.avatar_url;
                      if (name === item.author_name) {
                        avatarImage = avatarUrl;
                        userName = name;
                      }
                    });
                  }
                  return (
                    new Date(item.committed_date).toLocaleString('en-eu', { day: 'numeric', month: 'short', year: 'numeric' }) === commit
                      ? (
                        <CommitDiv
                          branch={branch}
                          key={item.short_id}
                          namespace={namespace}
                          slug={slug}
                          commitid={item.id}
                          title={item.title}
                          name={item.author_name}
                          id={item.short_id}
                          time={item.committed_date}
                          avatarImage={avatarImage}
                          userName={userName}
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
    branch,
    time,
    id,
    name,
    title,
    commitid,
    avatarImage,
    userName,
    namespace,
    slug,
  } = props;
  const spanRef = useRef();
  const today = new Date();
  const previous = new Date(time);
  const timediff = getTimeCreatedAgo(previous, today);
  const inputRef = useRef();

  function onClick() {
    const phantomInput = document.createElement('input');
    phantomInput.value = spanRef.current.innerText;
    document.body.appendChild(phantomInput);
    phantomInput.select();
    document.execCommand('copy');
    document.body.removeChild(phantomInput);
  }
  return (
    <div className="commits" key={id}>
      <div className="commit-list">
        <Link to={`/${userName}`}>
          <span style={{ position: 'relative' }}>
            <img width="32" height="32" className="avatar-circle mt-3 ml-1" src={avatarImage} alt="avatar" />
          </span>
        </Link>
        <div className="commit-data">
          <Link to={`/${namespace}/${slug}/-/commits/${branch}/-/${commitid}`}>{title}</Link>
          <span>
            <a href={`/${userName}`}>
              {name}
            </a>
            {' '}
            authored
            {' '}
            {timediff}
          </span>
        </div>
        <div className="commit-details btn-group">
          <input type="text" ref={inputRef} style={{ display: 'none' }} />
          <span ref={spanRef} className="border-rounded-left">{id}</span>
          {/* TODO: The next button had a tooltip but MToolTip does not fit the needs, think about something */}
          <button
            type="button"
            label="clone"
            className="btn btn-icon fa fa-copy t-primary"
            onClick={onClick}
          />
        </div>
      </div>
    </div>
  );
}

CommitDiv.propTypes = {
  branch: string.isRequired,
  time: string.isRequired,
  id: string.isRequired,
  name: string.isRequired,
  title: string.isRequired,
  commitid: string.isRequired,
  namespace: string.isRequired,
  slug: string.isRequired,
  avatarImage: string.isRequired,
  userName: string.isRequired,
};

CommitsView.defaultProps = {
  match: {
    params: {},
  },
};

CommitsView.propTypes = {
  match: shape({
    params: shape({
      branch: string.isRequired,
      path: string,
    }),
  }),
  history: shape({
    push: func.isRequired,
  }).isRequired,
  branches: arrayOf(
    shape({
      name: string.isRequired,
    }),
  ).isRequired,
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

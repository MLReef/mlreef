import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  shape, number, string, arrayOf,
} from 'prop-types';
import {
  Button,
} from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import ProjectContainer from '../projectContainer';
import Navbar from '../navbar/navbar';
import CustomizedSelect from '../CustomizedSelect';
import BlueBorderedInput from '../BlueBorderedInput';
import CustomizedButton from '../CustomizedButton';
import { CommitDiv } from '../commits-view/commitsView';
import './newMergeRequest.css';
import branchesApi from '../../apis/BranchesApi';
import commitsApi from '../../apis/CommitsApi';
import mergeRequestAPI from '../../apis/mergeRequestApi';
import ImageDiffSection from '../imageDiffSection';

const imageFormats = [
  '.png',
  '.jpg',
];

export class NewMergeRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: [],
      lastCommit: {},
      imagesToRender: [],
      title: '',
      description: '',
      branchToMergeInto: '',
      loading: false,
      redirect: false,
    };
    this.onBranchChanged = this.onBranchChanged.bind(this);
    this.onTitleChangedHandler = this.onTitleChangedHandler.bind(this);
    this.onDescriptionChangedHandler = this.onDescriptionChangedHandler.bind(this);
    this.handleCreateBranchEv = this.handleCreateBranchEv.bind(this);
  }

  onBranchChanged(branchSelected) {
    this.setState({ branchToMergeInto: branchSelected });
    const {
      projects: {
        selectedProject,
      },
      match: {
        params: {
          branch,
        },
      },
    } = this.props;
    branchesApi
      .compare(selectedProject.id, branchSelected, branch)
      .then((res) => {
        this.setState({
          lastCommit: res.commit,
          commits: res.commits,
          diffs: res.diffs,
        });
        this.getDiffDetails(res.diffs);
      }).catch((err) => {
        toastr.error('Error', err.message);
      });
  }

  onTitleChangedHandler(e) {
    this.setState({
      title: e.target.value,
    });
  }

  onDescriptionChangedHandler(e) {
    this.setState({
      description: e.target.value,
    });
  }

  getDiffDetails(diffsArray) {
    const { lastCommit } = this.state;
    const {
      match: {
        params: {
          projectId,
        },
      },
    } = this.props;
    diffsArray.filter((diff) => imageFormats
      .filter((format) => diff.old_path.includes(format)).length > 0)
      .forEach(async (imageDiff) => {
        const { imagesToRender } = this.state;
        let previousImage;
        let nextImage;
        if (!imageDiff.new_file) {
          previousImage = await commitsApi.getFileDataInCertainCommit(
            projectId,
            encodeURIComponent(
              imageDiff.old_path,
            ), lastCommit.parent_ids[0],
          );
        }
        if (!imageDiff.deleted_file) {
          nextImage = await commitsApi.getFileDataInCertainCommit(
            projectId,
            encodeURIComponent(
              imageDiff.old_path,
            ), lastCommit.id,
          );
        }
        imagesToRender.push({
          previousImage,
          nextImage,
          fileName: imageDiff.old_path.split('/').slice(-1)[0],
        });
        this.setState({ ...imagesToRender });
      });
  }

  handleCreateBranchEv() {
    this.setState({ loading: true });
    const {
      title,
      description,
      branchToMergeInto,
    } = this.state;
    const {
      projects: {
        selectedProject: { id },
      },
      match: {
        params: {
          branch,
        },
      },
    } = this.props;
    mergeRequestAPI
      .submitMergeReq(id, branch, branchToMergeInto, title, description)
      .then(() => {
        this.setState({ loading: false, redirect: true });
      }).catch((err) => {
        toastr.error('Error: ', err.message);
      });
  }

  render() {
    const {
      title,
      branchToMergeInto,
      commits,
      diffs,
      imagesToRender,
      loading,
      redirect,
    } = this.state;
    const isEnabledCreateMergeReq = title.length > 0
        && branchToMergeInto.length > 0;
    const {
      projects: {
        selectedProject,
      },
      branches,
      users,
      match: {
        params: {
          branch,
        },
      },
    } = this.props;
    const groupName = selectedProject.namespace.name;
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
      <>
        {redirect && (
          <Redirect to={`/my-projects/${selectedProject.id}/master`} />
        )}
        <Navbar />
        <ProjectContainer
          project={selectedProject}
          activeFeature="data"
          folders={[groupName, selectedProject.name, 'Data', 'New merge request']}
        />
        <div className="main-content">
          <br />
          <p style={{ color: '#1A2B3F', marginTop: '1.5em', fontSize: '1.3em' }}>
            <b>New Merge request</b>
          </p>
          <br />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: 'max-content',
            marginTop: '1em',
          }}
          >
            <p id="branch-selected-name" variant="h6" component="h5" style={{ color: '#1A2B3F', fontSize: '1.1em' }}>
              from&nbsp;
              <b>{branch}</b>
              &nbsp;into
            </p>
            &nbsp;
            <div style={{ marginLeft: '1em', width: '20%' }}>
              <CustomizedSelect
                options={branches.filter((branchForSelect) => branchForSelect !== branch)}
                inputId="branches-select"
                onChangeHandler={this.onBranchChanged}
                inputLabelText="Select a branch"
              />
            </div>
          </div>
          <br />
          <br />
          <div style={{ borderTop: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', marginLeft: '10%', marginTop: '3em' }}>
              <p style={{
                width: '6em', textAlign: 'end', fontWeight: '700', marginRight: '2em',
              }}
              >
                Title
              </p>
              <BlueBorderedInput id="title-mr-input" style={{ width: '100%' }} onChange={this.onTitleChangedHandler} />
            </div>
            <div style={{ display: 'flex', marginLeft: '10%', marginTop: '3em' }}>
              <p style={{
                width: '6em', textAlign: 'end', fontWeight: '700', marginRight: '2em',
              }}
              >
                Description
              </p>
              <BlueBorderedInput
                id="description-mr-input"
                multiline
                rows="4"
                placeholder="Describe the goal
                  of the changes and what
                  the reviewers must pay attention at"
                onChange={this.onDescriptionChangedHandler}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex',
            backgroundColor: '#F9F8F8',
            padding: '1em 2em',
            justifyContent: 'space-between',
          }}
          >
            <Button
              id="cancel-button"
              variant="contained"
              href={`/my-projects/${selectedProject.id}/master`}
            >
              Cancel
            </Button>
            {isEnabledCreateMergeReq ? (
              <CustomizedButton
                id="submit-merge-request"
                onClickHandler={this.handleCreateBranchEv}
                buttonLabel="Submit merge request"
                loading={loading}
              />
            ) : (
              <Button
                id="submit-merge-request"
                disabled
                type="button"
              >
                Submit merge request
              </Button>
            )}
          </div>
          <br />
          {commits.length > 0 && (
            <div style={{
              borderTopLeftRadius: '1em',
              borderTopRightRadius: '1em',
            }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 5em',
                color: 'white',
                backgroundColor: '#32AFC3',
                borderRadius: 'inherit',
              }}
              >
                <p>
                  <b>
                    {commits.length}
                    {' '}
                    commit(s)
                  </b>
                </p>
                <p>
                  <b>
                    {diffs.length}
                    {' '}
                    file(s) changed
                  </b>
                </p>
                <p><b>0 contributors</b></p>
              </div>
              <div>
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
                              projectId={selectedProject.id}
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
          )}
          {imagesToRender.map((imageFile) => (
            <ImageDiffSection key={imageFile.fileName} imageFile={imageFile} />
          ))}
        </div>
      </>
    );
  }
}

NewMergeRequest.propTypes = {
  projects: shape({
    selectedProject: shape({
      id: number.isRequired,
    }).isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      branch: string.isRequired,
    }),
  }).isRequired,
  branches: arrayOf(string).isRequired,
  users: arrayOf(
    shape({
      name: string.isRequired,
    }).isRequired,
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    users: state.users,
    projects: state.projects,
    branches: state.branches.map((branch) => branch.name),
  };
}

export default connect(mapStateToProps)(NewMergeRequest);

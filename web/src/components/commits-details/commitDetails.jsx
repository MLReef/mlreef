import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  number,
  string,
  arrayOf,
  shape,
  bool,
} from 'prop-types';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './commitDetails.css';
import arrowBlue from '../../images/arrow_down_blue_01.svg';
import triangle01 from '../../images/triangle-01.png';
import CommitsApi from '../../apis/CommitsApi';

const imageFormats = [
  '.png',
  '.jpg',
];

class CommitDetails extends Component {
  constructor(props) {
    super(props);
    const { users } = this.props;
    this.state = {
      commits: {},
      users,
      imagesToRender: [],
    };
    const { match } = this.props;
    const { projectId, commitId } = match.params;
    CommitsApi.getCommitDetails(projectId, commitId)
      .then((response) => {
        this.setState({ commits: response });
        CommitsApi
          .getCommitDiff(projectId, commitId)
          .then(
            (res) => this.getDiffDetails(res),
          )
          .catch(
            (err) => err,
          );
      })
      .catch((err) => err);
  }

  getDiffDetails(diffsArray) {
    const { commits } = this.state;
    const { match } = this.props;
    const { projectId } = match.params;
    diffsArray.filter((diff) => imageFormats
      .filter((format) => diff.old_path.includes(format))
      .length > 0)
      .forEach(async (imageDiff) => {
        const { imagesToRender } = this.state;
        let previousImage;
        if (!imageDiff.new_file) {
          previousImage = await CommitsApi.getFileDataInCertainCommit(
            projectId,
            encodeURIComponent(
              imageDiff.old_path,
            ), commits.parent_ids[0],
          );
        }
        let nextImage;
        if (!imageDiff.deleted_file) {
          nextImage = await CommitsApi.getFileDataInCertainCommit(
            projectId,
            encodeURIComponent(
              imageDiff.old_path,
            ), commits.id,
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

  aprox = (floatValue) => Math.floor(floatValue);

  render() {
    const { projects } = this.props;
    const proj = projects.selectedProject;
    const {
      commits,
      users,
      imagesToRender,
    } = this.state;
    const commitId = commits.short_id;
    let avatar = 'https://assets.gitlab-static.net/uploads/-/system/user/avatar/3839940/avatar.png';
    users.forEach((contributor) => {
      if (contributor.name === commits.author_name) {
        avatar = contributor.avatar_url;
      }
    });
    return (
      <div id="commits-view-container">
        <Navbar />
        <ProjectContainer project={proj} activeFeature="data" folders={['Group Name', proj.name, 'Data', 'Commits', commits.short_id]} />
        <br />
        <br />
        <div className="main-content">
          <div className="wrapper">
            <span className="commit-information">
              <span className="commit-authored">
                Commit
                {' '}
                <b>{commitId}</b>
                {' '}
                authored 4 days ago by
              </span>
              <div className="committer-pic">
                <img src={avatar} alt="avatar" />
              </div>
              <span className="author"><b>{commits.author_name}</b></span>
            </span>
            <div className="other-options">
              <div className="btn">
                <a href="#foo">
                  <b>Browse Files</b>
                </a>
              </div>
              <div className="btn">
                <a href="#foo">
                  <b>Options</b>
                  <img className="dropdown-white" src={arrowBlue} alt="" />
                </a>
              </div>
            </div>
          </div>
          <hr />
          <div className="commit-message">
            <span><b>Commit message</b></span>
            <div className="messages">
              <span>{commits.message}</span>
              <span>More info coming up</span>
            </div>
          </div>
          <hr />
          <p className="stats">
            Showing
            {' '}
            {commits.stats ? commits.stats.total : 0}
            {' '}
            files changed with
            <span className="addition">
              {' '}
              {commits.stats ? commits.stats.additions : 0}
              {' '}
              additions
            </span>
            {' '}
            and
            <span className="deleted">
              {' '}
              {commits.stats ? commits.stats.deletions : 0}
              {' '}
              deletions
            </span>
            .
          </p>
          {imagesToRender.map((imageFile) => (
            <div key={imageFile.fileName}>
              <div className="commit-per-date">
                <div className="pipeline-modify-details">
                  <div style={{ flex: '1', padding: '1em' }}>
                    <span id="image-modified-name">{imageFile.fileName}</span>
                    <span>
                      {imageFile.nextImage ? '+' : '-'}
                      {
                        this.aprox((imageFile.nextImage
                          ? imageFile.nextImage.byteLength
                          : imageFile.previousImage.byteLength) / 1000)
                      }
                      MB
                    </span>
                  </div>
                  <div className="filechange-info">
                    <div className="btn btn-background">
                      <a href="#foo">
                        <img className="dropdown-white" src={triangle01} alt="" />
                      </a>
                    </div>
                    <div className="btn btn-background">
                      <a href="#foo">
                        <b>Copy Path</b>
                      </a>
                    </div>
                    <div className="btn btn-background">
                      <a href="#foo">
                        <b>View Files</b>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="image-display">
                  {imageFile.previousImage && (
                    <div>
                      <span>Source File</span>
                      <img
                        id={`deleted-${imageFile.fileName}`}
                        src={`data:image/png;base64,${Base64ToArrayBuffer.encode(imageFile.previousImage)}`}
                        alt="previousImage"
                      />
                    </div>
                  )}
                  {imageFile.nextImage && (
                    <div>
                      <span className="addition">Added</span>
                      <img
                        id={`added-${imageFile.fileName}`}
                        src={`data:image/png;base64,${Base64ToArrayBuffer.encode(imageFile.nextImage)}`}
                        alt="nextImage"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    projects: state.projects,
    users: state.users,
  };
}

const project = shape(
  {
    id: number,
    description: string,
    name: string,
    avatar_url: string,
    star_count: number,
    forks_count: number,
  },
);

CommitDetails.propTypes = {
  users: arrayOf(shape(
    {
      id: number,
      name: string,
      username: string,
      state: string,
      avatar_url: string,
      web_url: string,
    },
  )).isRequired,
  match: shape({
    path: string,
    url: string,
    isExact: bool,
    params: shape({
      projectId: string,
      commitId: string,
    }),
  }).isRequired,
  projects: shape({
    all: arrayOf(project),
    selectedProject: project,
  }).isRequired,
};
export default connect(mapStateToProps)(CommitDetails);

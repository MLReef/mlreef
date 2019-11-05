import React from 'react';
import './fileView.css';
import { connect } from 'react-redux';
import { Base64 } from 'js-base64';
import ProjectContainer from '../projectContainer';
import CommitsApi from '../../apis/CommitsApi';
import Navbar from '../navbar/navbar';
import file_01 from '../../images/file_01.svg';
import arrow_blue from '../../images/arrow_down_blue_01.svg';
import filesApi from '../../apis/FilesApi';

class FileView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: this.props.projects.selectedProject,
      committer: [],
      fileData: null,
    };

    filesApi.getFileData(
      this.props.match.params.projectId,
      this.props.match.params.file,
      this.props.match.params.branch,
    ).then((res) => this.setState({ fileData: res }));
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {

    };
  }

  getCommit() {
    const { projectId } = this.props.match.params;
    CommitsApi.getCommitDetails(projectId, this.state.fileData.last_commit_id)
      .then((result) => this.setState({ committer: result }));
  }

  render() {
    const { project } = this.state;
    const { committer } = this.state;
    let fileName = null;
    let fileSize = null;
    let fileContent = [];
    let filepath = [];
    let extension;

    if (this.state.fileData) {
      this.getCommit();
      fileName = this.state.fileData.file_name;
      fileSize = this.state.fileData.size;
      fileContent = Base64.decode(this.state.fileData.content).split('\n');
      extension = fileName.split('.').pop();
      filepath = this.state.fileData.file_path.split('/');
    }

    return (
      <div>
        <Navbar />
        <ProjectContainer
          project={project}
          activeFeature="data"
          folders={['Group Name', project.name, 'Data']}
        />
        <div className="branch-path">
          <div className="branch-btn">
            <a href="#f00">
              Master
              <img className="dropdown-white" src={arrow_blue} alt="" />
            </a>
          </div>
          <span className="filepath">
            <b>
              <a href="/home">{project.name}</a>
              {' '}
/
              {filepath.map((path, i) => (filepath.length === i + 1 ? (
                <span key={i}>{path}</span>
              ) : (
                <span key={i}>
                  <a href="#foo">
                    {path}
                    {' '}
                  </a>
/
                </span>
              )))}
            </b>
          </span>
        </div>
        <div className="commit-container">
          <div className="file-container-header">
            <div className="commit-info">
              <div className="commit-pic-circle" />
              <div className="commit-msg">
                <p>{committer.message}</p>
                <span>
                  by
                  {' '}
                  <b>{committer.author_name}</b>
                  {' '}
authored
                  {' '}
                  <b>4</b>
                  {' '}
days ago
                </span>
              </div>
            </div>
            <div className="commit-code">
              <span>{committer.short_id}</span>
              <img className="file-icon" src={file_01} alt="" />
            </div>
          </div>
          <div className="contributors">
            <p>
              <b>3 Contributors</b>
            </p>
            <div className="contributor-list">
              <div className="commit-pic-circle" />
              <div className="commit-pic-circle" />
              <div className="commit-pic-circle" />
            </div>
          </div>
        </div>

        <div className="file-container">
          <div className="file-container-header">
            <div className="file-info">
              <p>
                {fileName}
                {' '}
|
                {fileSize}
                {' '}
Bytes
              </p>
            </div>
            <div className="wrapper">
              <div className="file-actions">
                <button type="button" className="white-button">History</button>
                <button type="button" className="white-button">Replace</button>
                <button type="button" className="red-button">Delete</button>
              </div>
            </div>
          </div>
          <div
            itemProp="text"
            className="Box-body p-0 blob-wrapper data type-text"
          >
            <div className="file-content">
              {extension === 'jpg' || extension === 'png' ? (
                <div>
                  <img
                    className="file-img"
                    src={`data:image/png;base64,${this.state.fileData.content}`}
                    alt={fileName}
                  />
                </div>
              ) : (
                <table>
                  <tbody>
                    {fileContent.map((line, index) => (
                      <tr key={index}>
                        <td>
                          <p>{line}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    projects: state.projects,
  };
}

export default connect(
  mapStateToProps,
)(FileView);

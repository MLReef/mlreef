import React from 'react';
import ReactMarkdown from 'react-markdown';
import './readme.css';
import { Base64 } from 'js-base64';
import filesApi from '../../apis/FilesApi';

class ReadMeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: this.props.project,
      fileData: null,
    };
  }

  componentDidMount() {
    filesApi.getFileData(
      this.props.project.id,
      'README.md',
      this.props.branch,
    )
      .then(
        (res) => this.setState({ fileData: res }),
      );
  }

  render() {
    const projectName = this.state.project.name;
    let textContent;
    if (!this.state.fileData) {
      return null;
    }

    if (this.state.fileData.content) {
      textContent = Base64.decode(this.state.fileData.content);
    }
    return (
      <div className="readme-container">
        <div className="readme-titlebar">
          <div className="readme-profile-pic" />
          <div className="readme-name">
            <p id="readmeName"><b>README.md</b></p>
          </div>
        </div>

        <div className="readme-content-container readme-style">
          <div className="readme-content">
            <p id="project-name-readme">{projectName}</p>
            <ReactMarkdown id="project-content-readme" source={textContent && textContent} />
          </div>
        </div>
      </div>
    );
  }
}

export default ReadMeComponent;

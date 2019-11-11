import React from 'react';
import { string, number } from 'prop-types';
import ReactMarkdown from 'react-markdown';
import './readme.css';
import { Base64 } from 'js-base64';
import filesApi from '../../apis/FilesApi';

class ReadMeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileData: null,
    };
  }

  componentDidMount() {
    const { projectId, branch } = this.props;
    filesApi.getFileData(
      projectId,
      'README.md',
      branch,
    )
      .then(
        (res) => this.setState({ fileData: res }),
      );
  }

  render() {
    const { projectName } = this.props;
    const { fileData } = this.state;
    let textContent;
    if (!fileData) {
      return null;
    }

    if (fileData.content) {
      textContent = Base64.decode(fileData.content);
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

ReadMeComponent.propTypes = {
  projectName: string.isRequired,
  projectId: number.isRequired,
  branch: string.isRequired,
};

export default ReadMeComponent;

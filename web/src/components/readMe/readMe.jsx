import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { string, number } from 'prop-types';
import ReactMarkdown from 'react-markdown';
import './readme.css';
import { Base64 } from 'js-base64';
import FilesApi from '../../apis/FilesApi.ts';

const ReadMeComponent = ({ projectId, projectName, branch }) => {
  const [textContent, setTextContent] = useState('');
  useEffect(() => {
    const filesApi = new FilesApi();
    filesApi.getFileData(
      projectId,
      'README.md',
      branch,
    )
      .then((res) => setTextContent(Base64.decode(res.content)))
      .catch(() => toastr.error('Error', 'An error occurred recovering your readme'));
  }, [projectId, branch]);
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
          <ReactMarkdown id="project-content-readme" source={textContent} />
        </div>
      </div>
    </div>
  );
}

ReadMeComponent.propTypes = {
  projectName: string.isRequired,
  projectId: number.isRequired,
  branch: string.isRequired,
};

export default ReadMeComponent;

import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { string, number } from 'prop-types';
import ReactMarkdown from 'react-markdown';
import './Readme.scss';
import { Base64 } from 'js-base64';
import FilesApi from '../../apis/FilesApi.ts';

const filesApi = new FilesApi();

const Readme = ({ projectId, branch }) => {
  const [textContent, setTextContent] = useState('');
  useEffect(() => {
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
          <p><b>README.md</b></p>
        </div>
      </div>

      <div className="file-preview md">
        <ReactMarkdown source={textContent} />
      </div>
    </div>
  );
};

Readme.defaultProps = {
  projectId: null,
  branch: '',
};

Readme.propTypes = {
  projectId: number,
  branch: string,
};

export default Readme;

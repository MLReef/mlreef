import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { string, number } from 'prop-types';
import ReactMarkdown from 'react-markdown/with-html';
import './Readme.scss';
import { Base64 } from 'js-base64';
import FilesApi from 'apis/FilesApi.ts';

const filesApi = new FilesApi();

const Readme = (props) => {
  const {
    projectId,
    branch,
    readmeUrl,
  } = props;

  const [textContent, setTextContent] = useState('');
  useEffect(() => {
    const splittedReadmeFileName = readmeUrl.split('/');
    filesApi.getFileData(
      projectId,
      splittedReadmeFileName[splittedReadmeFileName.length - 1],
      branch,
    )
      .then((res) => setTextContent(Base64.decode(res.content)))
      .catch((error) => toastr.error('Error', error.message));
  }, [projectId, branch, readmeUrl]);

  const modifyImageSource = (input) => {
    if (/^https?:/.test(input)) {
      return input;
    }
    return `/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(input)}/raw?ref=${branch}`;
  };

  return (
    <div className="readme-container">
      <div className="readme-titlebar">
        <div className="readme-name">
          <p><b>README.md</b></p>
        </div>
      </div>

      <div className="file-preview md">
        <ReactMarkdown
          source={textContent}
          escapeHtml={false}
          transformImageUri={(uri) => modifyImageSource(uri)}
        />
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
  readmeUrl: string.isRequired,
};

export default Readme;

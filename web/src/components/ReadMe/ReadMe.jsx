import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { string, number } from 'prop-types';
import ReactMarkdown from 'react-markdown/with-html';
import './Readme.scss';
import { Base64 } from 'js-base64';
import { getRootUrl } from 'apis/apiHelpers';
import FilesApi from '../../apis/FilesApi.ts';

const filesApi = new FilesApi();

const Readme = ({ projectId, branch, namespace, slug }) => {
  const [textContent, setTextContent] = useState('');
  useEffect(() => {
    filesApi.getFileData(
      projectId,
      'README.md',
      branch,
    )
      .then((res) => setTextContent(Base64.decode(res.content)))
      .catch((error) => toastr.error('Error', error.message));
  }, [projectId, branch]);

  const modifyImageSource = (input) => {
    const relToAbsPath = new URL(input, `${getRootUrl()}:10080/${namespace}/${slug}/raw/${branch}/`).href;
    if (/^https?:/.test(input)) {
      return input;
    }
    return relToAbsPath;
  };

  return (
    <div className="readme-container">
      <div className="readme-titlebar">
        <div className="readme-profile-pic" />
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
  namespace: '',
  slug: '',
};

Readme.propTypes = {
  projectId: number,
  branch: string,
  namespace: string,
  slug: string,
};

export default Readme;

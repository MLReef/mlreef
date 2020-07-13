import React from 'react';
import * as PropTypes from 'prop-types';
// monaco-editor is needed to language highlighting
import 'monaco-editor';
import { MonacoDiffEditor } from 'react-monaco-editor';
import { getLanguageByExt } from 'functions/dataParserHelpers';
import './codeDiffSection.css';

const CodeDiffSection = (props) => {
  const {
    fileInfo: {
      fileName,
      sizeDeleted,
      sizeAdded,
    },
    original,
    modified,
    onReset,
  } = props;

  const options = {
    readOnly: true,
  };

  const ext = fileName.split('.').pop();

  const checkIntegrity = ({ editor }) => {
    const models = editor.getModels();

    if (!models.length) {
      setTimeout(() => {
        onReset();
      }, 1000);
    }
  };

  return (
    <div className="diff-container">
      <div className="file-name-section">
        <span>{fileName}</span>
        <span>
          {`- ${Math.floor(sizeDeleted)} bytes`}
        </span>
        <span>
          {`+ ${Math.floor(sizeAdded)} bytes`}
        </span>
      </div>
      <MonacoDiffEditor
        height="600"
        language={getLanguageByExt(ext)}
        original={original}
        value={modified}
        editorWillMount={checkIntegrity}
        options={options}
      />
    </div>
  );
};

CodeDiffSection.defaultProps = {
  original: '',
  modified: '',
  onReset: () => {},
};

CodeDiffSection.propTypes = {
  fileInfo: PropTypes.shape({
    fileName: PropTypes.string.isRequired,
    sizeDeleted: PropTypes.number.isRequired,
    sizeAdded: PropTypes.number.isRequired,
  }).isRequired,
  original: PropTypes.string,
  modified: PropTypes.string,
  onReset: PropTypes.func,
};

export default CodeDiffSection;

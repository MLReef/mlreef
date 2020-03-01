import React, { Component, createRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import './codeDiffSection.css';
import { shape, string } from 'prop-types';

class CodeDiffSection extends Component {
  containerRef = createRef();

  componentDidMount() {
    this.createDiffEditor();
  }

  createDiffEditor() {
    const { fileToRender } = this.props;
    // TODO: replace text/plain by the real language
    const originalModel = monaco.editor.createModel(
      fileToRender.previousVersionFileParsed || '', 'text/plain',
    );
    const modifiedModel = monaco.editor.createModel(fileToRender.nextVersionFileParsed || '', 'text/plain');

    const diffEditor = monaco.editor.createDiffEditor(
      this.containerRef.current,
      { readOnly: true },
    );
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  }

  render() {
    const {
      fileToRender: {
        fileName,
        sizeDeleted,
        sizeAdded,
      },
    } = this.props;
    return (
      <div className="diff-container">
        <div className="file-name-section">
          <span>{fileName}</span>
          <span>
            {'-'}
            {Math.floor(sizeDeleted)}
            bytes
          </span>
          <span>
            {'+'}
            {Math.floor(sizeAdded)}
            bytes
          </span>
        </div>
        <div
          className="diff-section"
          ref={this.containerRef}
        />
      </div>
    );
  }
}

CodeDiffSection.propTypes = {
  fileToRender: shape({
    fileName: string.isRequired,
    previousVersionFileParsed: string,
    nextVersionFileParsed: string,
  }).isRequired,
};

export default CodeDiffSection;

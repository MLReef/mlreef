import React from 'react';
import 'monaco-editor';
import MonacoEditor from 'react-monaco-editor';
import { string } from 'prop-types';

const languagesPerExtensions = {
  js: 'javascript',
  ts: 'typescript',
  json: 'json',
  py: 'python',
  java: 'java',
  txt: 'txt',
  css: 'css',
  htm: 'html',
  html: 'html',
};

const MCodeRenderer = ({ code, fileExtension, theme, height }) => (
  <MonacoEditor
    width="100%"
    height={height}
    language={languagesPerExtensions[fileExtension]}
    theme={theme}
    value={code}
    options={{ readOnly: true }}
    onChange={() => {}}
    editorDidMount={(editor) => {
      editor.focus();
    }}
    editorWillMount={() => {}}
  />
);

MCodeRenderer.propTypes = {
  code: string.isRequired,
  fileExtension: string,
  theme: string,
  height: string,
};

MCodeRenderer.defaultProps = {
  fileExtension: 'txt',
  theme: 'vs',
  height: '600',
};

export default MCodeRenderer;

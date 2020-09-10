import React, { Suspense } from 'react';
import { string } from 'prop-types';

const MonacoEditor = React.lazy(() => import('react-monaco-editor'));

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
  <Suspense fallback={<div>Loading...</div>}>
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
  </Suspense>
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

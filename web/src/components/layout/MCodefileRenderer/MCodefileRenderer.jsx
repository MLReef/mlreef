import React, { Suspense } from 'react';
import { func, shape, string } from 'prop-types';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';

const MonacoEditor = React.lazy(() => import('customImports/MonacoEditor'));

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

const MCodeRenderer = ({
  code, fileExtension, theme, height, onChange, options,
}) => (
  <Suspense fallback={(
    <div className="d-flex w-100" style={{ justifyContent: 'center' }}>
      <MLoadingSpinner />
    </div>
  )}
  >
    <MonacoEditor
      width="100%"
      height={height}
      language={languagesPerExtensions[fileExtension]}
      theme={theme}
      value={code}
      options={{ ...options }}
      onChange={(val) => onChange(val)}
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
  onChange: func,
  options: shape({}),
};

MCodeRenderer.defaultProps = {
  fileExtension: 'txt',
  theme: 'vs',
  height: '600',
  onChange: () => {},
  options: { readOnly: true },
};

export default MCodeRenderer;

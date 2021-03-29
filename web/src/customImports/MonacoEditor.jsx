import React, { Suspense } from 'react';

let Monaco;

try {
  Monaco = React.lazy(() => import('react-monaco-editor'));
} catch (error) {
  console.error(error);
}
require('monaco-editor');

const MonacoEditor = (props) => (
  <Suspense fallback={<div>...</div>}>
    {/* eslint-disable-next-line */}
    <Monaco {...props} />
  </Suspense>
);

export default MonacoEditor;

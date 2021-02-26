import React, { Suspense } from 'react';

const Monaco = React.lazy(() => import('react-monaco-editor'));
require('monaco-editor');

const MonacoEditor = (props) => (
  <Suspense fallback={<div>...</div>}>
    {/* eslint-disable-next-line */}
    <Monaco {...props} />
  </Suspense>
);

export default MonacoEditor;

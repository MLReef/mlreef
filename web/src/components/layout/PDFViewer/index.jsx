import React from 'react';
import { SpecialZoomLevel, Viewer } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { searchPlugin } from '@react-pdf-viewer/search';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

const base64toBlob = (bytes) => {
  let length = bytes.length;
  let out = new Uint8Array(length);

  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }

  return new Blob([out], { type: 'application/pdf' });
};


const PDFViewer = ({ data }) => {
  const blob = base64toBlob(data);
  const url = URL.createObjectURL(blob);
  const searchPluginInstance = searchPlugin({
    keyword: '',
  });
  const { ShowSearchPopoverButton } = searchPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();

  const { CurrentPageInput, GoToFirstPageButton, GoToLastPageButton, GoToNextPageButton, GoToPreviousPage } =
    pageNavigationPluginInstance;

  return (
    <div
      className="rpv-core__viewer"
      style={{
        border: '1px solid rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        height: '750px',
        width: '100%',
      }}
    >

      <div
        style={{
          alignItems: 'center',
          backgroundColor: '#eeeeee',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          padding: '4px',
        }}
      >
        <div style={{ padding: '0px 2px' }}>
          <GoToFirstPageButton />
        </div>
        <div style={{ padding: '0px 2px' }}>
          <GoToPreviousPage />
        </div>
        <div style={{ padding: '0px 2px' }}>
          <CurrentPageInput />
        </div>
        <div style={{ padding: '0px 2px' }}>
          <GoToNextPageButton />
        </div>
        <div style={{ padding: '0px 2px' }}>
          <GoToLastPageButton />
        </div>
      </div>
      <div
        style={{
          alignItems: 'center',
          backgroundColor: '#eeeeee',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          padding: '4px',
        }}
      >
        <ShowSearchPopoverButton />
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Viewer
          fileUrl={url}
          plugins={[searchPluginInstance, pageNavigationPluginInstance]}
          defaultScale={SpecialZoomLevel.PageWidth}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
import React, { useCallback, useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import MCodeRenderer from 'components/layout/MCodefileRenderer/MCodefileRenderer';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import { Base64 } from 'js-base64';
import './DataOperatorCodeSection.scss';
import useLoading from 'customHooks/useLoading';
import actions from './actionsAndFunction';

const DataOperatorCodeSection = (props) => {
  const {
    processor,
    commitSha,
    gid,
    entryPointPath,
  } = props;

  const { nameSpace, slug } = processor;

  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [fileInfo, setFileInfo] = useState({});

  const apiCallBack = useCallback(() => {
    if (typeof gid !== 'undefined' 
      && typeof commitSha !== 'undefined' 
      && typeof entryPointPath !== 'undefined'
    ) {
      return actions
        .getEntryPointFileInfo(gid, commitSha, entryPointPath)
        .then((fi) => {
          setFileInfo(fi);
        })
        .catch((err) => toastr.error('Error', err?.message));
    }
    return new Promise((resolve) => resolve({}));
  }, [gid, commitSha, entryPointPath]);

  const [isLoading, executeCall] = useLoading(apiCallBack);

  useEffect(() => {
    if (isCodeVisible && !fileInfo.content) {
      executeCall();
    }
  }, [isCodeVisible, fileInfo]);
  return (
    <div className="sortable-data-operation-list-item-form-container-code">
      <div className="d-flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          id="open-code-section"
          className="btn btn-dark btn-label"
          type="button"
          onClick={() => setIsCodeVisible(!isCodeVisible)}
        >
          {isCodeVisible ? 'Hide' : 'See'}
          {' '}
          code
        </button>
        {nameSpace && (
        <a style={{ color: 'var(--info)', fontWeight: 'bold' }} href={`/${nameSpace}/${slug}`} target="_blank" rel="noopener noreferrer">View Repository</a>
        )}
      </div>
      {isCodeVisible && (
        <div className="sortable-data-operation-list-item-form-container-code-div">
          {isLoading ? (
            <div className="d-flex" style={{ justifyContent: 'center' }}>
              <MLoadingSpinner active />
            </div>
          ) : (
            <div className="sortable-data-operation-list-item-form-container-code-div-content">
              <div className="sortable-data-operation-list-item-form-container-code-div-content-f-info">
                <p id="first-part">
                  Viewing
                </p>
                <p id="file-name">
                  {` ${fileInfo.file_name}`}
                </p>
              </div>
              <MCodeRenderer code={Base64.decode(fileInfo.content || '')} fileExtension="py" theme="vs-dark" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataOperatorCodeSection;

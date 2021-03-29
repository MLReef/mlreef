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
  } = props;

  const { nameSpace, slug } = processor;

  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [fileCode, setCode] = useState('');

  const apiCallBack = useCallback(() => actions
    .getEntryPointFileCode(processor.codeProjectId)
    .then((fileInfo) => setCode(Base64.decode(fileInfo.content)))
    .catch((err) => toastr.error('Error', err?.message)), [processor]);

  const [isLoading, executeCall] = useLoading(apiCallBack);

  useEffect(() => {
    if (isCodeVisible && fileCode === '') {
      executeCall();
    }
  }, [isCodeVisible, fileCode]);
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
          <a m-2 style={{ color: 'var(--info)', fontWeight: 'bold' }} href={`/${nameSpace}/${slug}`} target="_blank" rel="noopener noreferrer">View Repository</a>
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
              <MCodeRenderer code={fileCode} fileExtension="py" theme="vs-dark" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataOperatorCodeSection;

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import './FilesSelector.scss';
import { DataPipelinesContext } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import { SET_IS_VISIBLE_FILES_MODAL } from 'components/views/PipelinesExecutionView/DataPipelineHooks/actions';

const FilesSelector = (props) => {
  const {
    className,
    buttonLabel,
    instructions,
  } = props;
  const [{
    branchSelected: branch,
    initialInformation: { initialFiles },
    filesSelectedInModal,
    isVisibleSelectFilesModal,
  }, dispatch] = useContext(DataPipelinesContext);
  const files = initialFiles.lenth > 0 || filesSelectedInModal;

  function handleSelectData() {
    dispatch({
      type: SET_IS_VISIBLE_FILES_MODAL,
      isVisibleSelectFilesModal: !isVisibleSelectFilesModal,
    });
  }

  return (
    <div
      className={`${className} files-selector tutorial-data`}
      style={{ height: files.length === 0 ? '80vh' : 'max-content' }}
    >
      {files.length === 0 && (
        <div className="files-selector-image-container">
          <img src="/images/svg/PipelineStep01.svg" alt="" />
        </div>
      )}
      <div className="data-button-container d-flex">
        {files.length === 0 && (
          <button
            type="button"
            tabIndex="0"
            id="select-data-btn"
            className="btn btn-primary"
            onClick={handleSelectData}
            onKeyDown={handleSelectData}
          >
            {buttonLabel}
          </button>
        )}
      </div>
      {files.length === 0 ? (
        <div className="files-selector-instruction">
          {instructions}
        </div>
      ) : (
        <div className="files-selector-data px-3 d-flex tutorial-data-loaded">
          <div className="mr-auto d-flex" style={{ alignItems: 'center' }}>
            <div className="mr-4">
              <p>Data: </p>
            </div>
            <div>
              <p>
                Branch:
                {'  '}
                <b>
                  {branch}
                </b>
              </p>
              <p>
                Path:
                {'  '}
                <b>
                  {files[0].location || files[0].path}
                </b>
              </p>
            </div>

          </div>
          <button
            type="button"
            className="files-selector-data-button-select btn btn-hidden mr-0"
            onClick={handleSelectData}
          >
            <b>
              Select different files
            </b>
          </button>
        </div>
      )}
    </div>
  );
};
FilesSelector.defaultProps = {
  instructions: (
    <p>
      Start by selecting your data file(s) you want to include
      <br />
      in your data visualization.
    </p>
  ),
  className: '',
  buttonLabel: 'Select input path',
};

FilesSelector.propTypes = {
  className: PropTypes.string,
  buttonLabel: PropTypes.string,
  instructions: PropTypes.node,
};

export default FilesSelector;

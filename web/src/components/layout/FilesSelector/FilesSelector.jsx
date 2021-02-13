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
    <div className={`${className} files-selector tutorial-data`}>
      {files.length === 0 ? (
        <div className="instruction">
          {instructions}
        </div>
      ) : (
        <div className="px-3 d-flex tutorial-data-loaded">
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
            className="btn btn-hidden mr-0"
            onClick={handleSelectData}
          >
            <b>
              Select different files
            </b>
          </button>
        </div>
      )}

      <div className="data-button-container mt-3 d-flex">
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
  buttonLabel: 'Select data',
};

FilesSelector.propTypes = {
  className: PropTypes.string,
  buttonLabel: PropTypes.string,
  instructions: PropTypes.node,
};

export default FilesSelector;

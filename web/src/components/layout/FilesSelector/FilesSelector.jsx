import React from 'react';
import PropTypes from 'prop-types';
import './FilesSelector.scss';

const FilesSelector = (props) => {
  const {
    className,
    buttonLabel,
    files,
    handleSelectData,
    instructions,
  } = props;

  return (
    <div className={`${className} files-selector`}>
      {files.length === 0 ? (
        <div className="instruction">
          {instructions}
        </div>
      ) : (
        <div className="px-3 d-flex">
          <div className="mr-auto">
            <b>
              {`Data: ${files.length} file(s) selected`}
            </b>
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
  files: [],
};

FilesSelector.propTypes = {
  className: PropTypes.string,
  buttonLabel: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.shape({})),
  handleSelectData: PropTypes.func.isRequired,
  instructions: PropTypes.node,
};

export default FilesSelector;

import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './MImageUpload.scss';

const MImageUpload = (props) => {
  const {
    className,
    setImage,
  } = props;

  const [file, setFile] = useState({});

  const handleChange = (e) => {
    const [recentFile] = e.target.files;

    if (recentFile) setFile(recentFile);
  };

  const removeFile = () => {
    setFile({});
  };

  useEffect(() => {
    setImage(file);
  }, [file]);

  return (
    <div className={cx('m-image-upload mt-2', className)}>
      <button type="button" className="m-image-upload-btn btn btn-outline-dark btn-sm">
        Choose a file
        <input onChange={handleChange} className="m-image-upload-input" type="file" />
      </button>
      <span className="m-image-upload-label ml-3">{file.name || 'No file chosen.'}</span>
      <div className="t-secondary mt-2">The maximum allowed is 5 MB.</div>
      {file.name && (
        <button onClick={removeFile} type="button" className="btn btn-sm btn-outline-danger mt-3">
          Remove avatar
        </button>
      )}
    </div>
  );
};

MImageUpload.defaultProps = {
  className: '',
};

MImageUpload.propTypes = {
  className: PropTypes.string,
  setImage: PropTypes.func.isRequired,
};

export default MImageUpload;

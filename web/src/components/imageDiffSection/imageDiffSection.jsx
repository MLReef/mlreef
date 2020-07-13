import React, { useState } from 'react';
import { shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import './ImageDiffSection.scss';

const ImageDiffSection = ({ fileInfo, original, modified }) => {
  const [widthPreviousFile, setWidthPreviousFile] = useState(0);
  const [heightPreviousFile, setHeightPreviousFile] = useState(0);
  const [widthNextFile, setWidthNextFile] = useState(0);
  const [heightNextFile, setHeightNextFile] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const previousFile = new Image();
  previousFile.src = `data:image/png;base64,${Base64ToArrayBuffer.encode(original)}`;
  previousFile.onload = () => {
    setWidthPreviousFile(previousFile.width);
    setHeightPreviousFile(previousFile.height);
  };
  const nextFile = new Image();
  nextFile.src = `data:image/png;base64,${Base64ToArrayBuffer.encode(modified)}`;
  nextFile.onload = () => {
    setWidthNextFile(nextFile.width);
    setHeightNextFile(nextFile.height);
  };
  const areBothVersionsTruty = modified
    && original;
  const maxWidth = areBothVersionsTruty ? '420px' : '800px';
  const imageStyles = {
    maxWidth,
    maxHeight: '400px',
  };
  return (
    <div
      className="image-diff-section"
      id="image-div-section-container"
      key={fileInfo.fileName}
    >
      <div className="commit-per-date">
        <div className="pipeline-modify-details">
          <div className="basic-information-image">
            <span id="image-modified-name">{fileInfo.fileName}</span>
            <span>
              {modified ? '+' : '-'}
              {Math.floor((modified
                ? modified.byteLength
                : original.byteLength) / 1000000)}
              MB
            </span>
          </div>
          <div className="filechange-info">
            <button
              type="button"
              className="btn btn-sm btn-basic-dark px-3 mr-2"
              onClick={() => setCollapsed(!collapsed)}
            >
              <i className={`fa fa-chevron-${collapsed ? 'down' : 'up'}`} />
            </button>
            <button type="button" className="btn btn-sm btn-basic-dark mr-2">
              Copy Path
            </button>
            <Link to="#foo" className="btn btn-sm btn-basic-dark">
              View File
            </Link>
          </div>
        </div>
        <div className={`image-display ${collapsed ? 'collapsed' : ''}`}>
          {original && (
          <div className="image-container m-3">
            <span className="t-center t-bold">Source file</span>
            <img
              style={imageStyles}
              src={previousFile.src}
              alt="previousImage"
              className="solid-border deleted my-2"
            />
            <div className="image-dimensions">
              <span className="t-secondary">
                {`W: ${widthPreviousFile} px`}
              </span>
              <span className="t-secondary">
                {`H: ${heightPreviousFile} px`}
              </span>
            </div>
          </div>
          )}
          {modified && (
          <div className="image-container m-3">
            <span className="t-center t-bold t-success">Added</span>
            <img
              style={imageStyles}
              src={nextFile.src}
              alt="nextImage"
              className="solid-border addition my-3"
            />
            <div className="image-dimensions">
              <span className="t-secondary">
                {`W: ${widthNextFile} px`}
              </span>
              <span className="t-secondary">
                {`H: ${heightNextFile} px`}
              </span>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

ImageDiffSection.defaultProps = {
  original: '',
  modified: '',
};

ImageDiffSection.propTypes = {
  fileInfo: shape({
    fileName: string.isRequired,
  }).isRequired,
  original: string,
  modified: string,
};

export default ImageDiffSection;

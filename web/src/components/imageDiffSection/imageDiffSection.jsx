import React, { useState } from 'react';
import { any, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import './ImageDiffSection.scss';

const ImageDiffSection = ({ imageFile }) => {
  const [widthPreviousFile, setWidthPreviousFile] = useState(0);
  const [heightPreviousFile, setHeightPreviousFile] = useState(0);
  const [widthNextFile, setWidthNextFile] = useState(0);
  const [heightNextFile, setHeightNextFile] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const previousFile = new Image();
  previousFile.src = `data:image/png;base64,${Base64ToArrayBuffer.encode(imageFile.previousVersionFileParsed)}`;
  previousFile.onload = () => {
    setWidthPreviousFile(previousFile.width);
    setHeightPreviousFile(previousFile.height);
  };
  const nextFile = new Image();
  nextFile.src = `data:image/png;base64,${Base64ToArrayBuffer.encode(imageFile.nextVersionFileParsed)}`;
  nextFile.onload = () => {
    setWidthNextFile(nextFile.width);
    setHeightNextFile(nextFile.height);
  };
  const areBothVersionsTruty = imageFile.nextVersionFileParsed
    && imageFile.previousVersionFileParsed;
  const maxWidth = areBothVersionsTruty ? '420px' : '800px';
  const imageStyles = {
    maxWidth,
    maxHeight: '400px',
  };
  return (
    <div
      className="image-diff-section"
      id="image-div-section-container"
      key={imageFile.fileName}
    >
      <div className="commit-per-date">
        <div className="pipeline-modify-details">
          <div className="basic-information-image">
            <span id="image-modified-name">{imageFile.fileName}</span>
            <span>
              {imageFile.nextVersionFileParsed ? '+' : '-'}
              {Math.floor((imageFile.nextVersionFileParsed
                ? imageFile.nextVersionFileParsed.byteLength
                : imageFile.previousVersionFileParsed.byteLength) / 1000000)}
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
          {imageFile.previousVersionFileParsed && (
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
          {imageFile.nextVersionFileParsed && (
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

ImageDiffSection.propTypes = {
  imageFile: shape({
    fileName: string.isRequired,
    nextVersionFileParsed: any,
    previousVersionFileParsed: any,
  }).isRequired,
};

export default ImageDiffSection;

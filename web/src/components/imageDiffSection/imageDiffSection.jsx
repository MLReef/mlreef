import React, { useState } from 'react';
import { any, shape, string } from 'prop-types';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import triangle01 from '../../images/triangle-01.png';
import './imageDiffSection.css';

const ImageDiffSection = ({ imageFile }) => {
  const [widthPreviousFile, setWidthPreviousFile] = useState(0);
  const [heightPreviousFile, setHeightPreviousFile] = useState(0);
  const [widthNextFile, setWidthNextFile] = useState(0);
  const [heightNextFile, setHeightNextFile] = useState(0);
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
    <div id="image-div-section-container" key={imageFile.fileName}>
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
            <div className="btn btn-background">
              <a href="#foo">
                <img className="dropdown-white" src={triangle01} alt="" />
              </a>
            </div>
            <div className="btn btn-background">
              <a href="#foo">
                <b>Copy Path</b>
              </a>
            </div>
            <div className="btn btn-background">
              <a href="#foo">
                <b>View Files</b>
              </a>
            </div>
          </div>
        </div>
        <div className="image-display">
          {imageFile.previousVersionFileParsed && (
          <div className="image-container">
            <span className="deleted">Deleted</span>
            <img
              style={imageStyles}
              src={previousFile.src}
              alt="previousImage"
              className="solid-border deleted"
            />
            <p className="image-dimensions">
              W:
              {widthPreviousFile}
              {' '}
              |
              {' '}
              H:
              {' '}
              {heightPreviousFile}
            </p>
          </div>
          )}
          {imageFile.nextVersionFileParsed && (
          <div className="image-container">
            <span className="addition">Added</span>
            <img
              style={imageStyles}
              src={nextFile.src}
              alt="nextImage"
              className="solid-border addition"
            />
            <p className="image-dimensions">
              W:
              {widthNextFile}
              {' '}
              |
              {' '}
              H:
              {' '}
              {heightNextFile}
            </p>
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

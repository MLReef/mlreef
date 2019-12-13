import React from 'react';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import triangle01 from '../images/triangle-01.png';

const ImageDiffSection = ({ imageFile }) => {
  return (
    <div key={imageFile.fileName}>
      <div className="commit-per-date">
        <div className="pipeline-modify-details">
          <div style={{ flex: '1', padding: '1em' }}>
            <span id="image-modified-name">{imageFile.fileName}</span>
            <span>
              {imageFile.nextImage ? '+' : '-'}
              {Math.floor((imageFile.nextImage
                ? imageFile.nextImage.byteLength
                : imageFile.previousImage.byteLength) / 1000)
              }
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
          {imageFile.previousImage && (
          <div>
            <span>Source File</span>
            <img
              id={`deleted-${imageFile.fileName}`}
              src={`data:image/png;base64,${Base64ToArrayBuffer.encode(imageFile.previousImage)}`}
              alt="previousImage"
            />
          </div>
          )}
          {imageFile.nextImage && (
          <div>
            <span className="addition">Added</span>
            <img
              id={`added-${imageFile.fileName}`}
              src={`data:image/png;base64,${Base64ToArrayBuffer.encode(imageFile.nextImage)}`}
              alt="nextImage"
            />
          </div>
          )}
        </div>
      </div>
    </div>
)};

export default ImageDiffSection;

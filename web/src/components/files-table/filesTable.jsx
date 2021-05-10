import React from 'react';
// import { useParams } from 'react-router-dom';
import {
  arrayOf, shape, string, func, bool,
} from 'prop-types';
import { MLoadingSpinnerContainer } from 'components/ui/MLoadingSpinner';
import ReturnLink from '../returnLink';
import './filesTable.css';

const folderIcon = '/images/svg/folder_01.svg';
const fileIcon = '/images/svg/file_01.svg';

const FilesTable = (props) => {
  const {
    files,
    headers,
    onClick,
    isReturnOptVisible,
    waiting,
  } = props;

  const getBack = () => window.history.back();

  return (
    <MLoadingSpinnerContainer cover className="file-properties-spinner" active={waiting}>

      <table className="file-properties">
        <thead>
          <tr className="title-row">
            {headers.map((header, headerIndex) => {
              const paddingLeft = headerIndex === 0 ? '1.2em' : '0em';
              return (
                <th key={`tableHeader ${header}`}>
                  <p style={{ paddingLeft }}>{header}</p>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isReturnOptVisible && <ReturnLink getBack={getBack} />}
          {files.length >= 100 && (
            <div data-test="warning" className="m-alert warning">
              <i className="fas fa-exclamation-triangle ml-2 mr-3" />
              <span>
                Too many items to show. To preserve performance only 100 items are displayed.
              </span>
            </div>
          )}
          {files.map((file) => (
            <tr key={`${file.id}-${file.name}`} id={file.id} data-testid={file.id} className="files-row clickable" data-key={file.type} onClick={onClick}>
              {Object.keys(file).filter((key) => key !== 'id' && key !== 'type').map((k, keyIndex) => (
                <td
                  key={`column-name-${k}`}
                  className="icon-container-column"
                  style={{ maxWidth: '80vw' }}
                >
                  {keyIndex === 0 && (
                  <div>
                    <img src={file.type === 'tree' ? folderIcon : fileIcon} alt="" />
                  </div>
                  )}
                  <div>
                    <p>{file[k]}</p>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </MLoadingSpinnerContainer>

  );
};

FilesTable.defaultProps = {
  waiting: false,
};

FilesTable.propTypes = {
  files: arrayOf(shape({
    id: string, // it's not included anymore
    name: string.isRequired,
  })).isRequired,
  headers: arrayOf(string).isRequired,
  isReturnOptVisible: bool,
  onClick: func,
  waiting: bool,
};

FilesTable.defaultProps = {
  isReturnOptVisible: false,
  onClick: () => {},
};

export default FilesTable;

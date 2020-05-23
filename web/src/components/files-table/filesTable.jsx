import React from 'react';
// import { useParams } from 'react-router-dom';
import PropTypes, {
  arrayOf, shape, string, func,
} from 'prop-types';
import ReturnLink from '../returnLink';
import folderIcon from '../../images/folder_01.svg';
import fileIcon from '../../images/file_01.svg';
import './filesTable.css';

const FilesTable = (props) => {
  const {
    files,
    headers,
    onClick,
    isReturnOptVisible,
  } = props;

  let tableColumnsWidth = 25;
  if (headers.length > 1) {
    tableColumnsWidth = 100 / headers.length;
  }

  const getBack = () => window.history.back();

  return (
    <table className="file-properties">
      <thead>
        <tr className="title-row">
          {headers.map((header, headerIndex) => {
            const paddingLeft = headerIndex === 0 ? '1.2em' : '0em';
            return (
              <th key={`tableHeader ${header}`} style={{ width: `${tableColumnsWidth}%` }}>
                <p style={{ paddingLeft }}>{header}</p>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {isReturnOptVisible && <ReturnLink getBack={getBack} />}
        {files.map((file) => (
          <tr key={file.id} id={file.id} className="files-row clickable" data-key={file.type} onClick={onClick}>
            {Object.keys(file).filter((key) => key !== 'id' && key !== 'type').map((k, keyIndex) => (
              <td
                key={`column-name-${k}`}
                className="icon-container-column"
                style={{ width: `${tableColumnsWidth}%` }}
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
  );
};

FilesTable.propTypes = {
  files: arrayOf(shape({
    id: string.isRequired,
  })).isRequired,
  headers: arrayOf(string).isRequired,
  isReturnOptVisible: PropTypes.bool,
  onClick: func,
};

FilesTable.defaultProps = {
  isReturnOptVisible: false,
  onClick: () => {},
};

export default FilesTable;

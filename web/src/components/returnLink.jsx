import React from 'react';
import folderIcon from '../images/folder_01.svg';

export default (getBack) => (
  window.location.href.includes('path') ? (
    <tr className="files-row">
      <td className="return-button">
        <button
          type="button"
          onClick={getBack}
          style={{ padding: '0' }}
        >
          <img src={folderIcon} alt="" />
        </button>
        <button
          type="button"
          onClick={getBack}
        >
          ..
        </button>
      </td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
  )
    : null);

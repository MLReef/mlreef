import React from 'react';

const folderIcon = '/images/svg/folder_01.svg';

export default ({ getBack }) => (
  <tr className="files-row">
    <td className="return-button" onClick={getBack}>
      <button
        type="text"
        style={{ padding: '0' }}
      >
        <img src={folderIcon} alt="" />
      </button>
      <button
        type="text"
      >
        ..
      </button>
    </td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
);

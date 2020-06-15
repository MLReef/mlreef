import React from 'react';

const folderIcon = '/images/svg/folder_01.svg';

export default ({ getBack }) => (
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
);

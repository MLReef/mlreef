import React from 'react';
import MDataTableBase from './MDataTableBase';
import MDataTableMenu from './MDataTableMenu';
import MDataTableRow from './MDataTableRow';
import './MDataTable.scss';

// eslint-disable-next-line
const MDataTable = (props) => {
  return (
    <MDataTableBase
      // eslint-disable-next-line
      {...props}
      MenuComponent={MDataTableMenu}
      RowComponent={MDataTableRow}
    />
  );
};

export default MDataTable;

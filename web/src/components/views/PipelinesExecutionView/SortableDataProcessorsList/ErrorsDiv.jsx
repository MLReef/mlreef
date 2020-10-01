import React from 'react';
import advice01 from 'images/advice-01.png';
import { errorMessages } from 'dataTypes';
import { string } from 'prop-types';

const ErrorsDiv = ({ typeOfField }) => (
  <div className="d-flex" style={{ alignItems: 'center' }}>
    <img style={{ height: '15px' }} src={advice01} alt="" />
    <p style={{ margin: '0 0 0 5px', color: 'red' }}>{errorMessages[typeOfField]}</p>
  </div>
);

ErrorsDiv.propTypes = {
  typeOfField: string.isRequired,
};

export default ErrorsDiv;

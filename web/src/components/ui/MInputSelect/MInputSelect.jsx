import React, { useState } from 'react';
import ArrowButton from 'components/arrow-button/arrowButton';
import { arrayOf, func, string } from 'prop-types';
import './MInputSelect.scss';

const MInputSelect = ({
  options,
  placeholder,
  onClick,
  onInputChange,
}) => {
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  return (
    <div className="m-input-select">
      <ArrowButton
        placeholder={placeholder === '' ? 'Select option' : `${placeholder} `}
        className="btn btn-switch"
        callback={() => setAreOptionsVisible(!areOptionsVisible)}
      />
      {areOptionsVisible && (
      <div className="m-input-select-options">
        <ul>
          <li>
            <input
              onChange={(e) => {
                setInputValue(e.target.value);
                onInputChange(e.target.value);
              }}
              value={inputValue}
            />
          </li>
          {options.map((br) => (
            <li
              key={br}
              onClick={() => {
                setAreOptionsVisible(!areOptionsVisible);
                onClick(br);
              }}
              className="m-select-list-item m-dropdown-list-item"
              value={br}
            >
              {br}
            </li>
          ))}
        </ul>

      </div>
      )}
    </div>
  );
};

MInputSelect.propTypes = {
  placeholder: string,
  options: arrayOf(string).isRequired,
  onClick: func.isRequired,
  onInputChange: func.isRequired,
};

MInputSelect.defaultProps = {
  placeholder: '',
};

export default MInputSelect;

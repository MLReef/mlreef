import React, { useState } from 'react';
import ArrowButton from 'components/ui/MArrowButton/arrowButton';
import { arrayOf, func, string } from 'prop-types';
import './MInputSelect.scss';
import useDropdown from 'customHooks/useDropdown';

const MInputSelect = ({
  options,
  placeholder,
  onClick,
  onInputChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [dropDownRef, toggleShow, isDropdownOpen] = useDropdown();

  return (
    <div className="m-input-select" ref={dropDownRef}>
      <ArrowButton
        placeholder={placeholder === '' ? 'Select option ' : `${placeholder} `}
        className="btn btn-switch"
        callback={() => toggleShow()}
      />
      {isDropdownOpen && (
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
                toggleShow();
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

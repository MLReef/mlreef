import React, { useRef, useState } from 'react';
import ArrowButton from 'components/arrow-button/arrowButton';
import { arrayOf, func, string } from 'prop-types';
import './MInputSelect.scss';

const MInputSelect = ({
  options,
  placeholder,
  onClick,
  onInputChange,
}) => {
  const dropDownRef = useRef();

  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleBodyClick = (e) => {
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
    if (!dropDownRef.current) return;
    if (!dropDownRef.current.contains(clickedElement)) {
      setAreOptionsVisible(false);
    }
  };

  const toggleShow = () => {
    const nextAreOptsVisible = !areOptionsVisible;
    const bodyTag = document.body;
    if (nextAreOptsVisible) {
      bodyTag.addEventListener('click', handleBodyClick);
    } else {
      bodyTag.removeEventListener('click', handleBodyClick);
    }
    setAreOptionsVisible(nextAreOptsVisible);
  };

  return (
    <div className="m-input-select" ref={dropDownRef}>
      <ArrowButton
        placeholder={placeholder === '' ? 'Select option ' : `${placeholder} `}
        className="btn btn-switch"
        callback={() => toggleShow()}
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

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './MDropdown.scss';

// doc/developer/ui/MDropdown.md

const MDropdown = (props) => {
  const {
    className,
    label,
    align,
    listTitle,
    component,
    onClickClose,
    buttonClasses,
    items,
  } = props;

  const [isShown, setIsShown] = useState(false);

  const dropDownRef = useRef();

  const handleBodyClick = (e) => {
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
    if(!dropDownRef.current) return;
    if (!dropDownRef.current.contains(clickedElement)) {
      close();
    }
  }

  const toggleShow = () => {
    const nextIsShown = !isShown;
    const bodyTag = document.body;
    if(nextIsShown){
      bodyTag.addEventListener('click', handleBodyClick);
    } else {
      bodyTag.removeEventListener('click', handleBodyClick);
    }
    setIsShown(nextIsShown);
  };

  const close = () => setIsShown(false);

  const handleContainerClick = () => onClickClose && close();

  const showCorrectDropDown = () => {
    if (component) {
      return component;
    } if (items.length > 0) {
      return (
        <>
          {listTitle && (
          <div className="m-dropdown-list-title">
            {listTitle}
          </div>
          )}
          <ul className="m-dropdown-list p-3">
            {items.map((item, i) => (
              <li key={`dp-item-${i}`} className="m-dropdown-list-item">
                {item.content}
              </li>
            ))}
          </ul>
        </>
      );
    }

    return null;
  };

  return (
    <div ref={dropDownRef} className={`m-dropdown ${isShown ? 'show' : ''} ${className}`}>
      <div className="m-dropdown-button">
        <button
          type="button"
          className={`${buttonClasses} ${isShown ? 'active' : ''}`}
          onClick={toggleShow}
        >
          {label}
          <i className="fa fa-chevron-down ml-2 my-auto" />
        </button>
      </div>
      <div
        tabIndex="0"
        role="button"
        onClick={handleContainerClick}
        onKeyDown={handleContainerClick}
        className={`m-dropdown-list-container border-rounded ${align} mt-1`}
      >
        {showCorrectDropDown()}
      </div>
    </div>
  );
};

MDropdown.defaultProps = {
  className: '',
  buttonClasses: 'btn btn-basic-dark px-2',
  align: '',
  listTitle: '',
  label: '',
  onClickClose: true,
  items: [],
  component: null,
};

MDropdown.propTypes = {
  className: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  align: PropTypes.string,
  listTitle: PropTypes.string,
  component: PropTypes.node,
  onClickClose: PropTypes.bool,
  buttonClasses: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({})),
};

export default MDropdown;

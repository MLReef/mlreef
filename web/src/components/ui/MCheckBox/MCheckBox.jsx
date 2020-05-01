import React from 'react';
import { func, string } from 'prop-types';
import './MCheckBox.scss';

const MCheckBox = ({ defaultChecked, name, labelValue, callback }) => {
  const [value, setValue] = React.useState(defaultChecked ? true : false);
  function handleClick() {
    const newValue = !value;
    setValue(newValue);
    callback(name, labelValue, newValue);
  }
  return (
    <button
      type="button"
      key={`${name} ${labelValue}`}
      htmlFor={`${name} ${labelValue}`}
      className="m-checkbox"
      onClick={handleClick}
    >
      <p>{labelValue}</p>
      <input type="checkbox" checked={value} onChange={() => {}} />
      <span className="checkmark" />
    </button>
  );
};

MCheckBox.propTypes = {
  name: string.isRequired,
  labelValue: string,
  callback: func,
};

MCheckBox.defaultProps = {
  labelValue: '',
  callback: () => {},
};

export default MCheckBox;

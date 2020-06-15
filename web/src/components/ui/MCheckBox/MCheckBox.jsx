import React, { useEffect } from 'react';
import { func, string, bool } from 'prop-types';
import './MCheckBox.scss';

const MCheckBox = (props) => {
  const {
    defaultChecked,
    checked,
    name,
    labelValue,
    callback,
    className,
  } = props;

  const [value, setValue] = React.useState(defaultChecked);

  useEffect(() => {
    setValue(checked);
  }, [checked]);

  function handleClick() {
    const newValue = !value;
    setValue(newValue);
    callback(name, labelValue, newValue);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      key={`${name} ${labelValue}`}
      htmlFor={`${name} ${labelValue}`}
      className={`m-checkbox ${className}`}
      onClick={handleClick}
      onKeyPress={() => {}}
    >
      {labelValue && <p>{labelValue}</p> }
      <input type="checkbox" checked={value} onChange={() => {}} />
      <span className="checkmark" />
    </div>
  );
};

MCheckBox.propTypes = {
  name: string.isRequired,
  defaultChecked: bool,
  checked: bool,
  labelValue: string,
  callback: func,
  className: string,
};

MCheckBox.defaultProps = {
  defaultChecked: false,
  checked: false,
  labelValue: '',
  callback: () => {},
  className: '',
};

export default MCheckBox;

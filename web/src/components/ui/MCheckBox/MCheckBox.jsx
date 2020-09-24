import React, { useEffect } from 'react';
import { func, string, bool } from 'prop-types';
import cx from 'classnames';
import './MCheckBox.scss';

const MCheckBox = (props) => {
  const {
    disabled,
    defaultChecked,
    checked,
    name,
    labelValue,
    callback,
    className,
    small,
    cypressTag,
  } = props;

  const [value, setValue] = React.useState(defaultChecked);

  useEffect(() => {
    setValue(checked);
  }, [checked]);

  function handleClick() {
    if (disabled) return;
    const newValue = !value;
    setValue(newValue);
    callback(name, labelValue, newValue);
  }

  return (
    <div
      data-cy={cypressTag}
      role="button"
      tabIndex={0}
      key={`${name} ${labelValue}`}
      htmlFor={`${name} ${labelValue}`}
      className={`m-checkbox ${className}`}
      onClick={handleClick}
      onKeyPress={() => {}}
    >
      {labelValue && <p>{labelValue}</p> }
      <input disabled={disabled} type="checkbox" checked={value} onChange={() => {}} />
      <span className={cx(`checkmark ${disabled ? 'disabled' : ''}`, { small })} />
    </div>
  );
};

MCheckBox.propTypes = {
  name: string.isRequired,
  disabled: bool,
  defaultChecked: bool,
  checked: bool,
  small: bool,
  labelValue: string,
  callback: func,
  className: string,
  cypressTag: string,
};

MCheckBox.defaultProps = {
  defaultChecked: false,
  disabled: false,
  checked: false,
  small: false,
  labelValue: '',
  callback: () => {},
  className: '',
  cypressTag: '',
};

export default MCheckBox;

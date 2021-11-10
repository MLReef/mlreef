import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './MRichCheckButton.scss';

const MRichCheckButton = (props) => {
  const {
    className,
    label,
    subLabel,
    color,
    name,
    value,
    checked,
    onClick,
    disabled,
    icon,
    radius,
  } = props;

  const handleClick = (e) => {
    if (disabled) return;

    onClick(value, e);
  };

  return (
    <button
      disabled={disabled}
      type="button"
      onClick={handleClick}
      className={cx('m-rich-check-button', className)}
    >
      <div className="m-rich-check-button-input-group">
        <span className={cx('checkmark', { checked, radius })}><span /></span>
      </div>
      <div className="m-rich-check-button-content">
        {icon && (
          <img src={icon} alt={label} className="m-rich-check-button-content-icon" />
        )}
        <label htmlFor={`${name}-${value}`} className="m-rich-check-button-content-label">
          <span className="m-rich-check-button-content-label-label" style={{ color }}>
            {label}
          </span>
          {subLabel && (
            <span className="m-rich-check-button-content-label-sublabel">{subLabel}</span>
          )}
        </label>
      </div>
    </button>
  );
};

MRichCheckButton.defaultProps = {
  className: '',
  subLabel: '',
  color: 'var(--dark)',
  name: 'default-name',
  onClick: () => {},
  disabled: false,
  radius: false,
  icon: '',
};

MRichCheckButton.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string,
  color: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  radius: PropTypes.bool,
  icon: PropTypes.string,
};

export default MRichCheckButton;

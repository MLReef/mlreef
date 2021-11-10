import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MRichCheckButton from 'components/ui/MRichCheckButton';
import './MRichRadioGroup.scss';

const MRichRadioGroup = (props) => {
  const {
    className,
    title,
    options,
    name,
    value,
    onClick,
    radius,
  } = props;

  return (
    <div className={cx('m-rich-radio-group', className)}>
      { title && <div className="m-rich-radio-group-title">{ title }</div> }
      {options.map((option) => (
        <MRichCheckButton
          key={`${name}-${option.value}`}
          id={`${name}-${option.value}`}
          label={option.label}
          subLabel={option.subLabel}
          value={option.value}
          color={option.color}
          icon={option.icon}
          name={name}
          onClick={onClick}
          checked={value === option.value}
          disabled={option.disabled}
          radius={radius}
        />
      ))}
    </div>
  );
};

MRichRadioGroup.defaultProps = {
  title: '',
  className: '',
  name: 'default-name',
  radius: false,
};

MRichRadioGroup.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    subLabel: PropTypes.string,
    value: PropTypes.string.isRequired,
    color: PropTypes.string,
    icon: PropTypes.string,
    disabled: PropTypes.bool,
  })).isRequired,
  name: PropTypes.string,
  value: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  radius: PropTypes.bool,
};

export default MRichRadioGroup;

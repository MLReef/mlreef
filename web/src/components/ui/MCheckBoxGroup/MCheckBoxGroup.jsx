import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import './MCheckBoxGroup.scss';

const MCheckBoxGroup = (props) => {
  const {
    className,
    name,
    options,
    value,
    onSelect,
  } = props;

  const handleSelect = (nextValue) => () => {
    onSelect(nextValue);
  };

  const checkOption = (optionValue) => optionValue === value;

  return (
    <div className={cx('m-check-box-group', className)}>
      {options.map((option) => (
        <button
          key={`m-checkbox-group-${name}-${option.value}`}
          type="button"
          className={cx('m-check-box-group-option-btn btn', {
            checked: checkOption(option.value),
          })}
          onClick={handleSelect(option.value)}
        >
          <MCheckBox
            small
            checked={checkOption(option.value)}
            name={name}
            labelValue={option.label}
            callback={handleSelect(option.value)}
          />
        </button>

      ))}
    </div>
  );
};

MCheckBoxGroup.defaultProps = {
  className: '',
  value: null,
};

MCheckBoxGroup.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  })).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default MCheckBoxGroup;

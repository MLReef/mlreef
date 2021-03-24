import React from 'react';
import PropTypes, { arrayOf } from 'prop-types';
import cx from 'classnames';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import './MCheckBoxGroup.scss';

const MCheckBoxGroup = (props) => {
  const {
    className,
    name,
    options,
    values,
    onSelect,
  } = props;

  const handleSelect = (nextValue) => () => {
    onSelect(nextValue);
  };

  const checkOption = (optionValue) => values.includes(optionValue);

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
          />
        </button>

      ))}
    </div>
  );
};

MCheckBoxGroup.defaultProps = {
  className: '',
  values: [],
};

MCheckBoxGroup.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  values: arrayOf(PropTypes.number),
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

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './MButton.scss';

// doc/developer/ui/MButton.md

const MButton = (props) => {
  const {
    type,
    className,
    children,
    label,
    waiting,
    disabled,
    noDisable,
    onClick,
    cypressTag,
  } = props;

  // const displayedLabel = useMemo(
  //   () => {
  //     const currentLabel = label || children;
  //
  //     return waiting ? spinner : currentLabel;
  //   },
  //   [label, children, waiting],
  // );

  const computedClasses = useMemo(
    () => waiting ? `${className} waiting` : className,
    [waiting, className],
  );

  return (
    // eslint-disable-next-line
    <button
      type={type}
      data-cy={cypressTag}
      onClick={onClick}
      disabled={disabled || (!noDisable && waiting)}
      className={computedClasses}
    >
      {label || children}
    </button>
  );
};

MButton.defaultProps = {
  type: 'button',
  label: '',
  className: 'btn',
  onClick: () => {},
  children: '',
  waiting: false,
  disabled: false,
  noDisable: false,
  cypressTag: null,
};

MButton.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  waiting: PropTypes.bool,
  disabled: PropTypes.bool,
  noDisable: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
  cypressTag: PropTypes.string,
};

export default MButton;

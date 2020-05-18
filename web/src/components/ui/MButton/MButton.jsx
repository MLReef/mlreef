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
    noDisable,
    onClick,
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
      onClick={onClick}
      disabled={!noDisable && waiting}
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
  noDisable: false,
};

MButton.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  waiting: PropTypes.bool,
  noDisable: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
};

export default MButton;

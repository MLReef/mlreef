import React from 'react';
import * as PropTypes from 'prop-types';
import './MParagraph.scss';

const MParagraph = (props) => {
  const {
    text,
    separator,
    emptyMessage,
    className,
    lineClasses,
  } = props;

  return (
    <section className={`m-paragraph ${className}`}>
      {text?.split(separator).map((line) => (
        <p key={`p-line-${line}`} className={`m-paragraph-line ${lineClasses}`}>
          {line}
        </p>
      ))}
      {!text?.length && emptyMessage && (
        <p className={`m-paragraph-line ${lineClasses}`}>
          {emptyMessage}
        </p>
      )}
    </section>
  );
};

MParagraph.defaultProps = {
  separator: '\n',
  emptyMessage: '',
  className: '',
  lineClasses: '',
  text: '',
};

MParagraph.propTypes = {
  text: PropTypes.string,
  separator: PropTypes.string,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  lineClasses: PropTypes.string,
};

export default MParagraph;

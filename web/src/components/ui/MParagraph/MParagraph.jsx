import React from 'react';
import * as PropTypes from 'prop-types';
import './MParagraph.scss';

const MParagraph = (props) => {
  const {
    text,
    separator,
    className,
    lineClasses,
  } = props;

  return (
    <section className={`m-paragraph ${className}`}>
      {text.split(separator).map((line) => (
        <p key={`p-line-${line}`} className={`m-paragraph-line ${lineClasses}`}>
          {line}
        </p>
      ))}
    </section>
  );
};

MParagraph.defaultProps = {
  separator: '\n',
  className: '',
  lineClasses: '',
};

MParagraph.propTypes = {
  text: PropTypes.string.isRequired,
  separator: PropTypes.string,
  className: PropTypes.string,
  lineClasses: PropTypes.string,
};

export default MParagraph;

import { arrayOf, string } from 'prop-types';
import React from 'react';
import './MTags.scss';

const MTags = (props) => {
  const {
    tags,
    onClick,
  } = props;
  return (
    <div className="m-tags">
      {tags.map((t) => (
        <button
          type="button"
          className="m-tags-item"
          onClick={() => onClick(t)}
        >
          {t.label}
          {' '}
          x
        </button>
      ))}
    </div>
  );
};

MTags.propTypes = {
  tags: arrayOf(string),
};

MTags.defaultProps = {
  tags: [],
};

export default MTags;

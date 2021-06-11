import { arrayOf, func, shape } from 'prop-types';
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
          key={t}
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
  tags: arrayOf(shape({})),
  onClick: func.isRequired,
};

MTags.defaultProps = {
  tags: [],
};

export default MTags;

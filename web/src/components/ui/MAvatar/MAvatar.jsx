import React from 'react';
import PropTypes from 'prop-types';

const MAvatar = (props) => {
  const { imgBase, projectName, width, height, styleClass } = props;
  return (
    <img
      style={{ borderRadius: '50%' }}
      className={`mr-3 avatar ${styleClass}`}
      width={width}
      height={height}
      src={imgBase}
      alt={projectName}
      title={projectName}
    />
  );
};

MAvatar.propTypes = {
  projectName: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  imgBase: PropTypes.string.isRequired,
  styleClass: PropTypes.string.isRequired,
};

export default MAvatar;

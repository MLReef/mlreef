import React from 'react';
import './MEmptyAvatar.scss';
import PropTypes from 'prop-types';

const MEmptyAvatar = (props) => {
  const { projectName, styleClass } = props;
  const projCharacter = projectName && projectName.charAt(0).toUpperCase();
  return (
    <>
      <div className={`${styleClass}`}>
        <div
          className={`mr-3 bg-light emptyAvatar ${styleClass}`}
        >
          {projCharacter}
        </div>
      </div>
    </>
  );
};

MEmptyAvatar.propTypes = {
  projectName: PropTypes.string.isRequired,
  styleClass: PropTypes.string.isRequired,
};

export default MEmptyAvatar;

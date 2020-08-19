import React, { useState } from 'react';
import * as PropTypes from 'prop-types';

const SettingsViewGeneralAdvancedDeleteProject = (props) => {
  const {
    name,
    onDelete,
  } = props;

  const [confirmation, setConfirmation] = useState('');

  const handleInputChange = (e) => {
    setConfirmation(e.target.value);
  };

  const disabled = name !== confirmation;

  return (
    <div>
      <p>
        <b className="t-danger">
          You are going to remove {name}. Removed project CANNOT be restored!
          Are you ABSOLUTELY sure?
        </b>
      </p>

      <p>
        This action can lead to data loss. To prevent accidental actions we ask
        your permission to confirm your intention.
        {'Please type '}
        <span className="bg-light t-danger">{name}</span>
        {' to proceed or close this modal.'}
      </p>

      <input className="mb-4" onChange={handleInputChange} value={confirmation} />

      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="btn btn-danger"
      >
        Confirm
      </button>
    </div>
  );
};

SettingsViewGeneralAdvancedDeleteProject.propTypes = {
  name: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SettingsViewGeneralAdvancedDeleteProject;

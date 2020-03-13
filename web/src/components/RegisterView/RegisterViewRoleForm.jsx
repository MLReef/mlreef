import React, { useState } from 'react';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import { roles, userTypes } from './formInformation';
import MSelect from '../MSelect';
import MRadio from '../MRadio';

const RegisterViewRoleForm = (props) => {
  const {
    updateUserInfo,
    onSuccess,
    username,
  } = props;

  const [role, setRole] = useState(1);
  const [userType, setUserType] = useState(1);

  const handleRoleChange = (newRole) => {
    setRole(parseInt(newRole, 10));
  };

  const handleUserTypeChange = (type) => {
    setUserType(parseInt(type, 10));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    return updateUserInfo({ role, userType })
      .then((res) => {
        toastr.success('Success:', 'Information updated.');
        return res;
      })
      .then(onSuccess);
  };

  return (
    <div className="register-view_form_container">
      <div className="register-view_welcome-title">
        <h2 className="m-title-lg">
          Welcome to MLReef
          <br />
          {`@${username || 'user'}`}
        </h2>
        <p className="m-text">
          In order to personalize your experience with MLReef we would like to know more about you
        </p>
      </div>
      <form onSubmit={handleSubmit} className="register-view_form">
        <div className="register-view_form_content">
          <div className="form-group">
            <MSelect
              footer="This will help us personalize your onboarding experience."
              label="Role"
              options={roles}
              value={role}
              onChange={handleRoleChange}
            />
          </div>
          <div className="form-group">
            <MRadio
              label="Who will be using this MLReef subscription?"
              name="userType"
              options={userTypes}
              value={userType}
              onChange={handleUserTypeChange}
            />
          </div>
          <div className="register-view_submit">
            <button type="submit" className="btn-submit">
              Get started!
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

RegisterViewRoleForm.propTypes = {
  updateUserInfo: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};

export default RegisterViewRoleForm;

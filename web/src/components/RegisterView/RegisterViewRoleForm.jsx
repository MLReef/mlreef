import React, { useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import MSelect from 'components/ui/MSimpleSelect';
import MButton from 'components/ui/MButton';
import MRadio from 'components/ui/MRadio';
import { getUserInfo } from 'actions/userActions';
import { roles, userTypes } from './formInformation';

const RegisterViewRoleForm = (props) => {
  const {
    updateUserInfo,
    onSuccess,
    isSubmitting,
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
    const { actions } = props;

    return updateUserInfo({ role, userType })
      .then((res) => {
        actions.getUserInfo();
        toastr.success('Success:', 'Information updated.');
        return res;
      })
      .then(onSuccess);
  };

  return (
    <div className="register-view_form_container">
      <div className="register-view_welcome-title">
        <h2 className="title-lg">
          Welcome to MLReef
          <br />
          {`@${username || 'user'}`}
        </h2>
        <p className="title-subtitle">
          In order to personalize your experience with MLReef we would like to know more about you
        </p>
      </div>
      <div className="register-view_info">
        <h2 style={{ color: 'var(--warning)' }} className="title-lg">
          Early Access Disclaimer
        </h2>
        <p className="title-subtitle">
          Dear {`${username || 'user'}`},
          MLReef is currently in an alpha stage. Incomplete functions, bugs and even data-loss might happen during this development phase.
          Please be sure to keep this in mind, especially when using or working with sensitive data or code.
          We are very happy to recieve your feedback, feature or code improvements!
        </p>
        <p className="title-subtitle">
          If you need help, you can always reach out to us:
          <a href="mailto:help@mlreef.com" target="_top" style={{ color: 'var(--info)' }}> help@mlreef.com</a>
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
            <MButton type="submit" className="btn btn-primary" waiting={isSubmitting}>
              Get started!
            </MButton>
          </div>
        </div>
      </form>
    </div>
  );
};

RegisterViewRoleForm.defaultProps = {
  isSubmitting: false,
};

RegisterViewRoleForm.propTypes = {
  actions: PropTypes.shape({
    getUserInfo: PropTypes.func.isRequired,
  }).isRequired,
  updateUserInfo: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getUserInfo,
    }, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(RegisterViewRoleForm);

import React, { useState } from 'react';
import MInput from 'components/ui/MInput';
import MButton from 'components/ui/MButton';
import { toastr } from 'react-redux-toastr';
import './ResetPassword.scss';
import PropTypes from 'prop-types';
import PasswordManagementApi from 'apis/PasswordManagementApi';
import CheckEmailView from './CheckEmailView';
import icon from '../../../images/MLReef_Icon_POS_BETA-01.png';

const passwordApi = new PasswordManagementApi();

const ResetPasswordView = (props) => {
  const { history } = props;
  const [flag, setFlag] = useState(0);
  const [email, setEmail] = useState('');

  const sendResetEmail = (e) => {
    e.preventDefault();

    passwordApi.sendResetPassEmail(email)
      .then(() => {
        setFlag(1);
        toastr.info('Email sent', 'A Reset password link has been sent to your email');
      })
      .catch(() => {
        if (email !== '') toastr.error('Error', 'Sorry!! your email does not exist with us');
        else toastr.error('Error', 'Please enter a valid Email Id');
      });
  };

  return (
    <div className="reset-password">
      <div className="reset-password_container">
        <div className="reset-password_brand">
          <img className="brand" src={icon} alt="" />
        </div>
        <form className="reset-view_form">
          <div className="reset-view_form_header">
            Reset password for MLReef
          </div>
          {flag === 0
            ? (
              <>
                <div className="reset-view_form_content">
                  <div className="cols-2">
                    <MInput
                      id="email"
                      value={email}
                      label="Enter your email address"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="reset-view_submit">
                  <MButton onClick={sendResetEmail} id="password-submit" type="submit" className="btn btn-primary">
                    Send password reset email
                  </MButton>
                </div>
              </>
            )
            : <CheckEmailView history={history} />}
        </form>
        <footer className="reset-view_form_footer">
          {'New to MLReef? '}
          <a href="/register" className="btn-link"><b>Create an account</b></a>
        </footer>
      </div>
    </div>
  );
};

ResetPasswordView.defaultProps = {
  history: {},
};

ResetPasswordView.propTypes = {
  history: PropTypes.shape({}),
};

export default ResetPasswordView;

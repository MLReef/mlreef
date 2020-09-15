import React from 'react';
import { withFormik } from 'formik';
import { toastr } from 'react-redux-toastr';
import MInput from 'components/ui/MInput';
import MButton from 'components/ui/MButton';
import PasswordManagementApi from 'apis/PasswordManagementApi';
import PropTypes from 'prop-types';
import { validationSchema } from '../../RegisterView/formInformation';
import icon from '../../../images/MLReef_Icon_POS_ALPHA-01.svg';

const passwordApi = new PasswordManagementApi();

const PasswordConfirmationView = (props) => {
  const {
    history,
    match: {
      params: { token },
    },
    values,
    touched,
    errors,
    handleBlur,
    handleChange,
  } = props;

  const changePassword = (e) => {
    e.preventDefault();

    passwordApi.confirmPassword(token, values.password)
      .then(() => {
        toastr.success('Success', 'Password has been updated');
        history.push('/login');
      })
      .catch(() => toastr.error('Error', 'Password cannot be changed now'));
  };

  return (
    <div className="reset-password">
      <div className="reset-password_container">
        <div className="reset-password_brand">
          <img src={icon} className="brand" alt="MLReef" />
        </div>
        <form onSubmit={changePassword} className="reset-view_form">
          <div className="reset-view_form_header">
            Change Password
          </div>
          <>
            <div className="reset-view_form_content">
              <div className="d-block cols-2">
                <MInput
                  id="password"
                  type="password"
                  className="p-0"
                  value={values.password}
                  error={touched.password && errors.password}
                  label="New Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <MInput
                  id="confirm"
                  type="password"
                  className="p-0"
                  value={values.confirm}
                  label="Confirm Password"
                  error={touched.confirm && errors.confirm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>
            <div className="reset-view_submit">
              <MButton id="password-submit" onClick={changePassword} type="submit" className="btn btn-primary">
                Change Password
              </MButton>
            </div>
          </>
        </form>
        <footer className="reset-view_form_footer">
          {'New to MLReef? '}
          <a href="/register" className="btn-link"><b>Create an account</b></a>
        </footer>
      </div>
    </div>
  );
};

const validations = {
  validationSchema,
};

PasswordConfirmationView.propTypes = {
  history: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  values: PropTypes
    .PropTypes.shape({
      password: PropTypes.string,
      confirm: PropTypes.string,
    })
    .isRequired,
  touched: PropTypes.shape({}).isRequired,
  errors: PropTypes.shape({}).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

export default withFormik(validations)(PasswordConfirmationView);

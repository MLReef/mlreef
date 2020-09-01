import React from 'react';
import { withFormik } from 'formik';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import MButton from 'components/ui/MButton';
import MInput from 'components/ui/MInput';
import { validationSchema, placeholders } from './formInformation';

const RegisterForm = (props) => {
  const {
    values,
    touched,
    errors,
    // dirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    // handleReset,
    isSubmitting,
  } = props;

  const handleChangeCheckbox = (field) => () => {
    setFieldValue(field, !values[field]);
  };

  return (
    <form onSubmit={handleSubmit} className="register-view_form">
      <div className="register-view_form_header">
        Register to MLReef
      </div>
      <div className="register-view_form_content">
        <div className="cols-2">
          <MInput
            id="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.firstName && errors.firstName}
            label="First Name"
            placeholder={placeholders.firstName}
          />
          <MInput
            id="lastName"
            label="Last Name"
            placeholder={placeholders.lastName}
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.lastName && errors.lastName}
          />
        </div>

        <MInput
          id="username"
          label="Username"
          placeholder={placeholders.username}
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username && errors.username}
        />

        <MInput
          id="email"
          type="email"
          label="Email"
          placeholder={placeholders.email}
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
        />

        <MInput
          id="password"
          type="password"
          label="Password"
          placeholder={placeholders.password}
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
        />

        <MInput
          id="confirm"
          type="password"
          label="Confirm password"
          placeholder={placeholders.confirm}
          value={values.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirm && errors.confirm}
        />

        <div className="">
          <div className="">
            <input
              id="terms"
              checked={values.terms}
              onChange={handleChangeCheckbox('terms')}
              type="checkbox"
            />
            <label htmlFor="terms">
              {'I accept the '}
              <a className="btn-link" href="https://about.mlreef.com/terms">
                Terms of Service and Privacy Policy
              </a>
            </label>
          </div>
          <div className="m-input_errors">
            {errors.terms && (
              <div className="m-error">
                { errors.terms }
              </div>
            )}
          </div>
        </div>
        <div className="">
          <input
            id="updatesAllowed"
            checked={values.updatesAllowed}
            onChange={handleChangeCheckbox('updatesAllowed')}
            type="checkbox"
          />
          <label htmlFor="updatesAllowed">
            I would like to receive updates via email about MLReef
          </label>
        </div>

        <div className="register-view_submit">
          <MButton type="submit" className="btn btn-primary" waiting={isSubmitting}>
            Register
          </MButton>
        </div>
      </div>
    </form>
  );
};

const handleErrors = (errorRes) => (errorRes.json ? errorRes.json() : Promise.reject(errorRes))
  .then((error) => ({
    title: `Error`,
    message: error.error_message || 'Something happened.',
  }))
  .catch(() => ({
    title: `Error ${errorRes.status || ''} (unprocessed)`,
    message: errorRes.statusText || errorRes.message,
  }))
  .then(({ title, message }) => toastr.error(title, message));

const validations = {
  validationSchema,

  mapPropsToValues: ({ initialFields }) => ({
    ...initialFields,
  }),

  handleSubmit: (payload, { setSubmitting, props }) => {
    const {
      submitForm,
      onSuccess,
    } = props;

    setSubmitting(true);

    const userData = {
      name: `${payload.firstName} ${payload.lastName}`,
      username: payload.username,
      email: payload.email,
      password: payload.password,
    };

    return submitForm(userData)
      .then((res) => {
        toastr.success('Welcome to MLReef!', 'Your registration was successful');
        return res;
      })
      .then(onSuccess)
      .catch(handleErrors)
      .finally(() => {
        setSubmitting(false);
      });
  },

  displayName: 'ValidatedForm',
};

RegisterForm.defaultProps = {
  isSubmitting: false,
};

RegisterForm.propTypes = {
  values: PropTypes
    .PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      confirm: PropTypes.string.isRequired,
      terms: PropTypes.bool.isRequired,
      updatesAllowed: PropTypes.bool.isRequired,
    })
    .isRequired,
  touched: PropTypes.shape({}).isRequired,
  errors: PropTypes.shape({}).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

const RegisterFormWithValidations = withFormik(validations)(RegisterForm);

export default RegisterFormWithValidations;

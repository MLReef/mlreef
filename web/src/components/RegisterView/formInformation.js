import * as Yup from 'yup';

export const initialFields = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  confirm: '',
  terms: true,
  updatesAllowed: false,
};

export const placeholders = {
  firstName: 'Your first name',
  lastName: 'Your last name',
  email: 'Your email',
  username: 'The name you will be known',
  password: 'Write a strong password with more than 8 characters',
  confirm: 'Repeat your password',
};

export const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Your name is too short.')
    .required('First name is required.'),

  lastName: Yup.string()
    .min(2, 'Lastname is too short.')
    .required('Last name is required.'),

  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required.'),

  username: Yup.string()
    .required('Username is required.'),

  password: Yup.string()
    .min(8, 'At least 8 characters.')
    .matches(/[\w]/, 'At least one letter.')
    // .matches(/[\d]/, 'At least one number.')
    .required('Password is required.'),

  confirm: Yup.string()
    .required('Please confirm your password.')
    .test(
      'passwords-match',
      'Passwords must match.',
      function check(value) {
        return this.parent.password === value;
      },
    ),
  terms: Yup.boolean()
    .test(
      'must-accept-terms',
      'You must accept the terms.',
      (value) => value === true,
    ),
});

export const roles = [
  {
    label: 'Data Scientists',
    value: 1,
  },
  {
    label: 'Student',
    value: 2,
  },
];

export const userTypes = [
  {
    label: 'My company or team',
    value: 1,
  },
  {
    label: 'Just me',
    value: 2,
  },
];

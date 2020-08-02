import React from 'react';
import PropTypes from 'prop-types';
import MButton from 'components/ui/MButton';

const CheckEmailView = ({ history }) => (
  <div className="reset-view_form_content">
    <div>
      <p className="text-highlight">
        Check your email for a link
        to reset your password. If it
        doesn't appear within a few
        minutes, check your spam folder.
      </p>
      <div className="reset-view_submit">
        <MButton onClick={() => { history.push('/'); }} type="button" className="btn btn-primary">
          Return to sign in
        </MButton>
      </div>
    </div>
  </div>
);

CheckEmailView.defaultProps = {
  history: {},
};

CheckEmailView.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default CheckEmailView;

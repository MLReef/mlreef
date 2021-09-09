import React, { useState, } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './RegisterView.scss';
import { registerUser, updateUserInfo, logout } from 'store/actions/userActions';
import { initialFields } from './formInformation';
import icon from 'images/ml_reef_icon_01.svg';
import RegisterViewForm from './RegisterViewForm';
import RegisterViewRoleForm from './RegisterViewRoleForm';
import { Redirect } from 'react-router-dom';

const RegisterView = (props) => {
  const [registryStatus, setRegistryStatus] = useState(0);
  const { auth } = useSelector((state) => state.user);

  const onRegistrySuccess = () => {
    setRegistryStatus(1);
  };

  const onUpdatedRoleSuccess = () => {
    const { history } = props;
    history.push('/tutorial');
  };

  if(auth && registryStatus === 0) {
    return (
      <Redirect to="/dashboard" />
    );
  }

  return (
    <div className="register-view">
      <div className="register-view_container">
        {
          registryStatus === 0 && (
            <div className="register-view_form_container">

              <div className="register-view_brand">
                <img className="brand" src={icon} alt="" />
              </div>
              <ConnectedForm
                initialFields={initialFields}
                onSuccess={onRegistrySuccess}
              />

              <footer className="register-view_form_footer">
                {'Already have a Login and Password? '}
                <Link to="/login" className="btn-link"><b>Log in</b></Link>
              </footer>
            </div>
          )
        }
        { registryStatus === 1 && (
          <ConnectedPostForm onSuccess={onUpdatedRoleSuccess} />
        ) }
      </div>
    </div>
  );
};

RegisterView.propTypes = {
  history: PropTypes
    .PropTypes.shape({
      push: PropTypes.func.isRequired,
    })
    .isRequired,
};

const mapStateToProps = (state) => ({
  username: state.user && state.user.username,
});

const mapDispatchToProps = (dispatch) => ({
  submitForm: bindActionCreators(registerUser, dispatch),
  updateUserInfo: bindActionCreators(updateUserInfo, dispatch),
});

const ConnectedForm = connect(null, mapDispatchToProps)(RegisterViewForm);
const ConnectedPostForm = connect(mapStateToProps, mapDispatchToProps)(RegisterViewRoleForm);

export default RegisterView;

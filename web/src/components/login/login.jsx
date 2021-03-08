import React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';
import { Link } from 'react-router-dom';
import MButton from 'components/ui/MButton';
import { login, getUserInfo } from 'store/actions/userActions';
import './login.css';
// import icon from '../../images/ml_reef_icon_01.svg';
import icon from '../../images/MLReef_Icon_POS_BETA-01.svg';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasErrors: false,
      email: '',
      password: '',
      isFetching: false,
    };

    this.submit = this.submit.bind(this);
    this.reset = this.reset.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.redirectIfAuthenticated = this.redirectIfAuthenticated.bind(this);
  }

  componentDidMount() {
    this.redirectIfAuthenticated();
  }

  // case: /login -> push('/')
  // case: /login?redirect=goback -> goBack()
  // case: /login?redirect=groups -> push('/groups')
  redirectIfAuthenticated() {
    const {
      isAuth,
      history,
      location: { search },
    } = this.props;

    if (isAuth) {
      const query = search.replace(/\?(.+)$/, '$1');
      const redirect = query.split('&')
        .map((chunk) => chunk.split('='))
        .find((pair) => pair[0] === 'redirect');

      if (redirect) {
        switch (redirect[1]) {
          case 'goback':
            return history.goBack();

          default:
            return history.push(`/${redirect}`);
        }
      }

      return history.push('/');
    }
    return null;
  }

  handleChange(event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  }

  validateForm() {
    const { email } = this.state;
    const { password } = this.state;
    return email.length > 0
      && password.length > 0;
  }

  submit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const { email } = this.state;
    const { password } = this.state;

    const { actions } = this.props;

    const formData = {
      username: email,
      email,
      password,
    };

    this.setState({ isFetching: true });

    actions.login(formData)
      .then((userInfo) => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        document.cookie = `private_token=${userInfo.token}; expires=${now.toUTCString()};`;
      }).then(() => {
        toastr.success('Success:', 'Login successfully');

        return actions.getUserInfo();
      })
      .catch((err) => {
        this.setState({ hasErrors: true });
        toastr.warning('Warning: ', err.message);
      })
      .finally(() => {
        this.setState({ isFetching: false });

        this.redirectIfAuthenticated();
      });
  }

  reset() {
    this.setState({
      email: '',
      password: '',
      hasErrors: false,
    });
  }

  render() {
    const {
      email,
      password,
      hasErrors,
      isFetching,
    } = this.state;

    return (
      <div id="login-container">
        <div id="icon-div">
          <img className="mx-auto mb-2" src={icon} alt="" />
        </div>
        <div id="errorDiv" className={`${!hasErrors ? 'invisible' : ''} error border-div d-flex py-2`}>
          <p className="my-auto flex-1">Incorrect username or password</p>
          <div className="flex-0">
            <button className="btn btn-basic-dark btn-sm my-auto" type="button" onClick={this.reset}>
              Reset
            </button>
          </div>
        </div>
        <div className="login-form border-div">
          <div className="title">
            Sign in to
            {' '}
            MLReef
          </div>
          <form onSubmit={this.submit}>
            <div className="form-container">
              <div className="input-container paragraph">
                <p>Username or email address</p>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={this.handleChange}
                />
              </div>
              <div className="input-container paragraph">
                <div style={{ alignItems: 'baseline' }} className="w-100 d-flex">
                  <div style={{ flex: '1' }}>
                    <p>Password</p>
                  </div>
                  <div>
                    <Link
                      tabIndex="-1"
                      className="t-info"
                      to="/reset-password"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={this.handleChange}
                />
              </div>
              <div id="sign-in-btn" className="input-container">
                <MButton
                  type="submit"
                  waiting={isFetching}
                  label="Sign in"
                  className="btn btn-primary"
                />
              </div>
            </div>
          </form>
        </div>
        <div id="create-account-div" className="border-div paragraph">
          <p>
            New to MLReef?
            {' '}
            <Link to="/register">
              <b>Create an account.</b>
            </Link>
          </p>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  isAuth: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    login: PropTypes.func.isRequired,
    getUserInfo: PropTypes.func.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    isAuth: state.user && state.user.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      login,
      getUserInfo,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';
import { Redirect } from 'react-router-dom';
import * as projectActions from '../../actions/projectInfoActions';
import './login.css';
import icon from '../../images/ml_reef_icon_01.svg';
import MLRAuthApi from '../../apis/MLAuthApi';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      redirect: false,
    };
    this.submit = this.submit.bind(this);
    this.reset = this.reset.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
      const errorDiv = document.getElementById('errorDiv');
      errorDiv.classList.remove('invisible');
      return;
    }
    const { email } = this.state;
    const { password } = this.state;
    const { actions } = this.props;

    MLRAuthApi
      .login(email,email, password)
      .then((user) => {
        actions.getProjectsList();
        sessionStorage.setItem('auth', true);
        sessionStorage.setItem('user', user); // FIXME: Does not work, but would the best IMHO
        sessionStorage.setItem('user.id', user.id);
        sessionStorage.setItem('user.username', user.username);
        sessionStorage.setItem('user.email', user.email);
        sessionStorage.setItem('token', user.token);
        this.setState({ redirect: true, loading: false });
        toastr.success('Success:', 'Login successfully');
      })
      .catch(
        (error) => {
          this.setState({ loading: false });
          toastr.error('Error:', 'Try Login with mlreef + password or get: '+ error);
          const errorDiv = document.getElementById('errorDiv');
          errorDiv.classList.remove('invisible');
        },
      );
  }

  reset() {
    this.setState({
      email: '',
      password: '',
    });
  }

  renderRedirect() {
    const { redirect } = this.state;
    if (redirect || sessionStorage.getItem('auth') === 'true') {
      return <Redirect to="/my-projects" />;
    }

    return null;
  }

  render() {
    const { email } = this.state;
    const { password } = this.state;
    return (
      <div id="login-container">
        {this.renderRedirect()}
        <div id="icon-div">
          <img src={icon} alt="" />
        </div>
        <div id="errorDiv" className="invisible error border-div">
          <p>Incorrect username or password</p>
          <div>
            <button type="button" onClick={this.reset}>
              Reset
            </button>
          </div>
        </div>
        <div className="login-form border-div">
          <div className="title">
            Sign in to
            {' '}
            <b>MLreef</b>
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
                <p>Password</p>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={this.handleChange}
                />
              </div>

              <div id="sign-in-btn" className="input-container">
                <button type="submit">
                  <b>Sign in</b>
                </button>
              </div>
            </div>
          </form>
        </div>
        <div id="create-account-div" className="border-div paragraph">
          <p>
            New to MLreef?
            {' '}
            <b>Create an account.</b>
          </p>
        </div>
      </div>
    );
  }
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
    }, dispatch),
  };
}

export default connect(() => ({ }), mapDispatchToProps)(Login);
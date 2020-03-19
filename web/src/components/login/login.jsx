import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';
import { Link } from 'react-router-dom';
import { login } from '../../actions/userActions';
import './login.css';
import icon from '../../images/ml_reef_icon_01.svg';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };

    this.submit = this.submit.bind(this);
    this.reset = this.reset.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const { isAuth, history } = this.props;

    if (isAuth) history.push('/my-projects');
  }

  componentDidUpdate() {
    const { isAuth, history } = this.props;

    if (isAuth) history.push('/my-projects');
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

    const formData = {
      username: email,
      email,
      password,
    };

    actions.login(formData)
      .then(() => {
        toastr.success('Success:', 'Login successfully');
      })
      .catch((error) => {
        toastr.error('Error:', `Try Login with mlreef + password or get: ${error}`);
        const errorDiv = document.getElementById('errorDiv');
        errorDiv.classList.remove('invisible');
      });
  }

  reset() {
    this.setState({
      email: '',
      password: '',
    });
  }

  render() {
    const { email, password } = this.state;

    return (
      <div id="login-container">
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
            <Link to="/register">
              <b>Create an account.</b>
            </Link>
          </p>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuth: state.user && state.user.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      login,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

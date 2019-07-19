import React from 'react';
import '../css/login.css';
import {Redirect} from 'react-router-dom'

export default class Login extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            email: "",
            password: "",
            redirect: false
        };

        this.submit = this.submit.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }    

    handleChange = event => {
        this.setState({
                [event.target.id]: event.target.value
            }
        )
    }

    validateForm = () => this.state.email.length > 0 && this.state.password.length > 0;
    

    submit(e){
        e.preventDefault();

        if(!this.validateForm()){
            const errorDiv = document.getElementById("errorDiv");
            errorDiv.classList.remove("invisible");
            return;
        }

        window.location.replace("/home");
    }

    render(){
        return (
            <div className="login-containter"> 
                <div className="title">    
                    Login to MLReef
                </div>

                <p id="errorDiv" className="invisible error flex-div">    
                        Invalid credentials
                </p>

                <div className="form-container">
                    <div className="input-container">
                        <p>Email</p>
                        <input id="email" type="text" value={this.state.email} onChange={this.handleChange}/>
                    </div>
                    <div className="input-container">
                        <p>Password</p>
                        <input id="password" type="password" value={this.state.password} onChange={this.handleChange}/>
                    </div>

                    <div className="input-container">
                        <button onClick={this.submit}>
                            <b>Submit</b>
                        </button>
                    </div>
                </div>

            </div>
        )
    }
}
import React, {Component} from 'react';
import '../css/input.css';

class Input extends Component {
    constructor(props){
        super(props);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        
        this.state = {
            idTypingMss: Date.now()
        }
    }

    handleKeyUp = (e) => { 
        const el = document.getElementById(this.state.idTypingMss);
        el.style.visibility = e.currentTarget.value ? "unset" : "hidden";

        if(e.currentTarget.value){
            e.currentTarget.classList.remove("grey-border");
            e.currentTarget.classList.add("blue-border-grey-letter");
            el.classList.add("blue-border-grey-letter");
        }else{
            e.currentTarget.classList.remove("blue-border-grey-letter");
            e.currentTarget.classList.add("grey-border");
        }        
    }
    
    render() {
        const placeholder = this.props.placeholder;
        const name = this.props.name;
        const id = this.props.id;
        const idTypingMss = this.state.idTypingMss;
        return (
            <div id={` input-${id}-div-container`} className="input-component-container">
                <div>
                    <input name={name} id={id} className="grey-border" placeholder={placeholder} onKeyUp={this.handleKeyUp}/>
                </div>
                <div id={idTypingMss} className="hiddenMss">
                    <p>Typing...</p>
                </div>
            </div>
        )
    }
}

export default Input;

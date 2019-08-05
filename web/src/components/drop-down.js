import React, {Component} from "react";
import '../css/drop-down.css';
import $ from "jquery";
import arrow_down_blue_01 from './../images/arrow_down_blue_01.svg';

class DropDown extends Component {

    constructor(props){
        super(props);
        this.handleDropDownClick = this.handleDropDownClick.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleClickLi = this.handleClickLi.bind(this);
    }
    
    handleDropDownClick(e){
        $(e.currentTarget).attr('tabindex', 1).focus();
        $(e.currentTarget).toggleClass('active');
        $(e.currentTarget).find('.dropdown-menu').slideToggle(300);
    }

    handleBlur(e){
        $(e.currentTarget).removeClass('active');
        $(e.currentTarget).find('.dropdown-menu').slideUp(300);
    }

    handleClickLi(e){
        $(e.currentTarget).parents('.dropdown').find('span').text($(e.currentTarget).text());
        $(e.currentTarget).parents('.dropdown').find('input').attr('value', $(e.currentTarget).attr('id'));
    }

    render(){
        const placeholder = this.props.placeholder;
        const inputName = this.props.inputName;
        const options = this.props.options;
        const imagePlaceholder = this.props.imagePlaceholder;

        return (
            <button className="dropdown white-button" onClick={this.handleDropDownClick} onBlur={this.handleBlur}>
                    <div className="select">
                        <span> { placeholder ? placeholder: <img src={imagePlaceholder} alt=""/>} </span>
                        <img id="leftfeature-image" src={arrow_down_blue_01} alt=""/>
                    </div>
                    <input type="hidden" name={inputName} />
                    <ul className="dropdown-menu">
                        {
                            options.map((opt) => {
                                return (
                                    <li id={opt} onClick={this.handleClickLi}>
                                        {opt}
                                    </li>
                                )
                            }) 
                        }
                    </ul>
            </button>
        )
    }
}

export default DropDown;
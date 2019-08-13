import React from "react";
import $ from 'jquery';
import "./arrow-button.css";

const ArrowButton = ({placeholder,callback, params, imgPlaceHolder}) => {
    
    function handleDropDownClick(e){
        $(e.currentTarget).attr('tabindex', 1).focus();
        $(e.currentTarget).toggleClass('active');
        $(e.currentTarget).find('.dropdown-menu').slideToggle(300);
        if(callback && typeof callback === 'function'){
            callback(e, params);
        }
    }

    function handleBlur(e){
        $(e.currentTarget).removeClass('active');
        $(e.currentTarget).find('.dropdown-menu').slideUp(300);
    }

    return (
        <button className="arrow-button dropdown white-button non-active-black-border" onClick={(e) => {handleDropDownClick(e)}} onBlur={(e) => {handleBlur(e)}}>
                <div className="select">
                    { placeholder && (
                        <p>{placeholder}</p>
                    )}
                    <img src={imgPlaceHolder} alt=""/>
                </div>
        </button>
    )
    
}

export default ArrowButton;
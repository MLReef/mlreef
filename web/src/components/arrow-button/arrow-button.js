import React from "react";
import $ from 'jquery';
import "./arrow-button.css";

const ArrowButton = ({placeholder, callback, params, imgPlaceHolder, id}) => {
    
    function handleDropDownClick(e){
        $(e.currentTarget).attr('tabindex', 1).focus();
        $(e.currentTarget).toggleClass('active');
        $(e.currentTarget).find('.dropdown-menu').slideToggle(300);

        e.currentTarget.classList.contains("background-rotate") 
            ? $(e.currentTarget).removeClass("background-rotate")
            : $(e.currentTarget).addClass("background-rotate");
    

        if(callback && typeof callback === 'function'){
            callback(e, params);
        }
    }

    return (
        <div className="dropdown-btn-container-div">
            <button id={id}
                className="arrow-button dropdown white-button" 
                onClick={(e) => {handleDropDownClick(e)}} 
                style={{
                    background: `url(${imgPlaceHolder})`
                }}
            />
                { placeholder && (
                    <p>{placeholder}</p>
                )}
            
        </div>
    )
    
}

export default ArrowButton;
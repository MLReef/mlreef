import React from "react";
import loading from './../images/loading.gif'
import "../css/globalStyles.css";
import "../css/genericModal.css";

const LoadingModal = ({isShowing}) =>
    isShowing 
    ? <div className="generic-modal">
        <div 
            className="modal-content" 
            style={{
                height: 'max-content',
                width: 'max-content',
                minWidth: 0,
                minHeight: 0,
                left: '40%',
                top: '40%',
                backgroundColor: '#e5eff1'
            }}
        >
            <img src={loading} style={{width: 150, height: 150}} alt="loading gif"/>
        </div>
    </div>
    : null

export default LoadingModal;

import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Input from '../input';
import triangle_01 from '../../images/triangle-01.png';
import ArrowButton from "../arrow-button/arrow-button";


const SortableDataOperationItem = SortableElement(({ value }) => {
    const index = value.index++;
    return <span key={`data-operations-item-selected-${index}`} style={{ height: 'auto', display: 'flex', alignItems: 'center' }}>
        <p style={{ marginRight: '15px' }}><b>Op. {value.index}:</b></p>
        <div className="data-operations-item round-border-button shadowed-element" id={`data-operations-item-selected-${value.index}`}>
            <div className="header flexible-div">
                <div id="title-content">
                    <p className="bold-text">{value.title}</p>
                    <p>Created by <span className="bold-text">{value.username}</span></p>
                </div>
                <div id={`data-options-second-${value.index}`} className="data-oper-options flexible-div ">
                    <div>
                        <button id={`delete-btn-item-${value.index}`} onClick={value.deleteDataOperationEvent} className="dangerous-red">X</button>
                    </div>
                    <div onClick={value.copyDataOperationEvent}>
                        <button id={`copy-btn-item-${value.index}`} className="copy-btn-item" />
                        {/* <img src={file_01} style={{width: '1.8em'}} alt=""/> */}

                    </div>
                    <div>
                        <ArrowButton placeholder={""} imgPlaceHolder={triangle_01} params={{ index: value.index }} callback={() => {
                            const formDiv = document.getElementById(`data-operation-selected-form-${value.index}`);
                            formDiv.style.display = formDiv.style.display === "none" ? 'unset' : 'none';
                        }} />
                    </div>
                </div>
            </div>
            <div id={`data-operation-selected-form-${value.index}`} className="data-operation-form" style={{ display: 'none' }}>
                <br />
                <div style={{ display: 'flex' }}>
                    <p>Param 1: </p>
                    <Input id={`param-1-item-data-operation-selected-form-${value.index}`} placeholder="" />
                </div>
                <div style={{ display: 'flex' }}>
                    <p>Param 2: </p>
                    <Input id={`param-2-item-data-operation-selected-form-${value.index}`} placeholder="" />
                </div>
                <div className="advanced-opt-drop-down">
                    <div className="drop-down">
                        <p><b>Advanced</b></p>
                        <ArrowButton placeholder={""} imgPlaceHolder={triangle_01} params={{ index: value.index }} callback={() => {
                            const formDiv = document.getElementById(`advanced-opts-div-${value.index}`);
                            formDiv.style.display = formDiv.style.display === "none" ? 'unset' : 'none';
                        }}
                        />
                    </div>
                    <div style={{ width: '50%', textAlign: 'end' }}>
                        <p><b>Source code</b></p>
                    </div>
                </div>
                <div id={`advanced-opts-div-${value.index}`} className="advanced-opts-div" style={{ display: 'none' }}>
                    <div style={{ display: 'flex' }}>
                        <p>Param 3: </p>
                        <ArrowButton placeholder={"List value 1"} imgPlaceHolder={triangle_01} params={{ index: value.index }} />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <p>Param 4: </p>
                        <Input name={`param-2-item-data-operation-form-${value.index}`} id={`param-2-item-data-operation-form-${value.index}`} placeholder="Standard value" />
                    </div>
                </div>
            </div>
        </div> </span>
});


export const SortableDataOperationsList = SortableContainer(({ items }) =>
    <ul style={{ paddingLeft: '11px' }}>
        {items.map((value, index) => {
            value.index = index;
            return (
                <SortableDataOperationItem key={`item-${index}`} value={value} index={index} />
            )
        })}
    </ul>
);
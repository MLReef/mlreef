import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Input from '../input';
import triangle_01 from '../../images/triangle-01.png';
import ArrowButton from "../arrow-button/arrow-button";
import $ from 'jquery';
import advice_01 from '../../images/advice-01.png';
import { BOOL, errorMessages } from "../../data-types";

const SortableDataOperationItem = SortableElement(({ value }) => {
    const index = value.index++;
    return (
        <span key={`data-operations-item-selected-${index}`} style={{ height: 'auto', display: 'flex', alignItems: 'center' }}>
            <p style={{ marginRight: '15px' }}><b>Op. {value.index}:</b></p>
            <div
                className="data-operations-item round-border-button shadowed-element"
                id={`data-operations-item-selected-${value.index}`}
                key={`data-operations-item-selected-${value.index}`}
            >
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
                    {value.params.standard.map((param, index) =>
                        <>
                            <div style={{ display: 'flex' }}>
                                <p style={{ width: '14em' }}> {param.name}: </p>
                                <Input id={`param-${index}-item-data-operation-selected-form-${value.index}`} placeholder="" />
                            </div>
                            <div id={`error-div-for-param-${index}-item-data-operation-selected-form-${value.index}`} style={{ display: 'none' }}>
                                <img style={{ height: '15px' }} src={advice_01} alt="" />
                                <p style={{ margin: '0 0 0 5px' }}>{errorMessages[param.dataType]}</p>
                            </div>
                        </>
                    )}

                    {value.params.advanced &&
                        <div>
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
                                {value.params.advanced.map((advancedParam, advancedParamIndex) =>
                                    advancedParam.dataType === BOOL
                                        ? <div style={{ display: 'flex' }}>
                                            <p>{advancedParam.name}: </p>
                                            <div>
                                                <input
                                                    id={`ad-hidden-input-advanced-drop-down-${value.index}-param-${advancedParamIndex}`}
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => { }}
                                                />
                                                <ArrowButton
                                                    id={`advanced-drop-down-${value.index}-param-${advancedParamIndex}`}
                                                    placeholder={"Choose value"}
                                                    imgPlaceHolder={triangle_01}
                                                    params={{ index: value.index }}
                                                    callback={() => {
                                                        const el = document.getElementById(`options-for-bool-select-${value.index}`);

                                                        el.style.display = el.style.display === "none"
                                                            ? "unset"
                                                            : "none";
                                                    }}
                                                />
                                                <div style={{ display: 'none' }} id={`options-for-bool-select-${value.index}`}>
                                                    <ul style={{
                                                        boxShadow: '0 2px 4px rgb(0, 0, 0, 0.3)',
                                                        display: 'block !important',
                                                        position: 'absolute',
                                                        width: '80px',
                                                        height: 'auto',
                                                        background: '#fff',
                                                        borderRadius: '1em'
                                                    }}
                                                    >
                                                        <li>
                                                            <button style={{ border: 'none', backgroundColor: 'transparent' }}
                                                                onClick={(e) => {
                                                                    $(`#advanced-drop-down-${value.index}-param-${advancedParamIndex}`).click();

                                                                    document
                                                                        .getElementById(
                                                                            `ad-hidden-input-advanced-drop-down-${value.index}-param-${advancedParamIndex}`
                                                                        )
                                                                        .value = true
                                                                }}
                                                            >
                                                                Yes
                                                                    </button>
                                                        </li>
                                                        <li>
                                                            <button style={{ border: 'none', backgroundColor: 'transparent' }}
                                                                onClick={(e) => {
                                                                    $(`#advanced-drop-down-${value.index}`).click();
                                                                    document
                                                                        .getElementById(
                                                                            `ad-hidden-input-advanced-drop-down-${value.index}-param-${advancedParamIndex}`
                                                                        )
                                                                        .value = false
                                                                }}
                                                            >
                                                                No
                                                                    </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                        </div>
                                        :
                                        <>
                                            <div style={{ display: 'flex' }}>
                                                <p style={{ width: '14em' }}>{advancedParam.name}: </p>
                                                <Input id={`ad-param-${advancedParamIndex}-item-data-operation-form-${value.index}`} />
                                            </div>
                                            <div id={`error-div-for-ad-param-${advancedParamIndex}-item-data-operation-form-${value.index}`} style={{ display: 'none' }}>
                                                <img style={{ height: '15px' }} src={advice_01} alt="" />
                                                <p style={{ margin: '0 0 0 5px' }}>{errorMessages[advancedParam.dataType]}</p>
                                            </div>
                                        </>
                                )}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </span>
    )
});


export const SortableDataOperationsList = SortableContainer(({ items }) =>
    <ul style={{ paddingLeft: '11px' }} id="data-operations-selected-container" key={"data-operations-selected-container"}>
        {items.map((value, index) => {
            value.index = index;
            return (
                <SortableDataOperationItem key={`item-${index}`} value={value} index={index} />
            )
        })}
    </ul>
);
import React from 'react';
import star_01 from '../../images/star-01.png';
import triangle_01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';

export const DataOperationsList = ({
  handleDragStart,
  whenDataCardArrowButtonIsPressed,
  dataOperations,
}) => (
  <div id="data-operations-list">
    {dataOperations.map((dataOperation, index) => (
      <div
        draggable
        onDragStart={handleDragStart}
        className="data-operations-item round-border-button shadowed-element"
        id={`data-operations-item-${index}`}
        key={`key-data-operations-item-${index}`}
      >
        <div className="header flexible-div">
          <div id="title-content">
            <p className="bold-text">{dataOperation.title}</p>
            <p>
Created by
              <span className="bold-text">{dataOperation.username}</span>
            </p>
          </div>
          <div id={`data-options-first-${index}`} className="data-oper-options flexible-div">
            <div><img alt="" src={star_01} /></div>
            <div>
              <p>
                {dataOperation.starCount}
&nbsp;
              </p>
            </div>
            <div>
              <ArrowButton
                placeholder=""
                imgPlaceHolder={triangle_01}
                params={{ index }}
                callback={whenDataCardArrowButtonIsPressed}
              />
            </div>
          </div>
        </div>
        <div id={`description-data-operation-item-${index}`} style={{ display: 'none' }}>
          <p>
            {dataOperation.description}
          </p>
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p>
Data type:
              {dataOperation.dataType}
            </p>
            <p style={{ marginRight: '11px' }}><b>Source Code</b></p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

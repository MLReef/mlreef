import React, { useState } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import $ from 'jquery';
import { BOOL, errorMessages } from 'dataTypes';
import MTooltip from 'components/ui/MTooltip';
import advice01 from 'images/advice-01.png';
import Input from '../../input/input';
import ArrowButton from '../../arrow-button/arrowButton';
import './SortableDataProcessorList.scss';

const SortableProcessor = SortableElement(({
  props: {
    value,
    prefix,
    copyProcessor,
    deleteProcessor,
    index,
  },
}) => {
  const [isFormdivVisible, setIsFormdivVisible] = useState(true);
  function handleSelectClick(advancedParamIndex, newBoolValue) {
    $(`#advanced-drop-down-${value.internalProcessorId}-param-${advancedParamIndex}`).click();
    $(`#paragraph-op-${value.internalProcessorId}-value-${advancedParamIndex}`).text(newBoolValue ? 'Yes' : 'No');
    document
      .getElementById(
        `ad-hidden-input-advanced-drop-down-${value.internalProcessorId}-param-${advancedParamIndex}`,
      )
      .value = newBoolValue;
  }
  const sortedParameters = value
    .parameters?.sort((paramA, paramB) => paramA.order - paramB.order);
  const filterOperation = (paramType) => sortedParameters?.filter(
    (operation) => operation.required === paramType
  );

  const standardParameters = filterOperation(true);
  const advancedParameters = filterOperation(false);

  return (
    <span 
      key={`data-operations-item-selected-${value.internalProcessorId}`} 
      className="sortable-data-operation-list-item"
    >
      <p style={{ marginRight: '15px' }}>
        <b>
          {prefix || 'Op.'}
          {index + 1}
          :
        </b>
      </p>
      <div
        className="data-operations-item round-border-button shadowed-element"
        id={`data-operations-item-selected-${value.internalProcessorId}`}
        key={`data-operations-item-selected-${value.internalProcessorId}`}
      >
        <div className="header flexible-div">
          <div className="processor-title">
            <p className="bold-text">{value.name}</p>
            <p>
              Created by
              <span className="bold-text"> Keras</span>
            </p>
          </div>
          <div id={`data-options-second-${value.internalProcessorId}`} className="data-oper-options flexible-div ">
            <div>
              <button
                type="button"
                label="close"
                id={`delete-btn-item-${value.internalProcessorId}`}
                onClick={() => deleteProcessor(index)}
                className="btn btn-icon btn-hidden p-1 mr-1 fa fa-times"
              />
            </div>
            <div>
              <button
                type="button"
                label="copy"
                id={`copy-btn-item-${value.internalProcessorId}`}
                onClick={() => copyProcessor(index)}
                className="btn btn-icon btn-hidden p-1 fa fa-copy mr-1"
              />
            </div>
            <div>
              <ArrowButton callback={() => setIsFormdivVisible(!isFormdivVisible)} />
            </div>
          </div>
        </div>
        {isFormdivVisible && (
        <div className="data-operation-form">
          <br />
          <div style={{ width: 'max-content', margin: 'auto', marginLeft: '1rem' }}>
            {standardParameters && standardParameters.map((param, paramIndex) => (
              <div key={`std-${param.name}`}>
                <div className="d-flex mb-3">
                  <span className="mr-4" style={{ alignSelf: 'center', flex: 1 }}>
                    {param.description && (
                      <MTooltip
                        scale={120}
                        className="mr-1"
                        message={param.description}
                      />
                    )}
                    {`${param.name}: `}
                  </span>
                  <div className="my-auto">
                    <Input id={`param-${paramIndex}-item-data-operation-selected-form-${value.internalProcessorId}`} placeholder="" value={param.value} />
                  </div>
                </div>
                <div id={`error-div-for-param-${paramIndex}-item-data-operation-selected-form-${value.internalProcessorId}`} style={{ display: 'none' }}>
                  <img style={{ height: '15px' }} src={advice01} alt="" />
                  <p style={{ margin: '0 0 0 5px' }}>{errorMessages[param.dataType]}</p>
                </div>
              </div>
            ))}
          </div>

          {advancedParameters && (
            <div>
              <div className="advanced-opt-drop-down">
                <div className="drop-down">
                  <p className="mr-2"><b>Advanced</b></p>
                  <ArrowButton
                    callback={() => {
                      const formDiv = document.getElementById(`advanced-opts-div-${value.internalProcessorId}`);
                      formDiv.style.display = formDiv.style.display === 'none' ? 'unset' : 'none';
                    }}
                  />
                </div>
                <div style={{ width: '50%', textAlign: 'end' }}>
                  <p><b>Source code</b></p>
                </div>
              </div>
              <div id={`advanced-opts-div-${value.internalProcessorId}`} className="advanced-opts-div" style={{ width: 'max-content', margin: 'auto', marginLeft: '1rem' }}>
                {advancedParameters.map((advancedParam, advancedParamIndex) => {
                  const defaultValue = advancedParam.default_value;
                  return (
                    advancedParam.dataType === BOOL
                      ? (
                        <div key={`adv-${advancedParam.name}`} className="d-flex mb-3">
                          <span className="mr-4" style={{ alignSelf: 'center', flex: 1 }}>
                            {advancedParam.description && (
                              <MTooltip
                                scale={120}
                                className="mr-1"
                                message={advancedParam.description}
                              />
                            )}
                            {`${advancedParam.name}: `}
                          </span>
                          <div>
                            <input
                              id={`ad-hidden-input-advanced-drop-down-${value.internalProcessorId}-param-${advancedParamIndex}`}
                              style={{ display: 'none' }}
                              onChange={() => { }}
                              value={advancedParam.value}
                            />
                            <div style={{ display: 'flex' }}>
                              <ArrowButton
                                id={`advanced-drop-down-${value.internalProcessorId}-param-${advancedParamIndex}`}
                                callback={() => {
                                  const el = document.getElementById(`options-for-bool-select-${value.internalProcessorId}-ad-param-${advancedParamIndex}`);

                                  el.style.display = el.style.display === 'none'
                                    ? 'unset'
                                    : 'none';
                                }}
                              />
                              <p
                                id={`paragraph-op-${value.internalProcessorId}-value-${advancedParamIndex}`}
                              >
                                {advancedParam.value === 'true' ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div style={{ display: 'none' }} id={`options-for-bool-select-${value.internalProcessorId}-ad-param-${advancedParamIndex}`}>
                              <ul style={{
                                boxShadow: '0 2px 4px rgb(0, 0, 0, 0.3)',
                                display: 'block !important',
                                position: 'absolute',
                                width: '80px',
                                height: 'auto',
                                background: '#fff',
                                borderRadius: '1em',
                              }}
                              >
                                <li>
                                  <button
                                    type="button"
                                    style={{ border: 'none', backgroundColor: 'transparent' }}
                                    onClick={() => handleSelectClick(advancedParamIndex, true)}
                                  >
                                    Yes
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    style={{ border: 'none', backgroundColor: 'transparent' }}
                                    onClick={
                                      () => handleSelectClick(advancedParamIndex, false)
                                    }
                                  >
                                    No
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>

                        </div>
                      )
                      : (
                        <div key={`adv-${advancedParam.name}`}>
                          <div className="d-flex mb-3">
                            <span className="mr-4" style={{ alignSelf: 'center', flex: 1 }}>
                              {advancedParam.description && (
                                <MTooltip
                                  scale={120}
                                  className="mr-1"
                                  message={advancedParam.description}
                                />
                              )}
                              {`${advancedParam.name}: `}
                            </span>
                            <Input
                              id={`ad-param-${advancedParamIndex}-item-data-operation-form-${value.internalProcessorId}`}
                              placeholder={String(defaultValue)}
                              value={advancedParam.value}
                            />
                          </div>
                          <div
                            style={{ display: 'none' }}
                          >
                            <img style={{ height: '15px' }} src={advice01} alt="" />
                            <p style={{ margin: '0 0 0 5px' }}>{errorMessages[advancedParam.dataType]}</p>
                          </div>
                        </div>
                      )
                  );
                })}
              </div>
            </div>
            )}
        </div>
        )}
      </div>
      <span className="sortable-data-operation-list-item-arrow" />
      <span className="sortable-data-operation-list-item-separator" />
    </span>
  );
});

const SortableProcessorsList = SortableContainer(({
  items, prefix, copyProcessor, deleteProcessor,
}) => (
  <ul style={{ paddingLeft: '11px' }} id="data-operations-selected-container" key="data-operations-selected-container">
    {items.map((value, index) => {
      const props = {
        value,
        index,
        prefix,
        copyProcessor,
        deleteProcessor,
      };
      return (
        <SortableProcessor
          index={index}
          key={`item-${value.internalProcessorId}`}
          props={props}
        />
      );
    })}
  </ul>
));

export default SortableProcessorsList;

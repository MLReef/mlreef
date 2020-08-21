import React, { useState, useRef } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { BOOLEAN, errorMessages, STRING } from 'dataTypes';
import { string, bool, shape } from 'prop-types';
import MTooltip from 'components/ui/MTooltip';
import validateInput, { isJson } from 'functions/validations';
import MWrapper from 'components/ui/MWrapper';
import advice01 from 'images/advice-01.png';
import Input from '../../input/input';
import ArrowButton from '../../arrow-button/arrowButton';
import './SortableDataProcessorList.scss';

const ErrorsDiv = ({ typeOfField }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img style={{ height: '15px' }} src={advice01} alt="" />
    <p style={{ margin: '0 0 0 5px', color: 'red' }}>{errorMessages[typeOfField]}</p>
  </div>
);

ErrorsDiv.propTypes = {
  typeOfField: string.isRequired,
};

export const InputParam = ({ param }) => {
  const [hasErrors, setHasErrors] = useState(false);
  function validateFields(e) {
    setHasErrors(!validateInput(e.currentTarget.value, param.type, param.required));
  }
  return (
    <div className="mb-3">
      <div className="d-flex">
        <span className="mr-auto" style={{ alignSelf: 'center', padding: '0rem 1rem' }}>
          {param.description && (
          <MTooltip
            scale={120}
            className="mr-1"
            message={param.description}
          />
          )}
          {`${param.name}: `}
        </span>
        <Input
          callback={validateFields}
          onBlurCallback={validateFields}
          placeholder={String(param.default_value)}
          value={param.value}
          hasErrors={hasErrors}
        />
      </div>
      {hasErrors && (<ErrorsDiv typeOfField={param.type} />)}
    </div>
  );
};

InputParam.propTypes = {
  param: shape({
    type: string.isRequired,
    required: bool.isRequired,
    description: string,
    name: string.isRequired,
    default_value: string,
    value: string,
  }).isRequired,
};

export const SelectComp = ({
  param,
  isBoolean,
}) => {
  let options;
  let defaultValue;
  if (isBoolean) {
    defaultValue = param.value || param.default_value;
    options = [
      { label: 'True', value: 'true' },
      { label: 'False', value: 'false' },
    ];
  } else {
    // default_value is used in list fields to persist the options ofr user
    options = JSON.parse(param.default_value);
    defaultValue = param.value || '';
  }
  options = [{ label: 'Select..', value: '' }, ...options];
  const dropDownRef = useRef();
  const [value, setValue] = useState(defaultValue);
  const [placeHolder, setPlaceHolder] = useState(value || 'Select..');
  const [hasErrors, setHasErrors] = useState(false);
  const [isShowingOptions, setIsShowingOptions] = useState(false);

  function handleSelectClick(opt) {
    setPlaceHolder(opt.label || opt.value);
    setValue(opt.value);
    setHasErrors(!validateInput(opt.value, param.type, param.required));
    setIsShowingOptions(!isShowingOptions);
  }

  function handleBodyClick(e) {
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
    if (!dropDownRef.current) return;
    if (!dropDownRef.current.contains(clickedElement)) {
      setIsShowingOptions(false);
    }
  }

  return (
    <>
      <div className="select-comp d-flex mb-3">
        <span className="mr-auto" style={{ alignSelf: 'center', overflow: 'hidden', padding: '0rem 1rem' }}>
          {param.description && (
          <MTooltip
            scale={120}
            className="mr-1"
            message={param.description}
          />
          )}
          {`${param.name}: `}
        </span>
        <div className="dropdown" ref={dropDownRef}>
          <input
            style={{ display: 'none' }}
            value={value}
            onChange={() => {}}
          />
          <ArrowButton
            placeholder={placeHolder}
            buttonStyle={{ width: '16ch', display: 'flex', justifyContent: 'space-evenly' }}
            initialIsOpened={isShowingOptions}
            callback={() => {
              const nextIsShowingOoptions = !isShowingOptions;
              const bodyTag = document.body;
              if (nextIsShowingOoptions) {
                bodyTag.addEventListener('click', handleBodyClick);
              } else {
                bodyTag.removeEventListener('click', handleBodyClick);
              }
              setIsShowingOptions(nextIsShowingOoptions);
            }}
          />
          {isShowingOptions && (
          <ul>
            {options.map((opt) => (
              <li
                key={opt.value}
                className="d-flex"
              >
                <button
                  type="button"
                  onClick={() => handleSelectClick(opt)}
                >
                  {opt.label ? opt.label : opt.value}
                </button>
              </li>
            ))}
          </ul>
          )}
        </div>
      </div>
      {hasErrors && (<ErrorsDiv typeOfField={param.type} />)}
    </>
  );
};

SelectComp.propTypes = {
  param: shape({
    default_value: string,
    description: string.isRequired,
    name: string.isRequired,
    type: string.isRequired,
  }),
  isBoolean: bool.isRequired,
};

SelectComp.defaultProps = {
  param: { default_value: '' },
};

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
  const [isAdvancedSectionVisible, setIsAdvancedSectionVisible] = useState(true);
  const sortedParameters = value
    .parameters?.sort((paramA, paramB) => paramA.order - paramB.order);
  const filterOperation = (paramType) => sortedParameters?.filter(
    (operation) => operation.required === paramType
  );
  const hasTheFormErrors = value.parameters?.filter((param) => param.hasErrors === true).length > 0;

  const standardParameters = filterOperation(true);
  const advancedParameters = filterOperation(false);

  const linkToResnetRepo = () => {
    window.location.assign('http://staging.mlreef.com/mlreef/commons-resnet-50');
  };

  return (
    <span
      key={`item-selected-${value.internalProcessorId}`}
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
        key={`data-operations-item-selected-${value.internalProcessorId}`}
        style={hasTheFormErrors ? { border: '1px solid red' } : {}}
      >
        <div className="header flexible-div">
          <div className="processor-title">
            <p className="bold-text">
              {value.name === 'Resnet50'
                ? (
                  <button
                    type="button"
                    className="btn btn-hidden bold-text"
                    onClick={() => linkToResnetRepo()}
                  >
                    {value.name}
                  </button>
                ) : value.name}
            </p>
            <p>
              Created by
              <span className="bold-text"> Keras</span>
            </p>
          </div>
          <div className="data-oper-options flexible-div ">
            <div>
              <button
                type="button"
                label="close"
                id={`delete-btn-item-${value.internalProcessorId}`}
                onClick={() => deleteProcessor(index)}
                className="btn btn-icon btn-hidden p-1 mr-1 fa fa-times"
              />
            </div>
            <MWrapper norender msg="From #671 .39">
              <div>
                <button
                  type="button"
                  label="copy"
                  id={`copy-btn-item-${value.internalProcessorId}`}
                  onClick={() => copyProcessor(index)}
                  className="btn btn-icon btn-hidden p-1 fa fa-copy mr-1"
                />
              </div>
            </MWrapper>
            <ArrowButton id="showform-button" callback={() => setIsFormdivVisible(!isFormdivVisible)} />
          </div>
        </div>

        <div className={`data-operation-item-form ${isFormdivVisible ? '' : 'd-none'}`}>
          <br />
          <div style={{ width: 'max-content', margin: 'auto', marginLeft: '1rem' }}>
            {standardParameters && standardParameters.map((param) => {
              const isSelectable = param.type === BOOLEAN || (param.type === STRING && isJson(param.default_value));
              if (isSelectable) {
                return (
                  <SelectComp
                    key={`${value.internalProcessorId} ${param.name}`}
                    param={param}
                    isBoolean={!isJson(param.default_value)}
                  />
                );
              }
              return <InputParam param={param} key={`${value.internalProcessorId} ${param.name}`} />;
            })}
          </div>

          {advancedParameters && (
            <div>
              <div className="advanced-opt-drop-down">
                <div className="drop-down">
                  <p className="mr-2"><b>Advanced</b></p>
                  <ArrowButton
                    id="advanced-dropdown-btn"
                    callback={() => setIsAdvancedSectionVisible(!isAdvancedSectionVisible)}
                  />
                </div>
                <div style={{ width: '50%', textAlign: 'end' }}>
                  <p>
                    <b>
                      {value.name === 'Resnet50'
                        ? (
                          <button
                            type="button"
                            className="btn btn-hidden bold-text"
                            onClick={() => linkToResnetRepo()}
                          >
                            Source code
                          </button>
                        )
                        : 'Source Code'}
                    </b>
                  </p>
                </div>
              </div>
              {isAdvancedSectionVisible && (
                <div className="advanced-opts-div" style={{ width: 'max-content', margin: 'auto', marginLeft: '1rem' }}>
                  {advancedParameters && advancedParameters.map((advancedParam) => {
                    const isSelectable = advancedParam.type === BOOLEAN || (advancedParam.type === STRING && isJson(advancedParam.default_value));
                    if (isSelectable) {
                      return (
                        <SelectComp
                          key={`${value.internalProcessorId} ${advancedParam.name}`}
                          param={advancedParam}
                          isBoolean={!isJson(advancedParam.default_value)}
                        />
                      );
                    }
                    return <InputParam param={advancedParam} key={`${value.internalProcessorId} ${advancedParam.name}`} />;
                  })}
                </div>
              )}
            </div>
          )}
        </div>

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

import React, { useContext, useState } from 'react';
import { SortableElement } from 'react-sortable-hoc';
import { BOOLEAN, STRING } from 'dataTypes';
import { arrayOf, shape } from 'prop-types';
import { isJson } from 'functions/validations';
import ArrowButton from 'components/arrow-button/arrowButton';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import InputParam from './InputParam';
import { SelectComp } from '../SelectComp/SelectComp';
import { REMOVE_DATA_PROCESSOR_BY_ID, VALIDATE_FORM } from '../DataPipelineHooks/actions';
import DataOperatorCodeSection from './DataOperatorCodeSection/DataOperatorCodeSection';

const SortableProcessor = SortableElement(({
  value,
  addInfo: {
    index,
    prefix,
  },
}) => {
  const [, dispatch] = useContext(DataPipelinesContext);
  const [isFormdivVisible, setIsFormdivVisible] = useState(true);
  const [isAdvancedSectionVisible, setIsAdvancedSectionVisible] = useState(true);
  const { nameSpace, slug } = value;
  const sortedParameters = value
    .parameters?.sort((paramA, paramB) => paramA.order - paramB.order);
  const filterOperation = (paramType) => sortedParameters?.filter(
    (operation) => operation.required === paramType,
  );
  const hasTheFormErrors = value.parameters?.filter((param) => param.hasErrors === true).length > 0;

  const standardParameters = filterOperation(true);
  const advancedParameters = filterOperation(false);

  function deleteProcessor() {
    dispatch({ type: REMOVE_DATA_PROCESSOR_BY_ID, id: value.id });
    dispatch({ type: VALIDATE_FORM });
  }

  const linkToRepo = () => {
    window.open(`/${nameSpace}/${slug}`);
  };

  return (
    <li key={`item-selected-${value.id}`} style={{ listStyle: 'none' }}>
      <span
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
          data-tutorial={value.name}
          className="sortable-data-operation-list-item-container round-border-button shadowed-element"
          style={hasTheFormErrors ? { border: '1px solid red' } : {}}
        >
          <div className="sortable-data-operation-list-item-container-header">
            <div className="sortable-data-operation-list-item-container-header-title">
              <p>
                <button
                  type="button"
                  className="btn btn-hidden "
                  onClick={linkToRepo}
                >
                  <b>{value.name}</b>
                </button>
              </p>
              {nameSpace && (
              <p>
                Created by
                {' '}
                <b>{nameSpace}</b>
              </p>
              )}
            </div>
            <div className="sortable-data-operation-list-item-container-header-options">
              <div>
                <button
                  type="button"
                  label="close"
                  onClick={() => deleteProcessor(index)}
                  className="btn btn-icon btn-hidden p-1 mr-1 fa fa-times close"
                />
                <ArrowButton initialIsOpened className="render-form-button" callback={() => setIsFormdivVisible(!isFormdivVisible)} />
              </div>
            </div>
          </div>
          <hr />
          {isFormdivVisible && (
          <div className="sortable-data-operation-list-item-container-form">
            <p className="advice-1">You need to set the following parameters</p>
            <br />
            <div style={{ width: 'max-content', margin: 'auto', marginLeft: '1rem' }}>
              <ParametersSection
                parameters={standardParameters}
                value={value}
              />
            </div>

            {advancedParameters?.length > 0 && (
            <div className="sortable-data-operation-list-item-container-form-advanced">
              <div className="sortable-data-operation-list-item-container-form-advanced-ops">
                <label htmlFor="open-ad-params">
                  <ArrowButton
                    id="open-ad-params"
                    initialIsOpened
                    className="drop-down"
                    callback={() => setIsAdvancedSectionVisible(!isAdvancedSectionVisible)}
                  />
                  Advanced
                </label>
              </div>
              <p className="advice-2">
                Advanced arameters are optional and always have a different value
              </p>
              {isAdvancedSectionVisible && (
              <div className="sortable-data-operation-list-item-container-form-advanced-params" style={{ width: 'max-content', margin: 'auto', marginLeft: '1rem' }}>
                <ParametersSection
                  parameters={advancedParameters}
                  value={value}
                />
              </div>
              )}
            </div>
            )}
            <DataOperatorCodeSection processor={value} />
          </div>
          )}
        </div>
      </span>
    </li>
  );
});

export default SortableProcessor;

const ParametersSection = ({
  parameters, value,
}) => parameters.map((parameter) => {
  const isSelectable = parameter.type === BOOLEAN
      || (parameter.type === STRING && isJson(parameter.default_value));
  if (isSelectable) {
    return (
      <SelectComp
        key={`${value.id} ${parameter.name}`}
        param={parameter}
        dataProcessorId={value.id}
        isBoolean={!isJson(parameter.default_value)}
      />
    );
  }
  return (
    <InputParam
      key={`${value.id} ${parameter.name}`}
      param={parameter}
      dataProcessorId={value.id}
    />
  );
});

ParametersSection.propTypes = {
  parameters: arrayOf(shape()),
};

ParametersSection.defaultProps = {
  parameters: [],
};

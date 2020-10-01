import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import React, { useContext, useEffect, useState } from 'react';
import { SortableElement } from 'react-sortable-hoc';
import { BOOLEAN, STRING } from 'dataTypes';
import { isJson } from 'functions/validations';
import ArrowButton from 'components/arrow-button/arrowButton';
import MWrapper from 'components/ui/MWrapper';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import InputParam from './InputParam';
import { SelectComp } from './SelectComp';
import { REMOVE_DATA_PROCESSOR_BY_ID, VALIDATE_FORM } from '../DataPipelineHooks/actions';

const projectInstance = new ProjectGeneralInfoApi();

const SortableProcessor = SortableElement(({
  props: {
    value,
    index,
    prefix,
    filesSelectedInModal,
  },
}) => {
  const [, dispatch] = useContext(DataPipelinesContext);
  const [isFormdivVisible, setIsFormdivVisible] = useState(true);
  const [isAdvancedSectionVisible, setIsAdvancedSectionVisible] = useState(true);
  const [codeProjectURL, setCodeProjectURL] = useState({});
  const { gitlab_namespace: nameSpace, slug } = codeProjectURL;
  const sortedParameters = value
    .parameters?.sort((paramA, paramB) => paramA.order - paramB.order);
  const filterOperation = (paramType) => sortedParameters?.filter(
    (operation) => operation.required === paramType,
  );
  const hasTheFormErrors = value.parameters?.filter((param) => param.hasErrors === true).length > 0;

  const standardParameters = filterOperation(true);
  const advancedParameters = filterOperation(false);

  useEffect(() => {
    projectInstance.getCodeProjectById(value.codeProjectId)
      .then((res) => setCodeProjectURL(res));
  }, [value]);

  function deleteProcessor() {
    dispatch({ type: REMOVE_DATA_PROCESSOR_BY_ID, id: value.internalProcessorId });
    dispatch({ type: VALIDATE_FORM });
  }

  const linkToRepo = () => {
    window.open(`/${nameSpace}/${slug}`);
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
        <div className="header d-flex">
          <div className="processor-title">
            <p>
              <button
                type="button"
                className="btn btn-hidden "
                onClick={() => linkToRepo()}
              >
                <b>{value.name}</b>
              </button>
            </p>
            <p>
              Created by
              {' '}
              <span><b>Keras</b></span>
            </p>
          </div>
          <div className="data-oper-options d-flex">
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
                    /* onClick={() => copyProcessor(index)} */
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
            {standardParameters && (
            <ParametersSection
              parameters={standardParameters}
              filesSelectedInModal={filesSelectedInModal}
              value={value}
            />
            )}
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
              <button
                type="button"
                className="btn btn-hidden ml-auto"
                onClick={() => linkToRepo()}
                style={{ fontWeight: 600, margin: 0 }}
              >
                View Repository
              </button>
            </div>
            {isAdvancedSectionVisible && (
            <div className="advanced-opts-div" style={{ width: 'max-content', margin: 'auto', marginLeft: '1rem' }}>
              {advancedParameters && (
              <ParametersSection
                parameters={advancedParameters}
                filesSelectedInModal={filesSelectedInModal}
                value={value}
              />
              )}
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

export default SortableProcessor;

const ParametersSection = ({
  parameters, value, filesSelectedInModal,
}) => parameters.map((parameter) => {
  const isSelectable = parameter.type === BOOLEAN
      || (parameter.type === STRING && isJson(parameter.default_value));
  if (isSelectable) {
    return (
      <SelectComp
        key={`${value.internalProcessorId} ${parameter.name}`}
        param={parameter}
        dataProcessorId={value.internalProcessorId}
        isBoolean={!isJson(parameter.default_value)}
      />
    );
  }
  let finalValue = parameter.value;
  if (parameter.name === 'input-path') {
    finalValue = filesSelectedInModal[0]?.path;
  }
  return (
    <InputParam
      key={`${value.internalProcessorId} ${parameter.name}`}
      param={{ ...parameter, value: finalValue }}
      dataProcessorId={value.internalProcessorId}
    />
  );
});

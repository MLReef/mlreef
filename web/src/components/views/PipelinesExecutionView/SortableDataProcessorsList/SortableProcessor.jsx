import React, { useContext, useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { SortableElement } from 'react-sortable-hoc';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import { BOOLEAN, STRING } from 'dataTypes';
import { arrayOf, shape } from 'prop-types';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import CommitsApi from 'apis/CommitsApi';
import { isJson } from 'functions/validations';
import ArrowButton from 'components/arrow-button/arrowButton';
import MSelect from 'components/ui/MSelect';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import InputParam from './InputParam';
import { SelectComp } from '../SelectComp/SelectComp';
import { COPY_DATA_PROCESSOR_BY_INDEX, REMOVE_DATA_PROCESSOR_BY_INDEX, UPDATE_OPERATOR_SELECTED, VALIDATE_FORM } from '../DataPipelineHooks/actions';
import DataOperatorCodeSection from './DataOperatorCodeSection/DataOperatorCodeSection';

const projectApi = new ProjectGeneralInfoApi();
const commitApi = new CommitsApi();

const SortableProcessor = SortableElement(({
  value,
  addInfo: {
    index,
    prefix,
  },
}) => {
  const selectedDataProcessor = value.processors[value.processorSelected];
  const [versionInfo, setVersionInfo] = useState({});
  const [commitInfo, setCommitInfo] = useState({});

  useEffect(() => {
    projectApi.getVersionDataByBranchAndVId(
      value.id,
      selectedDataProcessor.branch,
      selectedDataProcessor.version,
    )
      .then((res) => {
        setVersionInfo(res);
        return commitApi.getCommitDetails(value.gid, res.commit_sha);
      })
      .then(setCommitInfo)
      .catch((err) => toastr.error('Error', err?.message));
  }, [selectedDataProcessor.branch, selectedDataProcessor.version, value.id]);

  const [, dispatch] = useContext(DataPipelinesContext);
  const [isFormdivVisible, setIsFormdivVisible] = useState(true);
  const [isAdvancedSectionVisible, setIsAdvancedSectionVisible] = useState(true);
  const { nameSpace, slug } = value;
  const sortedParameters = selectedDataProcessor
    .parameters?.sort((paramA, paramB) => paramA.order - paramB.order);
  const filterOperation = (paramType) => sortedParameters?.filter(
    (operation) => operation.required === paramType,
  );
  const hasTheFormErrors = selectedDataProcessor
    .parameters
    ?.filter((param) => param.hasErrors === true).length > 0;

  const standardParameters = filterOperation(true);
  const advancedParameters = filterOperation(false);

  function deleteProcessor() {
    dispatch({ type: REMOVE_DATA_PROCESSOR_BY_INDEX, index });
    dispatch({ type: VALIDATE_FORM });
  }

  function copyProcessor() {
    dispatch({ type: COPY_DATA_PROCESSOR_BY_INDEX, index });
    dispatch({ type: VALIDATE_FORM });
  }

  const linkToRepo = () => {
    window.open(`/${nameSpace}/${slug}`);
  };

  return (
    <li
      id={`sortable ${selectedDataProcessor.id} ${index}`}
      key={`item-selected-${selectedDataProcessor.id} ${index}`}
      style={{ listStyle: 'none' }}
    >
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
          data-tutorial={selectedDataProcessor.name}
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
                  <b>{selectedDataProcessor.name}</b>
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
              <MSelect
                options={
                 value
                   .processors
                   .map((p, ind) => ({ label: `${p.branch} - V.${p.version}`, value: ind }))
              }
                value={value.processorSelected}
                onSelect={(ind) => {
                  dispatch({
                    type: UPDATE_OPERATOR_SELECTED,
                    processorId: value.id,
                    newProcessorSelected: ind,
                  });
                }}
              />
              <div className="sortable-data-operation-list-item-container-header-options-main">
                <button
                  type="button"
                  label="close"
                  onClick={copyProcessor}
                  className="btn btn-icon btn-hidden p-1 mr-1 fas fa-copy copy"
                />
                <button
                  type="button"
                  label="close"
                  onClick={deleteProcessor}
                  className="btn btn-icon btn-hidden p-1 mr-1 fa fa-times close"
                />
                <ArrowButton initialIsOpened className="render-form-button" callback={() => setIsFormdivVisible(!isFormdivVisible)} />
              </div>
            </div>
          </div>
          {commitInfo.id ? (
            <div className="sortable-data-operation-list-item-container-user-info">
              <p className="sortable-data-operation-list-item-container-user-info-mss">
                Commit message from last push:
                {' '}
                {commitInfo.message}
              </p>
              <p>
                Updated:
                {' '}
                {getTimeCreatedAgo(commitInfo.authored_date)}
              </p>
            </div>
          ) : (
            <div style={{
              height: '1.5rem',
              backgroundColor: 'var(--almostWhite)',
              margin: '0 1rem',
              borderRadius: '0.25rem',
            }}
            />
          )}
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
            {selectedDataProcessor.codeProjectId && (
              <DataOperatorCodeSection
                gid={value.gid}
                entryPointPath={versionInfo.entry_file}
                processor={selectedDataProcessor}
                commitSha={commitInfo.id}
              />
            )}
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

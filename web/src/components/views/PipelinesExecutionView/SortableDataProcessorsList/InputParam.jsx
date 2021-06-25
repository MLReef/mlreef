import React, { useContext, useEffect, useState } from 'react';
import Input from 'components/ui/input/input';
import MTooltip from 'components/ui/MTooltip';
import validateInput from 'functions/validations';
import { bool, shape, string } from 'prop-types';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import ErrorsDiv from './ErrorsDiv';
import { VALIDATE_FORM } from '../DataPipelineHooks/actions';

const InputParam = ({ param, dataProcessorId, index }) => {
  const [{ filesSelectedInModal }, dispatch] = useContext(DataPipelinesContext);
  const [hasErrors, setHasErrors] = useState(false);
  useEffect(() => {
    if (param.name === 'input-path') {
      const newValue = param.value || filesSelectedInModal[0]?.path;
      dispatch({
        type: 'UPDATE_PARAM_VALUE_IN_DATA_OPERATOR',
        newParamValue: newValue,
        paramName: param.name,
        procSelectedId: dataProcessorId,
        index,
        isValid: validateInput(newValue, param.type, param.required),
      });
    } else if (param.value) {
      dispatch({
        type: 'UPDATE_PARAM_VALUE_IN_DATA_OPERATOR',
        newParamValue: param.value,
        paramName: param.name,
        procSelectedId: dataProcessorId,
        index,
        isValid: validateInput(param.value, param.type, param.required),
      });
    }
    dispatch({ type: VALIDATE_FORM });
  }, [
    dataProcessorId,
    dispatch,
    param.name,
    param.required,
    param.type,
    param.value,
    index,
    filesSelectedInModal,
  ]);

  function validateFields(e) {
    const isValid = validateInput(e.currentTarget.value, param.type, param.required);
    setHasErrors(!isValid);
    dispatch({
      type: 'UPDATE_PARAM_VALUE_IN_DATA_OPERATOR',
      newParamValue: e.currentTarget.value,
      paramName: param.name,
      procSelectedId: dataProcessorId,
      index,
      isValid,
    });
    dispatch({ type: VALIDATE_FORM });
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
          placeholder={String(param.default_value)}
          value={param.name === 'input-path' ? filesSelectedInModal[0]?.path || param.value : param.value}
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
  dataProcessorId: string.isRequired,
};

export default InputParam;

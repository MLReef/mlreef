import React, {
  useContext, useEffect, useState,
} from 'react';
import { toastr } from 'react-redux-toastr';
import { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import { SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL } from './DataPipelineHooks/actions';

const ExecuteButton = () => {
  const [{
    isFormValid,
    filesSelectedInModal,
    processorsSelected,
  }, dispatch] = useContext(DataPipelinesContext);
  const [isDisabled, setIsDisabled] = useState(isFormValid);
  useEffect(() => {
    setIsDisabled(!isFormValid);
  }, [isFormValid]);
  return (
    <button
      id="execute-button"
      style={isDisabled ? { backgroundColor: '#F6F6F6', border: '1px solid #b2b2b2', color: '#2dbe91' } : {}}
      key="pipeline-execute"
      type="button"
      onClick={() => {
        if (isDisabled) {
          if (filesSelectedInModal.length === 0) {
            toastr.info('Error in files', 'Select first the input files in the Select data modal');
          }
          if (processorsSelected.length === 0) {
            toastr.info('Error in operators', 'Select operators in order to execute on your input files');
          }
          return;
        }
        dispatch({
          type: SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL,
          isShowingExecutePipelineModal: true,
        });
      }}
      className="btn btn-primary btn-sm border-none"
    >
      Execute
    </button>
  );
};

export default ExecuteButton;

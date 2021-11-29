import React, { useCallback } from 'react';
import { toastr } from 'react-redux-toastr';
import MFileExplorer from 'components/ui/MFileExplorer';
import { useHistory } from 'router';
import {
  arrayOf, func, shape, string,
} from 'prop-types';
import publishingActions from "./../publishingActions";

const SelectEntryPoint = ({
  entryPointFile,
  files,
  branches,
  selectedBranch,
  dispatch,
  path,
  namespace,
  slug,
}) => {
  const history = useHistory();
  const isEntryPointFormValid = !!entryPointFile && selectedBranch !== '';

  let filesModified = files;
  if (entryPointFile) {
    filesModified = files
      .map((f) => ({
        ...f,
        disabled: f.id !== entryPointFile.id,
      }));
  }

  const onFileSelected = (fileId, _, newValue) => {
    if (!newValue) {
      dispatch({ type: 'SET_ENTRY_POINT', payload: null });
      return;
    }
    const file = files.filter((f) => f.id === fileId)[0];
    const splitName = file.name.split('.');
    const ext = splitName.slice(-1)[0];
    if (ext !== 'py') {
      toastr.error('Error', 'Entry point is invalid, it must be a python script');
      return;
    }
    dispatch({ type: 'SET_ENTRY_POINT', payload: file });
  };

  return (
    <div className="row" style={{ minHeight: '60vh' }}>
      <div className="col-3" />
      <div className="col-6">
        <div className="statement">
          <div className="statement-title">
            Select the entry point for your model
          </div>
          <div className="statement-subtitle">
            The make your model automatically executable for the entire
            community, you need to select the entry python file of a given branch.
          </div>
        </div>
        <MFileExplorer
          activeBranch={selectedBranch}
          selectable
          files={path ? [{ id: '1', type: 'tree', name: '...' }, ...filesModified] : filesModified}
          branches={branches}
          onEnterDir={(f) => {
            let newPath = f.path;
            if (f.id === '1') {
              newPath = publishingActions.getPreviousPath(path);
            }
            dispatch({ type: 'SET_PATH', payload: newPath })
          }}
          onFileSelected={onFileSelected}
          onBranchSelected={(branch) => {
            dispatch({ type: 'SET_SELECTED_BRANCH', payload: branch });
            dispatch({ type: 'SET_ENTRY_POINT', payload: null });
            dispatch({ type: 'SET_FILES', payload: [] });
          }}
        />
      </div>
      <div className="col-3 pl-3">
        <div className="publishing-view-summary">
          <div className="parameter mb-3">
            <span className="parameter-key">
              Selected:
            </span>
            <strong className="parameter-value t-danger">
              {entryPointFile ? entryPointFile.name : 'No entry point selected'}
            </strong>
          </div>
          <div className="parameter mb-3">
            <span className="parameter-key">
              Branch:
            </span>
            <strong className="parameter-value t-primary">
              {selectedBranch}
            </strong>
          </div>
          <button
            type="button"
            disabled={!isEntryPointFormValid}
            className="btn btn-dark"
            onClick={() => {
              history.push(`/${namespace}/${slug}/-/publishing/branch/${selectedBranch}/#select-base-environment`);
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

SelectEntryPoint.propTypes = {
  entryPointFile: shape({ name: string }),
  files: arrayOf(shape({})),
  branches: arrayOf(shape({})).isRequired,
  selectedBranch: string,
  dispatch: func.isRequired,
  path: string,
  namespace: string.isRequired,
  slug: string.isRequired,
};

SelectEntryPoint.defaultProps = {
  entryPointFile: null,
  files: [],
  selectedBranch: string,
  path: null,
};

export default SelectEntryPoint;

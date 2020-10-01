import React, { useContext, useEffect, useState } from 'react';
import {
  shape, number, string, arrayOf,
} from 'prop-types';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import './SelectDataPipelineModal.scss';
import MDropdown from 'components/ui/MDropdown';
import ReturnLink from 'components/returnLink';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import FilesApi from 'apis/FilesApi';
import { DataPipelinesContext } from '../DataPipelineHooks/DataPipelinesProvider';
import { SET_BRANCH_SELECTED, SET_IS_VISIBLE_FILES_MODAL, UPDATE_FILES_SELECTED_IN_MODAL, VALIDATE_FORM } from '../DataPipelineHooks/actions';

const folderIcon = '/images/svg/folder_01.svg';
const fileIcon = '/images/svg/file_01.svg';
const filesApi = new FilesApi();

export const UnconnectedSelectDataPipelineModal = (props) => {
  const [{ isVisibleSelectFilesModal }, dispatch] = useContext(DataPipelinesContext);
  const {
    project: {
      defaultBranch,
      gid,
      gitlabName: projectName,
    },
    branches,
    initialFiles,
    initialBranch,
    initialCommit,
    testFiles, // only for testing purposes, do not pass in real usage
  } = props;
  const [filePath, setFilepath] = useState('');
  const [branchSelected, setBranchSelected] = useState(initialBranch || defaultBranch);
  const [showReturnOption, setShowReturnOption] = useState(false);
  const [files, setfiles] = useState(testFiles || null);

  useEffect(() => {
    updateFiles('');
  }, []);

  function onGetBackBtnClick(e) {
    e.preventDefault();
    getBack();
  }

  function getBack() {
    const path = filePath.substring(0, filePath.lastIndexOf('/'));
    const newFilePath = !filePath.includes('/') ? '' : path;
    updateFiles(newFilePath);
    setFilepath(newFilePath);
    setShowReturnOption(!(newFilePath === ''));
  }

  /**
     * Sometimes a pipeline is rebuilt so the files provided as input should be shown as selected
     * @param {*} file: file which was used as file input when a pipeline was executed
     */
  function getIsFileChecked(file) {
    if (!initialFiles) return false;

    return initialFiles.filter((f) => f.location === file.path).length > 0;
  }

  /**
     * @param {*} checkboxFile: file that corresponds to the checkbox clicked
     * @param {*} checkedValue: checkbox value after clicking
     */
  const handleClickOnCheckbox = (checkboxFile, checkedValue) => {
    setfiles(files.map((file) => ({
      ...file,
      checked: (file === checkboxFile) && checkedValue,
      disabled: file !== checkboxFile && checkedValue,
    })));
  };

  /* changeCheckedToAll = (newCheckedValue) => this.setState((prevState) => ({
      files: prevState.files.map((f) => ({ ...f, checked: newCheckedValue })),
    }));
    */
  function updateFiles(path) {
    filesApi.getFilesPerProject(
      gid,
      path,
      false,
      initialCommit || branchSelected,
    ).then((filesRes) => {
      const newfilesSelected = filesRes.map((file) => ({
        ...file,
        checked: getIsFileChecked(file),
        disabled: !getIsFileChecked(file) && initialFiles.length !== 0,
      }));
      setfiles(newfilesSelected);
      if (initialFiles.length > 0) {
        dispatch({ type: UPDATE_FILES_SELECTED_IN_MODAL, filesSelectedInModal: newfilesSelected });
        dispatch({ type: SET_BRANCH_SELECTED, branchSelected });
      }
    })
      .catch(() => toastr.error('Error', 'Files could not be recovered'));
  }

  function handleCloseButton() {
    dispatch({ type: SET_IS_VISIBLE_FILES_MODAL, isVisibleSelectFilesModal: false });
  }

  function updateFilesArrayOnBranchChange(branchSelectedLocal) {
    setShowReturnOption(false);
    setBranchSelected(branchSelectedLocal);
    updateFiles('');
  }

  const customTime = (ISODate) => {
    const today = new Date(ISODate);
    const h = today.getHours();
    let m = today.getMinutes();
    if (m < 10) {
      m = `0${m}`;
    }
    return (`${h}:${m}`);
  };

  function handleModalAccept(filesSelectedInModal) {
    dispatch({ type: SET_IS_VISIBLE_FILES_MODAL, isVisibleSelectFilesModal: false });
    dispatch({ type: UPDATE_FILES_SELECTED_IN_MODAL, filesSelectedInModal });
    dispatch({ type: SET_BRANCH_SELECTED, branchSelected });
    dispatch({ type: VALIDATE_FORM });
  }

  const filesSelected = files ? files.filter((f) => f.checked) : 0;
  return (
    <div id="select-data-modal-div" className={`modal modal-primary modal-lg dark-cover ${isVisibleSelectFilesModal ? 'show' : ''}`}>
      <div className="modal-cover" onClick={handleCloseButton} />
      <div className="modal-container" style={{ minHeight: 450 }}>
        <div className="modal-container-close">
          <button
            type="button"
            label="close"
            onClick={handleCloseButton}
            className="btn btn-hidden fa fa-times"
          />
        </div>
        <div className="modal-header">
          <div>
            Select data to pre-process in your current data pipeline.
          </div>
        </div>
        <div id="buttons" className="modal-content d-flex flex-column p-3">
          <div className="row">
            <div id="left-div" className="col-6 t-left">
              <MDropdown
                label={branchSelected || 'Select branch'}
                component={(
                  <div className="select-branch">
                    <div className="switch-header">
                      <p>Switch Branches</p>
                    </div>
                    <hr />
                    <div className="search-branch">
                      <div className="branches">
                        <ul>
                          <p className="branch-header">Branches</p>
                          {branches.filter((branch) => !branch.name.startsWith('data-pipeline')
                                && !branch.name.startsWith('experiment'))
                            .map((branch, index) => (
                              <li
                                tabIndex="0"
                                role="button"
                                key={index.toString()}
                                onClick={() => updateFilesArrayOnBranchChange(
                                  branch.name,
                                )}
                                onKeyDown={() => updateFilesArrayOnBranchChange(
                                  branch.name,
                                )}
                              >
                                <p>{branch.name}</p>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                    <hr />
                    <div className="search-branch">
                      <div className="branches">
                        <ul>
                          <p className="branch-header">Datasets</p>
                          {branches.filter((branch) => branch.name.startsWith('data-pipeline')).reverse()
                            .map((branch) => {
                              const pipelineName = branch.name;
                              const uniqueName = pipelineName.split('/')[1];

                              return (
                                <li
                                  key={`b-${pipelineName}`}
                                  onKeyDown={
                                        () => updateFilesArrayOnBranchChange(gid, pipelineName)
                                      }
                                  onClick={
                                        () => updateFilesArrayOnBranchChange(gid, pipelineName)
                                      }
                                >
                                  <p>
                                    {`${uniqueName} - ${customTime(branch.commit.created_at)}`}
                                  </p>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  </div>
                    )}
              />
            </div>
            <div id="right-div" className="col-6 t-right">
              {
                  /**
                   * Since user can pick just a file opf type folder, the next code maskes no sense
                  files && (
                    <>
                      <button
                        id="select-all"
                        type="button"
                        className="btn btn-outline-dark btn-label-sm mr-2"
                        onClick={() => changeCheckedToAll(true)}
                      >
                        Select All
                      </button>
                      <button
                        id="deselect-all"
                        type="button"
                        className="btn btn-outline-dark btn-label-sm mr-2"
                        onClick={() => changeCheckedToAll(false)}
                      >
                        Deselect All
                      </button>
                    </>
                  ) */}
              <button
                id="accept"
                type="button"
                className="btn btn-primary btn-label-sm"
                onClick={() => handleModalAccept(filesSelected)}
              >
                Accept
              </button>
            </div>
          </div>
          <div className="row mb-3 ml-2">
            <p>
              {`${projectName}/`}
              <b>{filePath}</b>
            </p>
          </div>
          <div className="row flex-1 mb-3">
            <div className="col-12">
              {/* table begins */}
              <div id="table-container" className="h-100 mr-0 ml-0">
                <table className="file-properties h-100" id="file-tree" style={{ Height: '15vw' }}>
                  <thead>
                    <tr className="title-row">
                      <th style={{ width: '6%' }} />
                      <th style={{ width: '13%' }}>
                        <p id="paragraphName">Name</p>
                      </th>
                      <th style={{ width: '87%' }}>
                        <p>
                          {filesSelected.length === 0
                            ? 'Select path to one folder or file'
                            : 'You selected a path to a folder or file. Proceed with building your pipeline'}
                        </p>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="w-100">
                    {showReturnOption && (
                    <ReturnLink getBack={onGetBackBtnClick} />
                    )}
                    {files && files.map((file, index) => (
                      <tr key={index.toString()} id={`tr-file-${index}`} className="files-row" style={{ justifyContent: 'unset' }}>
                        <td className="icon-container-column" style={{ width: '2rem' }}>
                          <MCheckBox
                            disabled={file.disabled}
                            className="d-block ml-2 pb-2"
                            name={`span-file-${index}`}
                            checked={file.checked}
                            callback={(name, labelValue, newValue) => handleClickOnCheckbox(file, newValue)}
                          />
                        </td>
                        <td className="icon-container-column">
                          <div>
                            <img src={file.type === 'tree' ? folderIcon : fileIcon} alt="" />
                          </div>
                          <p style={{ color: `var(--${file.disabled ? 'lessWhite' : 'dark'}` }}>
                            {file.type === 'tree'
                              ? (
                                <button
                                  id={`button-for-${index}`}
                                  type="button"
                                  onClick={() => {
                                    setFilepath(file.path);
                                    setShowReturnOption(true);
                                    updateFiles(file.path);
                                  }}
                                  className="btn btn-hidden"
                                >
                                  {file.name}
                                </button>
                              ) : file.name}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* table ends */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

UnconnectedSelectDataPipelineModal.propTypes = {
  project: shape({
    gid: number.isRequired,
    defaultBranch: string.isRequired,
  }).isRequired,
  initialFiles: arrayOf(shape({ location: string.isRequired })),
};

UnconnectedSelectDataPipelineModal.defaultProps = {
  initialFiles: [],
};

function mapStateToProps(
  { projects: { selectedProject: project }, branches, user: { preconfiguredOperations } }
) {
  return {
    project,
    branches,
    initialFiles: preconfiguredOperations?.inputFiles,
    initialBranch: preconfiguredOperations?.branch,
    initialCommit: preconfiguredOperations?.commit,
  };
}

export default connect(mapStateToProps)(UnconnectedSelectDataPipelineModal);

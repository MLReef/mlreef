import React, { Component } from 'react';
import PropTypes, {
  shape, number, func, string,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './selectDataPipelineModal.scss';
import MDropdown from 'components/ui/MDropdown';
import ReturnLink from 'components/returnLink';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import folderIcon from 'images/folder_01.svg';
import fileIcon from 'images/file_01.svg';
import filesApi from 'apis/FilesApi';

class SelectDataPipelineModal extends Component {
  constructor(props) {
    super(props);
    const {
      show,
      branches,
      project: { defaultBranch },
    } = this.props;

    this.state = {
      show,
      showReturnOption: false,
      filePath: '',
      files: null,
      branches,
      branchSelected: defaultBranch,
    };

    this.handleCloseButton = this.handleCloseButton.bind(this);
    this.onGetBackBtnClick = this.onGetBackBtnClick.bind(this);
  }

  componentDidMount() {
    const { project: { id: projectId } } = this.props;
    const { branchSelected } = this.state;
    this.updateFiles(projectId, '', branchSelected);
  }

    static getDerivedStateFromProps = ({ show }) => ({ show });

    onGetBackBtnClick(e) {
      e.preventDefault();
      this.getBack();
    }

    getBack() {
      const { filePath, branchSelected } = this.state;
      const { project: { id: projectId } } = this.props;
      const path = filePath.substring(0, filePath.lastIndexOf('/'));
      const newFilePath = !filePath.includes('/') ? '' : path;
      this.updateFiles(projectId, newFilePath, branchSelected);
      this.setState({
        filePath: newFilePath,
        showReturnOption: !(newFilePath === ''),
      });
    }

    selectFileFromGrid = (file) => {
      const { files } = this.state;
      const newArray = [...files];
      newArray[files.indexOf(file)] = { ...file, checked: !file.checked };
      this.setState({
        files: newArray,
      });
    }

    changeCheckedToAll = (newCheckedValue) => this.setState((prevState) => ({
      files: prevState.files.map((f) => ({ ...f, checked: newCheckedValue })),
    }));

    updateFiles = (projectId, path, branch) => filesApi.getFilesPerProject(
      projectId,
      path,
      false,
      branch,
    ).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(res);
    }).then((files) => this.setState({
      files: [...files.map((file) => ({ ...file, checked: false }))],
    }))
      .catch(() => toastr.error('Error', 'Files could not be recovered'));

    handleCloseButton() {
      const { selectDataClick } = this.props;
      selectDataClick();
      document.getElementsByTagName('body').item(0).style.overflow = 'scroll';
    }

    updateFilesArrayOnBranchChange(projectId, branchSelected) {
      this.setState({ showReturnOption: false, branchSelected });
      this.updateFiles(projectId, '', branchSelected);
    }

    render() {
      const {
        show,
        branchSelected,
        branches,
        files,
        showReturnOption,
        filePath,
      } = this.state;
      const { handleModalAccept, project: { id: projectId, name: projectName } } = this.props;
      const customTime = (ISODate) => {
        const today = new Date(ISODate);
        const h = today.getHours();
        let m = today.getMinutes();
        if (m < 10) {
          m = `0${m}`;
        }
        return (`${h}:${m}`);
      };
      const filesSelected = files ? files.filter((f) => f.checked) : 0;
      return (
        <div id="select-data-modal-div" className={`modal modal-primary modal-lg dark-cover ${show ? 'show' : ''}`}>
          <div className="modal-cover" onClick={this.handleCloseButton} />
          <div className="modal-container" style={{ minHeight: 450 }}>
            <div className="modal-container-close">
              <button
                type="button"
                label="close"
                onClick={this.handleCloseButton}
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
                      <div className="select-branch" style={{ top: '27%', left: '35px' }}>
                        <div className="switch-header">
                          <p>Switch Branches</p>
                        </div>
                        <hr />
                        <div className="search-branch">
                          <input
                            type="text"
                            placeholder="Search branches or tags"
                          />
                          <div className="branches">
                            <ul>
                              <li className="branch-header">Branches</li>
                              {branches.filter((branch) => !branch.name.startsWith('data-pipeline')
                                && !branch.name.startsWith('experiment'))
                                .map((branch, index) => (
                                  <li
                                    tabIndex="0"
                                    role="button"
                                    key={index.toString()}
                                    onClick={() => this.updateFilesArrayOnBranchChange(
                                      projectId,
                                      branch.name,
                                    )}
                                    onKeyDown={() => this.updateFilesArrayOnBranchChange(
                                      projectId,
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
                          <input
                            type="text"
                            placeholder="Search branches or tags"
                          />
                          <div className="branches">
                            <ul>
                              <li className="branch-header">Branches</li>
                              {branches.filter((branch) => branch.name.startsWith('data-pipeline')).reverse()
                                .map((branch) => {
                                  const pipelineName = branch.name;
                                  const uniqueName = pipelineName.split('/')[1];

                                  return (
                                    <li
                                      key={`b-${pipelineName}`}
                                      onKeyDown={() => this.updateFilesArrayOnBranchChange(projectId, pipelineName)}
                                      onClick={() => this.updateFilesArrayOnBranchChange(projectId, pipelineName)}
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
                  {files && (
                    <>
                      <button
                        id="select-all"
                        type="button"
                        className="btn btn-outline-dark btn-label-sm mr-2"
                        onClick={() => this.changeCheckedToAll(true)}
                      >
                        Select All
                      </button>
                      <button
                        id="deselect-all"
                        type="button"
                        className="btn btn-outline-dark btn-label-sm mr-2"
                        onClick={() => this.changeCheckedToAll(false)}
                      >
                        Deselect All
                      </button>
                    </>
                  )}
                  <button
                    id="accept"
                    type="button"
                    className="btn btn-primary btn-label-sm"
                    onClick={() => handleModalAccept(filesSelected, branchSelected)}
                  >
                    Accept
                  </button>
                </div>
              </div>
              <div className="row mb-3 ml-2">
                <p>
                  {`${projectName} / `}
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
                              {' '}
                              { filesSelected.length }
                              {' '}
                              files selected
                            </p>
                          </th>
                        </tr>
                      </thead>

                      <tbody className="w-100">
                        {showReturnOption && (
                          <ReturnLink getBack={this.onGetBackBtnClick} />
                        )}
                        {files && files.map((file, index) => (
                          <tr key={index.toString()} id={`tr-file-${index}`} className="files-row" style={{ justifyContent: 'unset' }}>
                            <td className="icon-container-column">
                              <MCheckBox
                                name={`span-file-${index}`}
                                checked={file.checked}
                                callback={() => { this.selectFileFromGrid(file); }}
                              />
                            </td>
                            <td className="icon-container-column">
                              <div>
                                <img src={file.type === 'tree' ? folderIcon : fileIcon} alt="" />
                              </div>
                              <p>
                                {file.type === 'tree'
                                  ? (
                                    <button
                                      id={`button-for-${index}`}
                                      type="button"
                                      onClick={() => {
                                        this.setState({
                                          filePath: file.path,
                                          showReturnOption: true,
                                        });
                                        this.updateFiles(projectId, file.path, branchSelected);
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
    }
}

SelectDataPipelineModal.propTypes = {
  show: PropTypes.bool,
  project: shape({
    id: number.isRequired,
    defaultBranch: string.isRequired,
  }).isRequired,
  handleModalAccept: func.isRequired,
  selectDataClick: func.isRequired,
};

SelectDataPipelineModal.defaultProps = {
  show: false,
};

export default SelectDataPipelineModal;

import React, { Component } from 'react';
import PropTypes, {
  shape, number, func, string, arrayOf,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './SelectDataPipelineModal.scss';
import MDropdown from 'components/ui/MDropdown';
import ReturnLink from 'components/returnLink';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import FilesApi from 'apis/FilesApi';

const folderIcon = '/images/svg/folder_01.svg';
const fileIcon = '/images/svg/file_01.svg';
const filesApi = new FilesApi();

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
    const { project: { gid } } = this.props;
    const { branchSelected } = this.state;
    this.updateFiles(gid, '', branchSelected);
  }

    static getDerivedStateFromProps = ({ show }) => ({ show });

    onGetBackBtnClick(e) {
      e.preventDefault();
      this.getBack();
    }

    getBack() {
      const { filePath, branchSelected } = this.state;
      const { project: { gid } } = this.props;
      const path = filePath.substring(0, filePath.lastIndexOf('/'));
      const newFilePath = !filePath.includes('/') ? '' : path;
      this.updateFiles(gid, newFilePath, branchSelected);
      this.setState({
        filePath: newFilePath,
        showReturnOption: !(newFilePath === ''),
      });
    }

    /**
     * Sometimes a pipeline is rebuilt so the files provided as input should be shown as selected
     * @param {*} file: file which was used as file input when a pipeline was executed
     */
    getIsFileChecked(file) {
      const { initialFiles } = this.props;
      if (!initialFiles) return false;

      return initialFiles.filter((f) => f.location === file.path).length > 0;
    }

    /**
     * @param {*} checkboxFile: file that corresponds to the checkbox clicked
     * @param {*} checkedValue: checkbox value after clicking
     */
    handleClickOnCheckbox = (checkboxFile, checkedValue) => this.setState((state) => ({
      ...state,
      files: state.files.map((file) => ({
        ...file,
        checked: (file === checkboxFile) && checkedValue,
        disabled: file !== checkboxFile && checkedValue,
      })),
    }));

    /* changeCheckedToAll = (newCheckedValue) => this.setState((prevState) => ({
      files: prevState.files.map((f) => ({ ...f, checked: newCheckedValue })),
    }));
    */
    updateFiles(gid, path, branch) {
      filesApi.getFilesPerProject(
        gid,
        path,
        false,
        branch,
      ).then((files) => {
        const { initialFiles } = this.props;
        this.setState({
          files: [...files.map((file) => {
            // TODO: When the pipeline has been executed this won't block the not checked files
            const isChecked = this.getIsFileChecked(file);
            return { ...file, checked: isChecked, disabled: !isChecked && initialFiles !== null };
          })],
        });
      })
        .catch(() => toastr.error('Error', 'Files could not be recovered'));
    }

    handleCloseButton() {
      const { selectDataClick } = this.props;
      selectDataClick();
      document.getElementsByTagName('body').item(0).style.overflow = 'scroll';
    }

    updateFilesArrayOnBranchChange(gid, branchSelected) {
      this.setState({ showReturnOption: false, branchSelected });
      this.updateFiles(gid, '', branchSelected);
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
      const { handleModalAccept, project: { gid, gitlabName: projectName } } = this.props;
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
                                    onClick={() => this.updateFilesArrayOnBranchChange(
                                      gid,
                                      branch.name,
                                    )}
                                    onKeyDown={() => this.updateFilesArrayOnBranchChange(
                                      gid,
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
                                      onKeyDown={() => this.updateFilesArrayOnBranchChange(gid, pipelineName)}
                                      onClick={() => this.updateFilesArrayOnBranchChange(gid, pipelineName)}
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
                  ) */}
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
                                : 'You selected a path to a folder or file. Proceed with building your pipeline'
                              }
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
                            <td className="icon-container-column" style={{ width: '2rem' }}>
                              <MCheckBox
                                disabled={file.disabled}
                                className="d-block ml-2 pb-2"
                                name={`span-file-${index}`}
                                checked={file.checked}
                                callback={(name, labelValue, newValue) => this.handleClickOnCheckbox(file, newValue)}
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
                                        this.setState({
                                          filePath: file.path,
                                          showReturnOption: true,
                                        });
                                        this.updateFiles(gid, file.path, branchSelected);
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
    gid: number.isRequired,
    defaultBranch: string.isRequired,
  }).isRequired,
  handleModalAccept: func.isRequired,
  selectDataClick: func.isRequired,
  initialFiles: arrayOf(shape({ location: string.isRequired })),
};

SelectDataPipelineModal.defaultProps = {
  show: false,
  initialFiles: [],
};

export default SelectDataPipelineModal;

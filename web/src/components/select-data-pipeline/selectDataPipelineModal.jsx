import React, { Component } from 'react';
import PropTypes, { shape, number, func } from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import { toastr } from 'react-redux-toastr';
import '../../css/genericModal.css';
import './selectDataPipelineModal.css';
import folderIcon from '../../images/folder_01.svg';
import fileIcon from '../../images/file_01.svg';
import ArrowButton from '../arrow-button/arrowButton';
import filesApi from '../../apis/FilesApi';
import '../files-table/filesTable.css';

class SelectDataPipelineModal extends Component {
  constructor(props) {
    super(props);
    const {
      show,
      branches,
    } = this.props;

    this.state = {
      show,
      showReturnOption: false,
      filePath: '',
      files: null,
      branches,
      branchSelected: null,
    };

    this.handleCloseButton = this.handleCloseButton.bind(this);
  }

  componentDidMount() {
    this.getFiles('master');
  }

    static getDerivedStateFromProps = ({ show }) => ({ show });

    handleBranch = (e) => {
      e.target.focus();
      const { isOpen } = this.state;
      this.setState({ isOpen: !isOpen });
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

    getFiles = (newBranchSelectedName) => {
      const { project: { id } } = this.props;
      filesApi
        .getFilesPerProject(
          id,
          '',
          false,
          newBranchSelectedName,
        )
        .then(async (res) => {
          let files = null;
          if (res.ok) {
            files = await res.json();
          }
          this.setState({
            branchSelected: newBranchSelectedName,
            files: [...files.map((file) => ({ ...file, checked: false }))],
          });
        })
        .catch(
          () => toastr.error('Error', 'Files could not be recovered'),
        );
    }

    getReturnOption = () => (
      <tr className="files-row">
        <td style={{ paddingLeft: '3em' }} className="file-type">
          <button
            type="button"
            onClick={this.getBack}
            style={{ padding: '0' }}
          >
            <img src={folderIcon} alt="" />
          </button>
          <button
            type="button"
            onClick={this.getBack}
          >
            ..
          </button>
        </td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    );

    getBack = (e) => {
      const { filePath } = this.state;
      const path = filePath.substring(0, filePath.lastIndexOf('/'));
      if (!filePath.includes('/')) {
        this.setState({ filePath: '' });
        this.updateFiles(e, '');
      } else {
        this.setState({ filePath: path });
        this.updateFiles(e, path);
      }
    };

    updateFiles = (e, path) => {
      e.preventDefault();
      this.setState({
        filePath: path,
        showReturnOption: !(path === ''),
      });
      const {
        branchSelected,
      } = this.state;
      const { project: { id } } = this.props;
      filesApi.getFilesPerProject(
        id,
        path || '',
        false,
        branchSelected,
      ).then(async (res) => {
        let files = null;
        if (res.ok) {
          files = await res.json();
        }
        this.setState({ files: [...files.map((file) => ({ ...file, checked: false }))] });
      })
        .catch(
          () => {
            toastr.error('Error', 'Files could not be recovered');
          },
        );
    }

    handleCloseButton() {
      const { selectDataClick } = this.props;
      selectDataClick();
      document.getElementsByTagName('body').item(0).style.overflow = 'scroll';
    }

    render() {
      const {
        show,
        branchSelected,
        isOpen,
        branches,
        files,
        showReturnOption,
        filePath,
      } = this.state;
      const { handleModalAccept, project } = this.props;
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
        <div className={`modal modal-primary modal-lg dark-cover ${show ? 'show' : ''}`}>
          <div className="modal-cover" onClick={this.handleCloseButton} />
          <div className="modal-container" style={{ minHeight: 450 }}>
            <div className="modal-container-close">
              <button
                type="button"
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
              <div className="row mb-4">
                <div id="left-div" className="col-6 t-left">
                  <div
                    className="white-button round-border-black-color"
                    onClick={this.handleBranch}
                    style={{ cursor: 'pointer' }}
                  >
                    <ArrowButton
                      placeholder={
                        branchSelected || 'Select branch'
                      }
                    />
                    {isOpen && (
                    <div className="select-branch" style={{ top: '27%', left: '35px' }} onBlur={this.handleBlur}>
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
                                  onClick={() => {
                                    this.getFiles(branch.name);
                                  }}
                                  onKeyDown={() => {
                                    this.getFiles(branch.name);
                                  }}
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
                            {branches.filter((branch) => branch.name.startsWith('data-pipeline'))
                              .map((branch) => {
                                const pipelineName = branch.name;
                                const uniqueName = pipelineName.split('/')[1];

                                return (
                                  <li
                                    key={`b-${pipelineName}`}
                                    onKeyDown={() => {
                                      // we should filter which key
                                      this.getFiles(pipelineName);
                                    }}
                                    onClick={() => {
                                      this.getFiles(pipelineName);
                                    }}
                                  >
                                    <p>
                                      {`${uniqueName} - ${customTime(branch.commit.created_at)}`}
                                    </p>
                                  </li>
                                );
                              }).reverse()}
                          </ul>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
                <div id="right-div" className="col-6 t-right">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                      handleModalAccept(e, filesSelected, branchSelected);
                    }}
                  >
                    Accept
                  </button>
                  {files && (
                  <>
                    <button
                      type="button"
                      onClick={() => this.changeCheckedToAll(false)}
                      className="white-button round-border-black-color"
                    >
                      {' '}
                      <p> Deselect all </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => this.changeCheckedToAll(true)}
                      className="white-button round-border-black-color"
                    >
                      {' '}
                      <p> Select all </p>
                    </button>
                  </>
                  )}
                </div>
                <div style={{ paddingLeft: '1em' }}>
                  <p style={{ fontSize: '15px' }}>
                    {` ${project.name} / `}
                    <b>{filePath}</b>
                  </p>
                </div>
              </div>
              <div className="row flex-1 mb-3">
                <div className="col-12">
                  {/* table begins */}
                  <div id="table-container" className="h-100">
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

                      <tbody>
                        {showReturnOption && this.getReturnOption()}
                        {files && files.map((file, index) => (
                          <tr key={index.toString()} id={`tr-file-${index}`} className="files-row" style={{ justifyContent: 'unset' }}>
                            <td className="icon-container-column">
                              <Checkbox
                                id={`span-file-${index}`}
                                checked={file.checked}
                                onChange={() => { this.selectFileFromGrid(file); }}
                                color="primary"
                                inputProps={{
                                  'aria-label': 'primary checkbox',
                                }}
                              />
                            </td>
                            <td className="icon-container-column">
                              <div>
                                <img src={file.type === 'tree' ? folderIcon : fileIcon} alt="" />
                              </div>
                              <p>
                                {file.type === 'tree'
                                  ? (
                                    <button type="button" onClick={(e) => this.updateFiles(e, file.path)} className="file-name-link">
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
  }).isRequired,
  handleModalAccept: func.isRequired,
  selectDataClick: func.isRequired,
};

SelectDataPipelineModal.defaultProps = {
  show: false,
};

export default SelectDataPipelineModal;

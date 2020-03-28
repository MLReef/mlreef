import React, { Component } from 'react';
import PropTypes, { shape, number, func } from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import '../../css/genericModal.css';
import './selectDataPipelineModal.css';
import folderIcon from '../../images/folder_01.svg';
import fileIcon from '../../images/file_01.svg';
import traiangle01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';
import filesApi from '../../apis/FilesApi';
import '../files-table/filesTable.css';

class SelectDataPipelineModal extends Component {
  constructor(props) {
    super(props);
    const {
      show,
      project,
      filesSelectedInModal,
      branches,
    } = this.props;

    this.state = {
      show,
      project,
      showReturnOption: false,
      filePath: '',
      files: [],
      filesSelected: filesSelectedInModal,
      branches,
      branchSelected: null,
    };
    this.getFiles('master');
    this.handleCloseButton = this.handleCloseButton.bind(this);
  }

    static getDerivedStateFromProps = (nextProps) => ({
      show: nextProps.show,
      filesSelected: nextProps.filesSelectedInModal,
    })

    handleBranch = (e) => {
      e.target.focus();
      this.setState({ isOpen: !this.state.isOpen });
    }

    selectFileFromGrid = (e) => {
      const { filesSelected, files } = this.state;
      const fileSelected = files[e.target.id.split('-')[2]];
      if (filesSelected.filter((file) => file.path === fileSelected.path).length === 0) {
        filesSelected.push(fileSelected);
      } else {
        filesSelected.splice(filesSelected.indexOf(fileSelected), 1);
      }

      this.setState({ filesSelected });
    }

    selectAllFiles = () => {
      const { filesSelected, files } = this.state;
      // Checks if there are any files already selected. If so, selects rest of the files.
      if (filesSelected.length > 0 && filesSelected.length < files.length) {
        files.forEach((file) => {
          if (!filesSelected.includes(file)) {
            this.setState({ filesSelected: filesSelected.push(file) });
          }
        });
      }
      // If there is no file selected, selects all of the files
      if (filesSelected.length === 0) {
        files.forEach((file) => this.setState({ filesSelected: filesSelected.push(file) }));
      }
    };

    deSelectAllFiles = () => {
      const { filesSelected } = this.state;
      // Checks if files are selected and then deselects them one by one.
      while (filesSelected.length > 0) {
        filesSelected.pop();
      }
      this.setState({ filesSelected });
    }

    getFiles = (newBranchSelectedName) => {
      const { project: { id } } = this.state;
      filesApi
        .getFilesPerProject(
          id,
          '',
          false,
          newBranchSelectedName,
        )
        .then(
          (res) => this.setState({
            filesSelected: [],
            branchSelected: newBranchSelectedName,
            files: res,
          }),
        )
        .catch(
          (err) => err,
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
      if (path === '') {
        this.setState({ showReturnOption: false });
      } else {
        this.setState({ showReturnOption: true });
      }
      this.setState({ filePath: path });
      const {
        project: { id },
        branchSelected,
      } = this.state;
      filesApi.getFilesPerProject(
        id,
        path || '',
        false,
        branchSelected,
      ).then((res) => {
        this.setState({ files: res });
      })
        .catch(
          (err) => {
            console.log(err);
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
        filesSelected,
        show,
        branchSelected,
        isOpen,
        branches,
        files,
        showReturnOption,
        filePath,
        project,
      } = this.state;
      const { handleModalAccept } = this.props;
      const customTime = (ISODate) => {
        const today = new Date(ISODate);
        const h = today.getHours();
        let m = today.getMinutes();
        if (m < 10) {
          m = `0${m}`;
        }
        return (`${h}:${m}`);
      };

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
                      imgPlaceHolder={traiangle01}
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
                  <button
                    type="button"
                    onClick={this.deSelectAllFiles}
                    className="white-button round-border-black-color"
                  >
                    {' '}
                    <p> Deselect all </p>
                  </button>
                  <button
                    type="button"
                    onClick={this.selectAllFiles}
                    className="white-button round-border-black-color"
                  >
                    {' '}
                    <p> Select all </p>
                  </button>
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
                        {files.map((file, index) => (
                          <tr key={index.toString()} id={`tr-file-${index}`} className="files-row" style={{ justifyContent: 'unset' }}>
                            <td className="icon-container-column">
                              <Checkbox
                                id={`span-file-${index}`}
                                checked={filesSelected.filter(
                                  (fileSelected) => fileSelected.path === file.path,
                                ).length > 0}
                                onChange={(e) => { this.selectFileFromGrid(e); }}
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

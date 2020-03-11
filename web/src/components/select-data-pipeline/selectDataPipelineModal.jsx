import React, { Component } from 'react';
import PropTypes, { shape, number } from 'prop-types';
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

    handleCloseButton() {
      this.props.selectDataClick();
      document.getElementsByTagName('body').item(0).style.overflow = 'scroll';
    }

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

    render() {
      const {
        filesSelected,
        show,
        branchSelected,
        isOpen,
        branches,
        files,
      } = this.state;
      const customTime = (ISODate) => {
        const today = new Date(ISODate);
        const h = today.getHours();
        let m = today.getMinutes();
        if (m < 10) {
          m = `0${m}`;
        }
        return (`${h}:${m}`);
      };
      if (!show) {
        return null;
      }
      document.getElementsByTagName('body').item(0).style.overflow = 'hidden';
      return (
        <div className="generic-modal">
          <div className="modal-content" style={{ height: '70%', minHeight: 450 }}>
            <div className="title light-green-button">
              <div>
                <p>Select data to pre-process in your current data pipeline.</p>
              </div>
              <div id="x-button-div">
                <button
                  type="button"
                  onClick={this.handleCloseButton}
                  className="light-green-button"
                >
                  {' '}
                  <b>X</b>
                  {' '}
                </button>
              </div>
            </div>
            <br />
            <br />
            <br />
            <div id="buttons">
              <div id="left-div">
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
                                key={index}
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
                    <div className="switch-header">
                      <p>or switch to a data instance</p>
                    </div>
                    <hr />
                    <div className="search-branch">
                      <input
                        type="text"
                        placeholder="Search a data instance"
                      />
                      <div className="branches">
                        <ul>
                          <li className="branch-header">Data instances</li>
                          {branches.filter((branch) => branch.name.startsWith('data-pipeline'))
                            .map((branch, index) => {
                              const pipelineName = branch.name;
                              const uniqueName = pipelineName.split('/')[1];
                              return (
                                <li
                                  key={index}
                                  onKeyDown={() => {
                                    this.getFiles(branch.name);
                                  }}
                                  onClick={() => {
                                    this.getFiles(branch.name);
                                  }}
                                >
                                  <p>
                                    {uniqueName}
                                    {' '}
                                    -
                                    {' '}
                                    {customTime(branch.commit.created_at)}
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
              <div id="right-div">
                <button
                  type="button"
                  className="light-green-button"
                  onClick={(e) => {
                    this.props.handleModalAccept(e, filesSelected, branchSelected);
                  }}
                >
                  Accept
                </button>
                {/* <button
                  type="button"
                  className="white-button round-border-black-color"
                >
                  {' '}
                  <p> Diselect all </p>
                </button>
                <button
                  type="button"
                  className="white-button round-border-black-color"
                >
                  {' '}
                  <p> Select all </p>
                </button> */}
              </div>
            </div>
            <br />
            <div id="table-container">
              <table className="file-properties" id="file-tree" style={{ Height: '15vw' }}>
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
                  {files.map((file, index) => (
                    <tr key={index} id={`tr-file-${index}`} className="files-row" style={{ justifyContent: 'unset' }}>
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
                        <div>
                          {file.name}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
};

SelectDataPipelineModal.defaultProps = {
  show: false,
};

SelectDataPipelineModal.defaultProps = {
  show: false,
};

export default SelectDataPipelineModal;

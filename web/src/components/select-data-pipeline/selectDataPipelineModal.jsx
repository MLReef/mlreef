import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import '../../css/genericModal.css';
import './selectDataPipelineModal.css';
import Input from '../input/input';
import folderIcon from '../../images/folder_01.svg';
import fileIcon from '../../images/file_01.svg';
import traiangle01 from '../../images/triangle-01.png';
import ArrowButton from '../arrow-button/arrowButton';
import filesApi from '../../apis/FilesApi';

class SelectDataPipelineModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show,
      project: this.props.project,
      files: [],
      filesSelected: [],
      branches: this.props.branches,
      branchSelected: null,
    };
    this.getFiles('master');
    this.handleCloseButton = this.handleCloseButton.bind(this);
  }

    static getDerivedStateFromProps = (nextProps) => ({
      show: nextProps.show,
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
      const { filesSelected } = this.state;
      const fileSelected = this.state.files[e.target.id.split('-')[2]];
      const stringifiedFile = JSON.stringify(fileSelected);
      if (filesSelected.filter((file) => JSON.stringify(file) === stringifiedFile).length === 0) {
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
        show,
        branches,
        branchSelected,
        isOpen,
        filesSelected,
        files,
      } = this.state;
      if (!show) {
        return null;
      }
      console.log(filesSelected);
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
                    <div
                      style={{
                        margin: '0 50px',
                        fontSize: '14px',
                        padding: '0 40px',
                      }}
                    >
                      <p>Switch Branches</p>
                    </div>
                    <hr />
                    <div className="search-branch">
                      <input
                        autoFocus
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
                              >
                                <p>{branch.name}</p>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
                <Input placeholder="Search a file" />
              </div>
              <div id="right-div">
                <button
                  type="button"
                  className="light-green-button"
                  onClick={(e) => {
                    this.props.handleModalAccept(e, filesSelected, this.state.branchSelected);
                  }}
                >
                  Accept
                </button>
                <button
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
                </button>
              </div>
            </div>
            <br />
            <div id="table-container">
              <table className="file-properties" id="file-tree" style={{ Height: '15vw' }}>
                <thead>
                  <tr className="title-row">
                    <th style={{ width: '6%' }} />
                    <th style={{ width: '5%' }}>
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
                      <td className="file-type" style={{ width: 'unset' }}>
                        <Checkbox
                          id={`span-file-${index}`}
                          checked={filesSelected.includes(file)}
                          onChange={(e) => { this.selectFileFromGrid(e); }}
                          color="primary"
                          inputProps={{
                            'aria-label': 'primary checkbox',
                          }}
                        />
                      </td>
                      <td className="file-type" style={{ width: 'unset' }}>
                        <p>
                          <img src={file.type === 'tree' ? folderIcon : fileIcon} alt="" />
                        </p>
                        <p>
                          {file.name}
                        </p>
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
};

SelectDataPipelineModal.defaultProps = {
  show: false,
};

export default SelectDataPipelineModal;

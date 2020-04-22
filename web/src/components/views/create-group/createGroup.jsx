import React, { Component, createRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import { toastr } from 'react-redux-toastr';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import { convertToSlug } from 'functions/dataParserHelpers';
import { bannedCharsArray } from '../../../dataTypes';
import Navbar from '../../navbar/navbar';
import './createGroup.scss';
import { API_GATEWAY } from 'apiConfig';
import GroupsApi from 'apis/groupApi';
import * as groupsActions from "actions/groupsActions";
import { privacyLevelsArr } from "dataTypes";

const MAX_ALLOWED_FILE_SIZE = 500000;

export class UnconnectedNewGroup extends Component {
  descriptionTextAreaRef = createRef();

  fileInputRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      groupName: '',
      groupUrl: '',
      fileSelected: null,
      visibility: null,
    };
    this.handleGroupNameChange = this.handleGroupNameChange.bind(this);
    this.handleOnClickCreateGroup = this.handleOnClickCreateGroup.bind(this);
  }

  handleGroupNameChange = (e) => this.setState({
    groupName: e.currentTarget.value,
    groupUrl: convertToSlug(e.currentTarget.value),
  });

  handleSelectFileBtn = () => this.fileInputRef.current.click();

  handleFileSelected = (fileSelected) => {
    if (fileSelected.size > MAX_ALLOWED_FILE_SIZE) {
      toastr.error('Error', 'A file larger than allowed size was selected');
      return;
    }
    this.setState({ fileSelected });
  }

  handleOnChangeVisibility = (e) => this.setState({ visibility: e.target.value });

  handleOnClickCreateGroup = () => {
    const {
      groupName: name, groupUrl: path, visibility, fileSelected: avatar,
    } = this.state;
    const description = this.descriptionTextAreaRef.current.value;
    const payload = {
      name,
      path,
      description,
    };

    if (visibility && typeof visibility !== 'undefined') {
      payload.visibility = visibility;
    }

    if (avatar && typeof avatar !== 'undefined') {
      const reader = avatar.stream().getReader();
      reader.read().then((content) => {
        payload.avatar = Base64ToArrayBuffer.encode(content.value);
        this.create(payload);
      });
    } else {
      this.create(payload);
    }
  }

  validateValues = (groupName, groupUrl) => typeof groupName !== 'undefined'
    && groupName !== ''
    && !bannedCharsArray.map((char) => groupUrl.includes(char))
      .includes(true);

  create(payload) {
    GroupsApi.create(payload)
      .then(async (res) => {
        if (res.ok) {
          const { history, actions } = this.props;
          actions.getGroupsList();
          toastr.success('Success', res.statusText);
          history.push("/");
        } else {
          toastr.error('Error', res.statusText);
          Promise.reject(res);
        }
      })
      .catch(() => toastr.error('Error', 'Something went wrong on group creation'));
  }

  render() {
    const {
      groupName,
      groupUrl,
      fileSelected,
    } = this.state;
    const isValidForm = this.validateValues(groupName, groupUrl);
    return (
      <>
        <Navbar />
        <div className="create-group main-div row mt-4">
          <div className="proj-description col-sm-12 col-lg-4 pr-3 ">
            <span>New ML Group</span>
            <p>
              Groups allow you to manage and collaborate across multiple projects.
              Members of a group have access to all of its projects

              Groups can also be tested by creating subgroups.

              Projects that belong to a group are prefixed with the group namespace.
              Existing projects may be moved into a group.
            </p>
          </div>
          <div className="form-control col-sm-12 col-lg-8 pl-3">
            <form>
              <label className="label-name" htmlFor="group-name">
                <span className="heading">Group name</span>
                <input
                  value={groupName}
                  onChange={this.handleGroupNameChange}
                  className="text-input"
                  id="group-name"
                  type="text"
                  placeholder="My awesome group"
                  required
                />
              </label>

              <label className="label-name" htmlFor="group-url" style={{ marginTop: '1rem' }}>
                <span className="heading">Group link</span>
                <div className="d-flex" id="group-link-div" style={{ alignItems: 'center' }}>
                  <p style={{ margin: 0 }}>
                    {`${API_GATEWAY}/`}
                  </p>
                  <input
                    style={{ margin: '0.4rem' }}
                    value={groupUrl}
                    onChange={() => {}}
                    className="text-input"
                    id="group-url"
                    type="text"
                    placeholder="my-awesome-group"
                    required
                  />
                </div>
              </label>

              <label className="label-name" htmlFor="group-description" style={{ marginTop: '1.5rem' }}>
                <span className="heading">Project Description (optional)</span>
                <textarea
                  ref={this.descriptionTextAreaRef}
                  className="area-focus"
                  id="group-description"
                  rows="4"
                  maxLength="250"
                  spellCheck="false"
                  placeholder="Description Format"
                />
              </label>
              <label style={{ marginTop: '1rem' }} className="label-name" htmlFor="file-input">
                <span className="heading">Group avatar</span>
                <span>
                  <button
                    id="group-avatar"
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={this.handleSelectFileBtn}
                  >
                    Chose a file
                  </button>
                  {' '}
                  {fileSelected
                    ? fileSelected.name
                    : 'No file selected'}
                </span>
                <input
                  ref={this.fileInputRef}
                  id="file-input"
                  name="files[]"
                  type="file"
                  accept=".*,image/*"
                  onChange={(e) => this.handleFileSelected(e.target.files[0])}
                />
                <span style={{ marginTop: '1rem', color: 'var(--secondary)' }}>Maximum file size allowed is 500KB.</span>
              </label>
              <div style={{ marginTop: '1.5em' }}>
                <span className="heading">Visibilty level</span>
                <RadioGroup aria-label="visibility" name="visibility" onChange={this.handleOnChangeVisibility}>
                  {privacyLevelsArr.map((option, index) => (
                    <div key={`div visibility opt ${option.name}`} className="d-flex" style={{ flexDirection: "column" }}>
                      <FormControlLabel
                        key={`radiobutton element ${option.name} ${index.toString()}`}
                        className="heading"
                        value={option.value}
                        control={<Radio />}
                        label={(
                          <>
                            <img id="visibility-icon" src={option.icon} alt="" />
                            <span>{option.name}</span>
                          </>
                      )}
                      />
                      <span className="visibility-msg">{option.message.replace("#protected-element", 'group')}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div id="buttons-container">
                <button id="cancel-group-creation" type="button" className="btn btn-outline-dark">
                  Cancel
                </button>
                <button
                  id="create-group"
                  type="button"
                  disabled={!isValidForm}
                  className={isValidForm ? 'btn border-0 btn-primary' : 'btn btn-basic-primary'}
                  onClick={this.handleOnClickCreateGroup}
                >
                  Create group
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...groupsActions,
    }, dispatch),
  };
}

export default connect(() => ({}), mapDispatchToProps)(UnconnectedNewGroup);

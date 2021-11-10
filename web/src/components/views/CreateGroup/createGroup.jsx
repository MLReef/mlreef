import React, { Component, createRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import { convertToSlug } from 'functions/dataParserHelpers';
import './createGroup.scss';
import { EXTERNAL_URL } from 'apiConfig';
import GroupsApi from 'apis/GroupApi.ts';
import * as groupsActions from 'store/actions/groupsActions';
import { privacyLevelsArr } from 'dataTypes';
import MRichRadioGroup from 'components/ui/MRichRadioGroup/MRichRadioGroup';
import { bannedCharsArray } from '../../../dataTypes';
import Navbar from '../../navbar/navbar';

const MAX_ALLOWED_FILE_SIZE = 500000;
const groupsApi = new GroupsApi();

export class UnconnectedNewGroup extends Component {
  descriptionTextAreaRef = createRef();

  fileInputRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      groupName: '',
      groupUrl: '',
      fileSelected: null,
      visibility: 'private',
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

  handleOnChangeVisibility = (visibility) => this.setState({ visibility });

  handleOnClickCreateGroup = () => {
    const {
      groupName: name, groupUrl: path, visibility, fileSelected: avatar,
    } = this.state;
    const description = this.descriptionTextAreaRef.current.value;
    if (avatar && typeof avatar !== 'undefined') {
      const reader = avatar.stream().getReader();
      reader.read().then((content) => {
        this.create(name, path, description, visibility, Base64ToArrayBuffer.encode(content.value));
      });
    } else {
      this.create(name, path, description, visibility, null);
    }
  }

  validateValues = (groupName, groupUrl) => typeof groupName !== 'undefined'
    && groupName !== ''
    && !bannedCharsArray.map((char) => groupUrl.includes(char))
      .includes(true);

  create = (name, path, description, visibility, avatar) => groupsApi
    .create(name, path, description, visibility, avatar)
    .then(() => {
      const { history } = this.props;
      toastr.success('Success', 'The group was created!');
      history.push('/groups');
    })
    .catch(() => {
      toastr.error('Error', 'Something went wrong on group creation')
    });

  render() {
    const {
      groupName,
      groupUrl,
      fileSelected,
      visibility,
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
                    {`${EXTERNAL_URL}/groups`}
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
              <MRichRadioGroup
                radius
                className="mt-4"
                title="Visibilty level"
                name="visibility"
                options={privacyLevelsArr}
                value={visibility}
                onClick={this.handleOnChangeVisibility}
              />
              <div id="buttons-container" className="d-flex">
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

import React, { useState, useRef, useEffect } from 'react';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import MInput from 'components/ui/MInput';
import { INFORMATION_UNITS } from 'domain/informationUnits';
import MAccordion from 'components/ui/MAccordion';
import ProjectGeneralInfoApi from 'apis/projectGeneralInfoApi';
import './SettingsViewGeneral.scss';
import MAvatar from 'components/ui/MAvatar/MAvatar';
import MEmptyAvatar from 'components/ui/MEmptyAvatar/MEmptyAvatar';
import { validateProjectName } from 'functions/validations';

const projectApi = new ProjectGeneralInfoApi();

const SettingsViewGeneral = (props) => {
  const fileMaxSize = 200;
  const imageInput = useRef();
  const {
    gid, branch, avatar, projectId, projectName, description, history,
  } = props;

  const [name, setProjectName] = useState(projectName);
  const [newDescription, changeDescription] = useState(description);
  const [file, setImageFile] = useState('No file chosen');
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(name === projectName && description === newDescription);
  }, [name, newDescription, projectName, description]);

  const projectUpdate = () => {
    const body = {
      name,
      description: newDescription,
    };

    const isAValidName = validateProjectName(name);
    if (!isAValidName) {
      toastr.error('Error:', 'Name can contain only letters, digits, "_", ".", dash, space. It must start with letter, digit or "_".');
      setProjectName(projectName);
      return;
    }
    if (projectName === null || projectName === '') {
      toastr.error('Error:', 'Enter a valid project name');
      return;
    }

    projectApi.updateProjectDetails(projectId, body)
      .then(() => {
        history.push(`/my-projects/${gid}/${branch}`);
        toastr.success('Success', 'Project was successfully updated');
      })
      .catch((err) => toastr.error('Error', err.json()));
  };

  const handleFileSelect = () => imageInput.current.click();

  const handleImageSelect = (event) => {
    event.preventDefault();
    const selectedFiles = event.target.files[0];
    if (selectedFiles !== undefined) {
      if ((selectedFiles.size / INFORMATION_UNITS.KILOBYTE) > fileMaxSize) {
        toastr.error('Error', 'File size exceeds 200Kb');
      } else {
        setImageFile(selectedFiles.name);
      }
    }
  };

  return (
    <div className="settings-view-general">
      <MAccordion>
        <MAccordion.Item
          title="Naming, topics, avatar"
          subtitle="Update your project name, topics and avatar"
          referenceId="names-topics"
          defaultExpanded
        >
          <form>
            <div className="row ml-0 mr-0 mb-3">
              <MInput
                id={`project-${name}`}
                className="mt-2 pr-4 pl-3 pt-2 pb-2"
                label="Project name"
                value={name}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <MInput
                id={`project-${projectId}`}
                className="mt-2 pr-2 pl-3 pt-2 pb-2"
                label="Project ID"
                value={projectId}
                styleClass="bg-light"
                readOnly
              />
            </div>
            <div className="row ml-0 mr-0 mb-3">
              <div className="col-md-9 pb-2">
                <MInput
                  id="tag"
                  className="mt-2 pt-2 pb-2 pr-3 pl-3"
                  label="Tags (optional)"
                  value=""
                />
                <span className="mt-2 pt-2 pb-2 pr-3 pl-3 t-secondary">Separate tags with commas</span>
              </div>
            </div>
            <div className="row ml-0 mr-0 mb-3">
              <div className="mt-2 pl-3 col-md-9">
                <label htmlFor="proj-description">
                  Project description (optional)
                  <textarea
                    value={newDescription}
                    onChange={(e) => changeDescription(e.target.value)}
                    name=""
                    id="proj-description"
                    rows="4"
                    maxLength="250"
                  />
                </label>
              </div>
            </div>
            <div className="ml-0 mr-0 mb-3">
              <div className="mb-0 pl-3" style={{ float: 'left' }}>
                {avatar === null
                  ? <MEmptyAvatar projectName={projectName} styleClass="avatar-md" />
                  : (
                    <MAvatar
                      imgBase={avatar}
                      projectName={projectName}
                      width="140"
                      height="140"
                      styleClass="responsiveAvatar"
                    />
                  )}
              </div>
              <h5 className="mt-0">Project avatar</h5>
              <label htmlFor="image-file">
                <div className="mt-1 mb-2">
                  <button
                    type="button"
                    disabled
                    className="btn btn-outline-dark"
                    onClick={handleFileSelect}
                  >
                    Choose File
                  </button>
                  <span className="ml-2">{file}</span>
                  <input
                    ref={imageInput}
                    id="image-file"
                    className="d-none invisible"
                    type="file"
                    accept=".*,image/*"
                    onChange={handleImageSelect}
                  />
                </div>
                <span className="mb-0 mt-3 t-secondary">The maximum file size allowed is 200Kb</span>
              </label>
            </div>
            <div className="pl-3 mt-4 mb-4">
              <button
                type="button"
                className={disabled ? 'btn disabled' : 'btn btn-primary'}
                onClick={!disabled ? projectUpdate : () => {}}
              >
                Update Project Settings
              </button>
            </div>
          </form>
        </MAccordion.Item>
      </MAccordion>
    </div>
  );
};

SettingsViewGeneral.defaultProps = {
  avatar: null,
};

SettingsViewGeneral.propTypes = {
  gid: PropTypes.number.isRequired,
  branch: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  projectName: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default (SettingsViewGeneral);

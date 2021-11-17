import React, { useState, useEffect } from 'react';
import { toastr } from 'react-redux-toastr';
import PropTypes from 'prop-types';
import MInput from 'components/ui/MInput';
import MAccordion from 'components/ui/MAccordion';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import MAvatar from 'components/ui/MAvatar/MAvatar';
import MEmptyAvatar from 'components/ui/MEmptyAvatar/MEmptyAvatar';
import MImageUpload from 'components/ui/MImageUpload';
import { validateProjectName } from 'functions/validations';
import SettingsViewGeneralAdvanced from './SettingsViewGeneralAdvanced';
import './SettingsViewGeneral.scss';

const projectApi = new ProjectGeneralInfoApi();

const SettingsViewGeneral = (props) => {
  const {
    namespace, slug, coverUrl, projectId, projectName, description, history,
  } = props;

  const [name, setProjectName] = useState(projectName);
  const [newDescription, changeDescription] = useState(description);
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
        history.push(`/${namespace}/${slug}`);
        toastr.success('Success', 'Project was successfully updated');
      })
      .catch((err) => toastr.error('Error', err.json()));
  };

  const handleSelectCover = file => {
    if (coverUrl) {
      projectApi.deleteCover(projectId)
        .then(() => projectApi.createCover(projectId, file)
          .catch((err) => toastr.error('Error deleting the cover', err.message)))
        .then(() => toastr.success('Cover changed', 'Changes will be visible after reloading'))
        .catch((err) => toastr.error('Error uploading the cover', err.message));
    } else {
      projectApi.createCover(projectId, file)
        .then(() => toastr.success('Cover created', 'Changes will be visible after reloading'))
        .catch((err) => toastr.error('Error uploading the cover', err.message));
    }
  };

  const handleCoverError = error => {
    toastr.error(error.name, error.message);
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
                cypressTag="project-name"
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
                {
                  coverUrl ? (
                    <MAvatar
                      imgBase={coverUrl}
                      projectName={projectName}
                      width="140"
                      height="140"
                      styleClass="responsiveAvatar"
                    />
                  ) : (
                    <MEmptyAvatar projectName={projectName} styleClass="avatar-md" />
                  )
                }
              </div>
              <h5 className="mt-0">Project cover</h5>
              <label htmlFor="image-file">
                <div className="mt-1 mb-2 ml-3">
                  <MImageUpload
                    setImage={handleSelectCover}
                    onError={handleCoverError}
                    maxSize={200}
                  />
                </div>
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
        <MAccordion.Item
          cypressTag="advanced-accordion"
          title="Advanced"
          subtitle="Runs a number of housekeeping tasks within the current repository, such as compressing file revisions and removing unreachable objects."
        >
          <SettingsViewGeneralAdvanced
            id={projectId}
            name={projectName}
          />
        </MAccordion.Item>
      </MAccordion>
    </div>
  );
};

SettingsViewGeneral.defaultProps = {
  namespace: '',
  slug: null,
  projectName: '',
  projectId: '',
  description: '',
  coverUrl: '',
  history: {},
};

SettingsViewGeneral.propTypes = {
  namespace: PropTypes.string,
  slug: PropTypes.string,
  coverUrl: PropTypes.string,
  projectName: PropTypes.string,
  projectId: PropTypes.string,
  description: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default (SettingsViewGeneral);

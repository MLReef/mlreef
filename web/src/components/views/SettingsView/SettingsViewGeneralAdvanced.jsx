import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { toastr } from 'react-redux-toastr';
import { removeProject } from 'actions/projectInfoActions';
import { fireModal, closeModal } from 'actions/actionModalActions';
import DeleteProject from './SettingsViewGeneralAdvancedDeleteProject';
import './SettingsViewGeneralAdvanced.scss';

const today = dayjs();
const expirationDate = today.add(1, 'month').format('YYYY-MM-DD');

const SettingsViewGeneralAdvanced = (props) => {
  const {
    id,
    name,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const deleteProject = () => dispatch(removeProject(id))
    .then(() => {
      toastr.success(`Project ${name} deleted.`);
      history.push('/');
    })
    .catch((err) => {
      const error = err.json();
      toastr.error(`Error while deleting ${name}`, error.message);
    });

  const onDeleteProject = () => {
    dispatch(closeModal());

    return deleteProject();
  };

  const modalInfo = {
    type: 'danger',
    title: 'Confirmation required',
    dark: true,
    noActions: true,
    content: (
      <DeleteProject
        name={name}
        onDelete={onDeleteProject}
      />
    ),
    positiveLabel: 'Confirm',
  };
  const handleDelete = () => {
    dispatch(fireModal(modalInfo));
  };

  return (
    <section className="settings-view-general-advanced">
      <div className="settings-view-general-advanced-block">
        <h4 className="title t-danger">Remove project</h4>
        <p>
          {`Removing a project places it into a read-only state until ${expirationDate}, `}
          at which point the project will be permanently removed.
          <br />
          Until that time, the project can be retored.
        </p>

        <p>
          <b>
            Removing the project will delete its repository and all related resources
            including issues, merge requests etc.
          </b>
        </p>

        <p>
          <b>
            Removed projects cannot be restored!
          </b>
        </p>
        <div>
          <button data-cy="project-delete-btn" type="button" onClick={handleDelete} className="btn btn-danger mt-2">
            Remove project
          </button>
        </div>
      </div>
    </section>
  );
};

SettingsViewGeneralAdvanced.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default SettingsViewGeneralAdvanced;

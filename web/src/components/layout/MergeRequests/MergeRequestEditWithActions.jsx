import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MButton from 'components/ui/MButton';
import MergeRequestEdit from './MergeRequestEdit';

const MergeRequestEditWithActions = (props) => {
  const {
    waiting,
    disabled,
    title: initialTitle,
    description: initialDescription,
    onCancel,
    onSave,
    className,
  } = props;

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const handleChange = (setter) => (e) => setter(e.target.value);

  return (
    <div className={cx('merge-request-edit', className)}>
      <MergeRequestEdit
        disabled={disabled}
        title={title}
        description={description}
        onTitleChange={handleChange(setTitle)}
        onDescriptionChange={handleChange(setDescription)}
      />
      <div className="merge-request-edit-actions">
        <button
          type="button"
          className="btn btn-basic-dark ml-auto"
          onClick={onCancel}
        >
          Cancel
        </button>
        <MButton
          waiting={waiting}
          className="btn btn-primary mx-3"
          onClick={() => onSave({ title, description })}
          label="Save changes"
        />
      </div>
    </div>
  );
};

MergeRequestEditWithActions.defaultProps = {
  className: '',
  waiting: false,
  disabled: false,
  onCancel: undefined,
  onSave: undefined,
};

MergeRequestEditWithActions.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
  className: PropTypes.string,
  waiting: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default MergeRequestEditWithActions;

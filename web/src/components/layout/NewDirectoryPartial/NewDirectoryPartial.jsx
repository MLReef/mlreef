import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import cx from 'classnames';
import MInput from 'components/ui/MInput';
import MButton from 'components/ui/MButton';
// import MRadioGroup from 'components/ui/MRadio/MRadioGroup';
import CommitsApi from 'apis/CommitsApi';
// import { inspect } from 'functions/apiCalls';
import './NewDirectoryPartial.scss';

export const commitsApi = new CommitsApi();

const NewDirectoryPartial = (props) => {
  const {
    className,
    targetDir,
    gid,
    branch,
    onCancel,
    onSuccess,
  } = props;

  const parsedTargetDir = decodeURIComponent(targetDir);

  const [message, setMessage] = useState('Create new directory');
  const [directory, setDirectory] = useState('');
  const [waiting, setWaiting] = useState(false);

  const isValid = useMemo(
    () => directory.length > 0 && message.length > 0,
    [directory, message],
  );

  const unwrap = (setter) => (e) => e?.target && setter(e.target.value);

  function createNewDirectory() {
    const payload = {
      branch,
      commit_message: message,
      actions: [
        {
          action: 'create',
          file_path: `${parsedTargetDir}/${directory}/.gitattributes`,
        },
      ],
    };

    setWaiting(true);

    return commitsApi.performCommitForMultipleActions(gid, JSON.stringify(payload))
      .then(() => onSuccess(encodeURIComponent(`${parsedTargetDir}/${directory}`)))
      .catch((err) => {
        toastr.error('Could not create directory', err.message);
      })
      .finally(() => setWaiting(false));
  };

  // const actionOptions = [
  //   {
  //     value: 2,
  //     label: (
  //       <span>
  //         Commit directly to
  //         <strong>{` ${branch}.`}</strong>
  //       </span>
  //     ),
  //   },
  //   {
  //     value: 1,
  //     label: (
  //       <span>
  //         Start a new merge request to
  //         <strong>{` ${branch} `}</strong>
  //         with these changes.
  //       </span>
  //     ),
  //   },
  //   {
  //     disabled: true,
  //     value: 0,
  //     label: (
  //       <span>
  //         Only create
  //         <strong>{` ${targetBranch} `}</strong>
  //         branch.
  //       </span>
  //     ),
  //   },
  // ];

  return (
    <section className={cx('new-directory-partial', className)}>
      <div className="new-directory-partial-field">
        <div className="new-directory-partial-field-label">
          Creating directory in:
        </div>
        <div id="target-directory" className="new-directory-partial-field-fixed-value">
          {`${parsedTargetDir}/`}
        </div>
      </div>
      <div className="new-directory-partial-field">
        <div className="new-directory-partial-field-label">
          Directory name
        </div>
        <MInput
          id="new-directory"
          className="new-directory-partial-field-input"
          value={directory}
          onChange={unwrap(setDirectory)}
        />
      </div>
      <div className="new-directory-partial-field">
        <div className="new-directory-partial-field-label">
          Commit message
        </div>
        <textarea
          id="commit-message-input"
          rows="4"
          className="new-directory-partial-field-input"
          value={message}
          onChange={unwrap(setMessage)}
        />
      </div>
      <div className="new-directory-partial-field">
        <div className="new-directory-partial-field-label">
          Target branch
        </div>
        <MInput
          id="new-branch"
          className="new-directory-partial-field-input"
          value={branch}
          readOnly
        />
      </div>
      <div className="new-directory-partial-actions">
        <button
          type="button"
          className="btn btn-basic-dark mr-auto"
          onClick={onCancel}
        >
          Cancel
        </button>
        <MButton
          label="Create directory"
          className="btn btn-primary ml-auto"
          waiting={waiting}
          disabled={!isValid}
          onClick={createNewDirectory}
        />
      </div>
    </section>
  );
};

NewDirectoryPartial.defaultProps = {
  className: '',
  onCancel: () => {},
  onSuccess: () => {},
};

NewDirectoryPartial.propTypes = {
  className: PropTypes.string,
  targetDir: PropTypes.string.isRequired,
  gid: PropTypes.number.isRequired,
  branch: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default NewDirectoryPartial;

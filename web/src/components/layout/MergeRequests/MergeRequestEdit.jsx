import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ReactMarkdown from 'react-markdown';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import './MergeRequestEdit.scss';

const MergeRequestEdit = (props) => {
  const {
    disabled,
    title,
    description,
    onTitleChange,
    onDescriptionChange,
    className,
  } = props;

  return (
    <MSimpleTabs
      className={cx(className)}
      sections={[
        {
          label: 'Edit',
          disabled,
          content: (
            <div className="merge-request-edit-content">
              <div className="merge-request-edit-field">
                {/* eslint-disable-next-line */}
                <label htmlFor="merge-request-edit-title" className="merge-request-edit-field-label">
                  Title
                </label>
                <input
                  id="merge-request-edit-title"
                  value={title}
                  onChange={onTitleChange}
                  className="merge-request-edit-field-input"
                />
              </div>
              <div className="merge-request-edit-field">
                {/* eslint-disable-next-line */}
                <label htmlFor="merge-request-edit-description" className="merge-request-edit-field-label">
                  Description
                </label>
                <textarea
                  id="merge-request-edit-description"
                  className="merge-request-edit-field-input"
                  value={description}
                  onChange={onDescriptionChange}
                  rows="8"
                  placeholder="Describe the goal
                    of the changes and what
                    the reviewers must pay attention at"
                />
              </div>
            </div>
          ),
        },
        {
          label: 'Preview',
          content: (
            <div className="merge-request-edit-content preview">
              <h1>{title}</h1>
              <hr />
              <ReactMarkdown source={description} />
            </div>
          ),
        },
      ]}
    />
  );
};

MergeRequestEdit.defaultProps = {
  className: '',
  disabled: false,
};

MergeRequestEdit.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default MergeRequestEdit;

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { number, shape, string } from 'prop-types';
import { validateBranchName } from 'functions/validations';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import Navbar from 'components/navbar/navbar';
import './FileCreation.scss';
import MSimpleSelect from 'components/ui/MSimpleSelect';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MCodeRenderer from 'components/layout/MCodefileRenderer/MCodefileRenderer';
import actions from './actions';
import fileCreationConstants from './fileCreationConstants';
import hooks from 'customHooks/useSelectedProject';

const FileCreation = (props) => {
  const {
    match: {
      params: {
        namespace,
        slug,
        branch,
        path,
      },
    },
    history,
  } = props;

  const [selectedProject] = hooks.useSelectedProject(namespace, slug);

  const {
    gid: projectId,
  } = selectedProject;

  const today = new Date();
  const [template, setTemplate] = useState('');
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [targetBranch, setTargetbranch] = useState(branch ? `${branch}-patch-${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}` : 'master');
  const [commitMessage, setCommitMessage] = useState('Add text file');
  const [newMergeRequest, setNewMergeRequest] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const disabled = isLoading || !actions.validateFileName(filename) || targetBranch.includes(' ') || !validateBranchName(targetBranch) || commitMessage.length === 0;

  return (
    <div className="file-creation">
      <Navbar />
      <div className="file-creation-nav-bar">
        <div className="file-creation-nav-bar-bread-crumbs">
          <MBreadcrumb
            items={[
              { name: namespace, href: `/${namespace}` },
              { name: slug, href: `/${namespace}/${slug}` },
              { name: 'Repository' },
              { name: 'File creation' },
            ]}
          />
        </div>
      </div>
      <div className="file-creation-container">
        <h3>
          New File
        </h3>
        <div className="file-creation-container-options">
          <div className="d-flex" style={{ alignItems: 'center' }}>
            <i className="fas fa-code-branch mr-2" />
            <p className="file-creation-container-options-branch m-0">
              {branch}
              {' '}
            </p>
          </div>
          <div className="d-flex" style={{ alignItems: 'center' }}>
            <i className="far fa-folder mr-2 ml-4" />
            <p className="file-creation-container-options-path ml-2 mr-3">
              {path}
              /
            </p>
            <input name="name-input" type="text" onChange={(e) => setFilename(e.target.value)} value={filename} />
          </div>
          <div className="d-flex" style={{ alignItems: 'baseline' }}>
            <p className="ml-3" style={{ minWidth: '7rem' }}>
              File templates
            </p>
            <MSimpleSelect
              className="mb-0"
              options={[
                { label: 'Select...', value: '' },
                { label: 'Data processor', value: 'dataProcessor' },
                { label: 'Requirements file', value: 'requirementsFile' },
              ]}
              onChange={(val) => {
                if (val.length === 0) return;
                setTemplate(val);
                setFilename(fileCreationConstants[val].fileName);
                setCode(fileCreationConstants[val].content);
              }}
              value={template}
            />
          </div>
        </div>
        <div className="file-creation-container-editor">
          <MCodeRenderer
            code={code}
            fileExtension="js"
            onChange={(val) => {
              setCode(val);
            }}
            height="300"
            options={{ readyOnly: false }}
          />
        </div>
        <div className="mt-4 mb-4">
          <label htmlFor="commit-message">
            Commit message
            <textarea name="commit-message" className="mt-2 mb-4" cols="30" rows="5" value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} />
          </label>
          <label htmlFor="target-branch">
            Target branch
            <input name="target-branch" type="text" className="mt-2 mb-2" value={targetBranch} onChange={(e) => setTargetbranch(e.target.value)} />
          </label>
          {branch && (
            <MCheckBox
              name="merge-req-question"
              labelValue="Start a new merge request"
              callback={(...params) => setNewMergeRequest(params[2])}
            />
          )}
        </div>
        <div className="file-creation-container-buttons mt-4">
          <button
            type="button"
            className="btn btn-outline-dark btn-label-sm mr-2"
            onClick={() => history.push(`/${namespace}/${slug}`)}
          >
            Cancel
          </button>
          <button
            className={`btn btn-primary ${isLoading ? 'waiting' : ''}`}
            disabled={disabled}
            type="button"
            onClick={() => {
              if (disabled) {
                return;
              }
              setLoading(true);
              actions.createFile(
                projectId,
                targetBranch,
                path,
                filename,
                commitMessage,
                code,
                branch,
                newMergeRequest,
              )
                .then(() => {
                  toastr.success('Success', `The file with the name: ${filename} was created`);
                  history.push(`/${namespace}/${slug}/-/tree/${targetBranch}`);
                })
                .catch((err) => toastr.error('Error', err.message))
                .finally(() => setLoading(false));
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

FileCreation.propTypes = {
  match: shape({
    params: shape({
      namespace: string,
      slug: string,
      branch: string,
      path: string,
    }),
  }).isRequired,
  history: shape({}).isRequired,
  project: shape({
    gid: number.isRequired,
  }).isRequired,
};

export default FileCreation;

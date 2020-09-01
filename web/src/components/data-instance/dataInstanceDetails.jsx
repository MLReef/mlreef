import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import { RUNNING, PENDING, SKIPPED } from 'dataTypes';
import PipelinesApi from 'apis/PipelinesApi';
import DataPipelineApi from 'apis/DataPipelineApi';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import PropTypes from 'prop-types';
import FilesTable from '../files-table/filesTable';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceDetails.scss';
import FilesApi from '../../apis/FilesApi.ts';

const filesApi = new FilesApi();
const dataPipeApi = new DataPipelineApi();

const DataInstanceDetails = (props) => {
  const {
    projects,
    branches,
    match: {
      params: {
        namespace, path, slug, dataId,
      },
    },
  } = props;
  const selectedProject = projects.filter((proj) => proj.slug === slug)[0];
  const { gitlabId } = selectedProject;
  const groupName = selectedProject?.namespace?.name;

  const [files, setFiles] = useState([]);
  const [gitlabPipes, setGitlabPipes] = useState([]);
  const [backendPipeline, setBackendPipeline] = useState({});
  const gitlabFilterPipeline = gitlabPipes
    ?.filter((pipeline) => pipeline.ref.includes(backendPipeline?.name)
    && pipeline.status !== SKIPPED)[0];
  const selectedPipeline = branches.filter((item) => item.name.includes(backendPipeline?.name))[0];
  const { created_at: timeCreatedAgo, id, status: diStatus, ref: branchName } = gitlabFilterPipeline || {};

  useEffect(() => {
    dataPipeApi.getBackendPipelineById(dataId)
      .then((res) => setBackendPipeline(res))
      .then(() => {
        PipelinesApi.getPipesByProjectId(gitlabId)
          .then((res) => setGitlabPipes(res));
      })
      .then(() => branchName !== undefined && filesApi.getFilesPerProject(
        gitlabId,
        path || '',
        false,
        branchName,
      ).then((filesPerProject) => setFiles(filesPerProject)))
      .catch(() => toastr.error('Error', 'Something went wrong fetching pipelines'));
  }, [id, gitlabId, path, branchName, dataId]);

  return (
    <div id="experiments-overview-container">
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        folders={[groupName, selectedProject.name, 'Data', 'Instances']}
      />
      <div className="main-content">
        <br />
        <div id="line" />
        <br />
        <div className="commit-per-date">
          <div className="commit-header">
            <p>Viewing</p>
          </div>
          {selectedPipeline && (
          <div className="summary-data" style={{ display: 'flex' }}>
            <div className="project-desc-experiment pt-1">
              <p><b>{branchName}</b></p>
              <p>
                Created by
                <b>{selectedPipeline?.commit?.author_name}</b>
                <br />
                {`${getTimeCreatedAgo(timeCreatedAgo)} ago`}
              </p>
            </div>
            <div className="project-desc-experiment" style={{ visibility: 'inherit' }}>
              <p><b>Usage: ---</b></p>
            </div>
            <div className="project-desc-experiment" style={{ visibility: 'inherit' }}>
              <p>
                Id:
                {id}
              </p>
            </div>
            <button
              type="button"
              style={{ margin: '1.5em', cursor: 'pointer', marginLeft: 'auto' }}
              className="dangerous-red"
            >
              <b>X</b>
            </button>
          </div>
          )}
        </div>
        <br />
        {diStatus === RUNNING.toLowerCase() || diStatus === PENDING.toLowerCase() ? (
          <>
            <table className="file-properties">
              <thead>
                <tr className="title-row">
                  <td style={{ marginLeft: '5rem' }}><p>Name</p></td>
                </tr>
              </thead>
            </table>
            <div id="empty-table">
              <p>
                No files can be shown until the pipeline has finished
              </p>
            </div>
          </>
        ) : (
          <FilesTable
            isReturnOptVisible={false}
            files={files.map((f) => ({ id: f.id, name: f.name, type: f.type }))}
            headers={[
              'Name',
            ]}
            onClick={(e) => {
              const target = e.currentTarget;
              const targetDataKey = target.getAttribute('data-key');
              const targetId = target.id;
              const file = files.filter((f) => f.id === targetId)[0];
              let link = '';
              let routeType = '';
              if (targetDataKey === 'tree') {
                routeType = 'path';
                link = `/${selectedProject?.namespace}/${selectedProject?.slug}/-/tree/${branchName}/${encodeURIComponent(file.path)}`;
              } else {
                routeType = 'blob';
                link = `/${namespace}/${slug}/-/${routeType}/${encodeURIComponent(branchName)}/${encodeURIComponent(file.path)}`;
              }
              props.history.push(link);
            }}
          />
        )}
      </div>
    </div>
  );
};

DataInstanceDetails.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string,
      path: PropTypes.string,
      dataId: PropTypes.string,
      slug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  branches: PropTypes.arrayOf(
    PropTypes.shape({}).isRequired,
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects.all,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(DataInstanceDetails);

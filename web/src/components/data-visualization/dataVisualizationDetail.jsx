import React, { useState, useEffect } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import {
  shape, string, arrayOf, func,
} from 'prop-types';
import AuthWrapper from 'components/AuthWrapper';
import { SKIPPED, RUNNING, PENDING } from 'dataTypes';
import moment from 'moment';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { generateBreadCrumbs } from 'functions/helpers';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi.ts';
import DataPipelineApi from 'apis/DataPipelineApi';
import FilesApi from '../../apis/FilesApi.ts';
import './dataVisualizationDetail.scss';
import Navbar from '../navbar/navbar';
import FilesTable from '../files-table/filesTable';
import ProjectContainer from '../projectContainer';

const filesApi = new FilesApi();
const dataPipeApi = new DataPipelineApi();
const gitPipelinesApis = new GitlabPipelinesApi();

const DataVisualizationDetails = ({ ...props }) => {
  const [files, setFiles] = useState([]);
  const {
    project,
    project: {
      gitlabId,
    },
    branches,
    match: {
      params: {
        path, visId, namespace, slug,
      },
    },
  } = props;
  const [gitlabPipes, setGitlabPipes] = useState([]);
  const [backendPipeline, setBackendPipeline] = useState({});
  const gitlabFilterPipeline = gitlabPipes
    ?.filter((pipeline) => pipeline.ref.includes(backendPipeline?.name)
    && pipeline.status !== SKIPPED)[0];
  const selectedPipeline = branches.filter((item) => item.name.includes(backendPipeline?.name))[0];

  const {
    created_at: timeCreatedAgo, id, status: diStatus, ref: branchName, updated_at: updatedAt,
  } = gitlabFilterPipeline || {};
  const isCompleted = !(diStatus === RUNNING || diStatus === PENDING);
  const duration = (new Date(updatedAt) - new Date(timeCreatedAgo));

  useEffect(() => {
    dataPipeApi.getBackendPipelineById(visId)
      .then((res) => setBackendPipeline(parseToCamelCase(res)))
      .then(() => {
        gitPipelinesApis.getPipesByProjectId(gitlabId)
          .then((res) => setGitlabPipes(res));
      })
      .then(() => branchName !== undefined && filesApi.getFilesPerProject(
        gitlabId,
        path || '',
        false,
        branchName,
      ).then((filesPerProject) => setFiles(filesPerProject)))
      .catch(() => toastr.error('Error', 'Something went wrong fetching pipelines'));
  }, [visId, gitlabId, path, branchName]);

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Visualizations',
      href: `/${namespace}/${slug}/-/visualizations`,
    },
    {
      name: `${id}`,
      href: `/${namespace}/${slug}/-/visualizations/${visId}`,
    },
  ];

  return (
    <div>
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={generateBreadCrumbs(project, customCrumbs)}
      />
      <div className="main-content">
        <br />
        <div className="visualization-container">
          <div className="header">
            <p><b>Viewing</b></p>
          </div>
          {selectedPipeline && (
          <div className="content">
            <br />
            <div className="content-row">
              <div className="item">
                <p>Dataset:</p>
                <p><b>{branchName?.replace(/.*\//, '')}</b></p>
              </div>
              <AuthWrapper
                minRole={30}
              >
                <button
                  type="button"
                  style={{ padding: '0.5rem 1.3rem' }}
                  className="btn btn-danger"
                >
                  Abort
                </button>
              </AuthWrapper>
            </div>
            <div className="content-row">
              <div className="item">
                <p>Status:</p>
                <p><b>{diStatus}</b></p>
              </div>
              <div className="item">
                <p>DataOps ID:</p>
                <span style={{
                  border: '1px solid gray',
                  padding: '2px 0.5rem 0 2rem',
                  borderRadius: '0.2rem',
                }}
                >
                  {id}
                </span>
              </div>
            </div>
            <br />
            <div className="content-row">
              <div className="item">
                <p>
                  Created:
                </p>
                <p>
                  <b>
                    {moment(timeCreatedAgo).format('DD.MM.YYYY - hh:mm:ss')}
                  </b>
                </p>
              </div>
            </div>
            <div className="content-row">
              <div className="item">
                <p>
                  Completed:
                </p>
                <p>
                  <b>
                    {isCompleted ? moment(updatedAt).format('DD.MM.YYYY - hh:mm:ss') : '---'}
                  </b>
                </p>
              </div>
              <div className="item">
                <p>
                  Running time:
                </p>
                <p>
                  <b>
                    {duration
                      ? moment({}).startOf('day').milliseconds(duration).format('HH:mm:ss')
                      : '---'}
                  </b>
                </p>
              </div>
            </div>
            <div className="content-row">
              <div className="item">
                <p>
                  Owner:
                </p>
                <p>
                  <b>
                    {selectedPipeline?.commit?.author_name}
                  </b>
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
        <br />
        <FilesTable
          isReturnOptVisible={false}
          files={files.map((f) => ({ id: f.id, name: f.name, type: f.type }))}
          headers={['Name']}
          onClick={(e) => {
            const target = e.currentTarget;
            const targetDataKey = target.getAttribute('data-key');
            const targetId = target.id;
            const file = files.filter((f) => f.id === targetId)[0];
            let link = '';
            if (targetDataKey === 'tree') {
              link = `/${namespace}/${slug}/-/tree/${visId}/${encodeURIComponent(file.path)}`;
            } else {
              link = `/${namespace}/${slug}/-/blob/branch/${branchName}/path/${encodeURIComponent(file.path)}`;
            }
            props.history.push(link);
          }}
        />
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    project: state.projects.selectedProject,
    branches: state.branches,
  };
}


DataVisualizationDetails.propTypes = {
  project: shape({}).isRequired,
  branches: arrayOf(shape({})).isRequired,
  match: shape({
    params: shape({
      gitlabId: string.isRequired,
      path: string,
      visId: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
};


export default connect(mapStateToProps)(DataVisualizationDetails);

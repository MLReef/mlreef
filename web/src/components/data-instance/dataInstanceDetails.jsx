import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import {
  RUNNING, PENDING, SKIPPED, SUCCESS, FAILED, CANCELED,
} from 'dataTypes';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import AuthWrapper from 'components/AuthWrapper';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi.ts';
import DataPipelineApi from 'apis/DataPipelineApi';
import { setPreconfiguredOPerations } from 'actions/userActions';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import PropTypes, { shape, func } from 'prop-types';
import DataCard from 'components/layout/DataCard';
import FilesTable from '../files-table/filesTable';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceDetails.scss';
import FilesApi from '../../apis/FilesApi.ts';

const filesApi = new FilesApi();
const dataPipeApi = new DataPipelineApi();
const gitPipelinesApis = new GitlabPipelinesApi();

const DataInstanceDetails = (props) => {
  const {
    projects,
    branches,
    match: {
      params: {
        namespace, path, slug, dataId,
      },
    },
    history,
    setPreconfOps,
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
  const {
    created_at: timeCreatedAgo, id, status: diStatus, ref: branchName, updated_at: updatedAt
  } = gitlabFilterPipeline || {};
  const isCompleted = !(diStatus === RUNNING || diStatus === PENDING);
  let statusParagraphColor;
  switch (diStatus) {
    case RUNNING:
      statusParagraphColor = 'success';
      break;
    case SUCCESS:
      statusParagraphColor = 'success';
      break;
    case PENDING:
      statusParagraphColor = 'warning';
      break;
    case FAILED:
      statusParagraphColor = 'danger';
      break;
    case CANCELED:
      statusParagraphColor = 'danger';
      break;
    default:
      statusParagraphColor = 'lessWhite';
      break;
  }

  const duration = (new Date(updatedAt) - new Date(timeCreatedAgo));
  function goToPipelineView() {
    const { dataOperations, inputFiles } = backendPipeline;
    const configuredOperations = {
      dataOperatorsExecuted: dataOperations,
      inputFiles,
      pipelineBackendId: backendPipeline.id,
    };
    setPreconfOps(configuredOperations);
    history.push(`/${namespace}/${slug}/-/datasets/new`);
  }

  useEffect(() => {
    dataPipeApi.getBackendPipelineById(dataId)
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
  }, [id, gitlabId, path, branchName, dataId]);

  return (
    <>
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        folders={[groupName, selectedProject.name, 'Data', 'Instances']}
      />
      <div className="main-content">
        <br />
        <div className="dataset-container">
          <div className="header">
            <p>Viewing</p>
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
                <p style={{ color: `var(--${statusParagraphColor})` }}><b>{diStatus}</b></p>
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
        <div className="d-flex" style={{ height: '20rem', justifyContent: 'space-around' }}>
          {backendPipeline && backendPipeline.dataOperations && (
            <>
              <DataCard
                title="Data"
                linesOfContent={[
                  { text: 'Files selected from path' },
                  { text: `*${backendPipeline?.inputFiles ? backendPipeline?.inputFiles[0].location : ''}` },
                  { text: 'from' },
                  { text: `*${branchName?.replace(/.*\//, '')}` },
                ]}
              />
              <DataCard
                title="DataOps"
                linesOfContent={
                  backendPipeline
                    ?.dataOperations
                    ?.map((op, opInd) => ({ text: `*Op. ${opInd} - ${op.name}` }))
                }
              />
            </>
          )}
          <button
            type="button"
            className="btn btn-outline-dark mr-1"
            style={{ marginTop: 0, marginBottom: 'auto' }}
            onClick={() => goToPipelineView()}
          >
            View Pipeline
          </button>
          ,
        </div>
        <br />
        {diStatus === RUNNING || diStatus === PENDING ? (
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
                link = `/${namespace}/${slug}/-/${routeType}/branch/${encodeURIComponent(branchName)}/path/${encodeURIComponent(file.path)}`;
              }
              history.push(link);
            }}
          />
        )}
      </div>
    </>
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
  history: shape({
    push: func.isRequired,
  }).isRequired,
  setPreconfOps: func.isRequired,
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


function mapActionsToProps(dispatch) {
  return {
    setPreconfOps: bindActionCreators(setPreconfiguredOPerations, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataInstanceDetails);

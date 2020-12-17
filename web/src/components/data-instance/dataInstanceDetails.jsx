import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import {
  RUNNING, PENDING, PIPELINE_VIEWS_FORMAT
} from 'dataTypes';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import AuthWrapper from 'components/AuthWrapper';
import { generateBreadCrumbs } from 'functions/helpers';
import { goToPipelineView, getInfoFromStatus } from 'functions/pipeLinesHelpers';
import { setPreconfiguredOPerations } from 'actions/userActions';
import PropTypes, { shape, func } from 'prop-types';
import DataCard from 'components/layout/DataCard';
import FilesTable from '../files-table/filesTable';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceDetails.scss';
import FilesApi from '../../apis/FilesApi.ts';
import { closeModal, fireModal } from 'actions/actionModalActions';
import DataInstanteDeleteModal from 'components/DeleteDataInstance/DeleteDatainstance';
import actions from './DataInstanceActions';
import { getBranchesList } from 'actions/branchesActions';

const filesApi = new FilesApi();

const DataInstanceDetails = (props) => {
  const {
    project: selectedProject,
    branches,
    getBranchesList,
    match: {
      params: {
        namespace, path, slug, dataId,
      },
    },
    history,
    setPreconfOps,
    fireModal,
  } = props;

  const { gitlabId } = selectedProject;

  const [files, setFiles] = useState([]);
  const [dataInstance, setDataInstance] = useState({});
  const selectedPipeline = branches.filter((item) => item.name.includes(dataInstance?.name))[0];
  const {
    name,
    instances,
    dataOperations,
    id,
    inputFiles,
    timeCreatedAgo,
    gitlabPipelineId,
    diStatus,
    branchName,
    updatedAt
  } = dataInstance;

  let commitSha;
  let inputFilePath;
  if(instances) {
    commitSha = instances[0].pipeline_job_info?.commit_sha;
    inputFilePath = inputFiles[0].location?.toString();
  }
  const basePath = `${namespace}/${slug}`;
  const linkToRepoView = `/${basePath}/-/repository/tree/-/commit/${commitSha}`;

  const isCompleted = !(diStatus === RUNNING || diStatus === PENDING);
  const { statusColor: statusParagraphColor } = getInfoFromStatus(diStatus);

  const duration = (new Date(updatedAt) - new Date(timeCreatedAgo));
  const showFilesInfo = diStatus === undefined || diStatus === RUNNING || diStatus === PENDING;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    getBranchesList(gitlabId);

    actions.getDataInstanceAndAllItsInformation(gitlabId, dataId)
      .then(setDataInstance);

    if (branchName) {
      filesApi.getFilesPerProject(
        gitlabId,
        path || '',
        false,
        branchName,
      ).then((filesPerProject) => setFiles(filesPerProject))
      .catch(() => toastr.error('Error', 'Something went wrong fetching pipelines'));
    }
    // eslint-disable-next-line
  }, [gitlabId, path, branchName, dataId]);

  const pipelineViewProps = {
    backendPipeline: dataInstance,
    setPreconfOps,
    selectedProject,
    history,
    routeType: '/datasets/new',
  }
  const customCrumbs = [
    {
      name: 'Datasets',
      href: `/${namespace}/${slug}/-/datasets`,
    },
    {
      name: `${gitlabPipelineId}`,
      href: `/${namespace}/${slug}/-/datasets/${dataId}`,
    },
  ];

  return (
    <>
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
      />
      <div className="main-content">
        <br />
        <div className="dataset-container">
          <div className="header">
            <p>Viewing</p>
          </div>
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
                  onClick={() => {
                    fireModal({
                      title: `${isCompleted ? 'Delete': 'Abort' } ${name}`,
                      type: 'danger',
                      closable: true,
                      content: <DataInstanteDeleteModal dataInstanceName={name}/>,
                      onPositive: () => isCompleted ? actions
                        .deleteDataInstance(
                          id,
                          instances[0].id,
                        ).then(() => toastr.success('Success', 'The data instace was deleted'))
                          .then(() => history.push(`/${selectedProject?.gitlabNamespace}/${selectedProject?.slug}/-/datasets`))
                          .catch((err) => toastr.error('Error', err?.message))
                        : actions.abortDataInstance(
                          gitlabId,
                          id,
                          instances[0].id,
                          gitlabPipelineId
                        ).then(() => toastr.success('Success', 'The data instace was aborted'))
                          .then(actions.getDataInstanceAndAllItsInformation(gitlabId, dataId))
                          .then(setDataInstance)
                        .catch((err) => toastr.error('Error', err?.message))
                      })
                  }}
                >
                  <b>{isCompleted ? 'X' : 'Abort'}</b>
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
                  {gitlabPipelineId}
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
                    {moment(timeCreatedAgo).format(PIPELINE_VIEWS_FORMAT)}
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
                    {isCompleted ? moment(updatedAt).format(PIPELINE_VIEWS_FORMAT) : '---'}
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
                  <Link to={`/${selectedPipeline?.commit?.author_name}`}>
                    <b>
                      {selectedPipeline?.commit?.author_name}
                    </b>
                  </Link>
                </p>
              </div>
            </div>
            <div className="p-4 data-tabs">
              {dataOperations  && (
                <>
                <div>
                  <DataCard
                    title="Data"
                    linesOfContent={[
                      { text: 'Files selected from path' },
                      {
                        text: `*${inputFiles ? inputFiles[0].location : ''}`,
                        isLink: true,
                        href: inputFiles[0].location_type === 'PATH_FILE'
                          ? `/${basePath}/-/blob/commit/${commitSha}/path/${inputFilePath}`
                          : `${linkToRepoView}/path/${inputFilePath}`,
                      },
                      { text: 'from' },
                      { text: `*${branchName?.replace(/.*\//, '')}` },
                    ]}
                  />
                  </div>
                    <DataCard
                      styleClasses="model"
                      title="DataOps"
                      linesOfContent={
                        dataInstance
                          ?.dataOperations
                          ?.map((op, opInd) => ({
                            text: `*Op. ${opInd} - ${op.name}`,
                            isLink: true,
                            href: `/${namespace}/${op.slug}`
                          }))
                      }
                    />
                </>
              )}
              <button
                type="button"
                className="pipeline-view-btn btn btn-outline-dark ml-2 mb-auto"
                onClick={() => goToPipelineView(pipelineViewProps)}
              >
                View Pipeline
              </button>
            </div>
          </div>
        </div>
        <br />
        <br />
        {showFilesInfo ? (
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
            isReturnOptVisible={!!path}
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
              const baseUrl = `/${selectedProject?.gitlabNamespace}/${selectedProject?.slug}`;
              const encodedBranch = encodeURIComponent(branchName);
              const encodedPath = encodeURIComponent(file.path);
              if (targetDataKey === 'tree') {
                routeType = 'path';
                link = `${baseUrl}/-/datasets/${encodedBranch}/${id}/path/${encodedPath}`;
              } else {
                routeType = 'blob';
                link = `${baseUrl}/-/${routeType}/branch/${encodedBranch}/path/${encodedPath}`;
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
  project: PropTypes.shape({}).isRequired,
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
    project: state.projects.selectedProject,
    branches: state.branches,
  };
}

function mapActionsToProps(dispatch) {
  return {
    setPreconfOps: bindActionCreators(setPreconfiguredOPerations, dispatch),
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
    getBranchesList: bindActionCreators(getBranchesList, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataInstanceDetails);

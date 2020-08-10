import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import { RUNNING, PENDING } from 'dataTypes';
import FilesTable from '../files-table/filesTable';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceDetails.scss';
import FilesApi from '../../apis/FilesApi.ts';

const filesApi = new FilesApi();

const DataInstanceDetails = (props) => {
  const {
    projects: {
      selectedProject: project,
      selectedProject: { gid },
    },
    branches,
    match: {
      params: {
        path, dataId, branch,
      },
    },
    location: {
      state: {
        diName,
        timeCreatedAgo,
        diStatus,
      },
    },
  } = props;

  const pipelineName = decodeURIComponent(diName);
  const selectedPipeline = branches.filter((item) => item.name === pipelineName);
  const groupName = project.namespace.name;
  const [files, setFiles] = useState([]);

  useEffect(() => {
    filesApi.getFilesPerProject(
      gid,
      path || '',
      false,
      diName,
    ).then((filesPerProject) => setFiles(filesPerProject))
      .catch(() => toastr.error('Error', 'Something went wrong getting your files'));
  }, [diName, gid, path]);

  return (
    <div id="experiments-overview-container">
      <Navbar />
      <ProjectContainer
        activeFeature="data"
        folders={[groupName, project.name, 'Data', 'Instances']}
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
              <p><b>{pipelineName}</b></p>
              <p>
                Created by
                <b>{selectedPipeline[0].commit.author_name}</b>
                <br />
                {timeCreatedAgo}
              </p>
            </div>
            <div className="project-desc-experiment" style={{ visibility: 'inherit' }}>
              <p><b>Usage: ---</b></p>
            </div>
            <div className="project-desc-experiment" style={{ visibility: 'inherit' }}>
              <p>
                Id:
                {dataId}
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
                link = `/${project.namespace}/${project.slug}/-/tree/${branch}/${encodeURIComponent(file.path)}`;
              } else {
                routeType = 'blob';
                link = `/my-projects/${gid}/${diName}/${routeType}/${encodeURIComponent(file.path)}`;
              }
              props.history.push(link);
            }}
          />
        )}
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(DataInstanceDetails);

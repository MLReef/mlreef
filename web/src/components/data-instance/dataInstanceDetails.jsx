import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import FilesTable from '../files-table/filesTable';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceDetails.css';
import filesApi from '../../apis/FilesApi';

const DataInstanceDetails = ({ ...props }) => {
  const {
    projects: { selectedProject: project },
    branches,
    match: {
      params: {
        projectId, path, di_name: diName, branch,
      },
    },
  } = props;
  const pipelineName = decodeURIComponent(diName);
  const selectedPipeline = branches.filter((item) => item.name === pipelineName);
  const groupName = project.namespace.name;
  const [files, setFiles] = useState([]);

  useEffect(() => {
    filesApi.getFilesPerProject(
      projectId,
      path || '',
      false,
      diName,
    ).then(async (res) => {
      if (res.ok) {
        const filesPerProject = await res.json();
        setFiles(filesPerProject);
      }
    }).catch(() => {
      toastr.error('Error', 'Something went wrong getting your files');
    });
  }, [diName, projectId, path]);

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
                ---ago
              </p>
            </div>
            <div className="project-desc-experiment" style={{ visibility: 'inherit' }}>
              <p><b>Usage: ---</b></p>
              <p>Expires in: ---</p>
            </div>
            <div className="project-desc-experiment" style={{ visibility: 'inherit' }}>
              <p><b>--- files changed</b></p>
              <p>
                Id:
                {selectedPipeline[0].commit.short_id}
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
              link = `/my-projects/${projectId}/${branch}/data-instances/${diName}/${routeType}/${encodeURIComponent(file.path)}`;
            } else {
              routeType = 'blob';
              link = `/my-projects/${projectId}/${diName}/${routeType}/${encodeURIComponent(file.path)}`;
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
    projects: state.projects,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(DataInstanceDetails);

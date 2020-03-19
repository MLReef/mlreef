import React, { useState, useEffect } from 'react';
import { toastr } from 'react-redux-toastr';
import { connect } from 'react-redux';
import {
  shape, string, arrayOf, func,
} from 'prop-types';
import FilesTable from '../files-table/filesTable';
import FilesApi from '../../apis/FilesApi';
import './dataVisualizationDetail.css';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';

const DataVisualizationDetails = ({ ...props }) => {
  const [files, setFiles] = useState([]);
  const {
    project,
    branches,
    match: {
      params: {
        projectId, path, visName,
      },
    },
  } = props;
  const groupName = project.namespace.name;
  const visNameDecoded = decodeURIComponent(visName);
  const visualizationSelected = branches.filter((br) => br.name === visNameDecoded)[0];
  useEffect(() => {
    FilesApi.getFilesPerProject(
      projectId,
      path || '',
      false,
      visName,
    ).then((res) => {
      setFiles(res);
    }).catch(() => {
      toastr.error('Error', 'Something went wrong getting your files');
    });
  }, [visName, projectId, path]);
  return (
    <div id="experiments-overview-container">
      <Navbar />
      <ProjectContainer
        project={project}
        activeFeature="data"
        folders={[groupName, project.name, 'Data', 'Instances']}
      />
      <div className="main-content">
        <br />
        <br />
        <div className="viewing-visualization">
          <div className="title-bar">
            <p><b>Viewing</b></p>
          </div>
          <div className="content-data">
            <div>
              <p><b>{visualizationSelected.name}</b></p>
              <p>
                Create by
                &nbsp;
                <b>{visualizationSelected.commit.author_name}</b>
                &nbsp;
                {getTimeCreatedAgo(visualizationSelected.commit.created_at, new Date())}
                &nbsp;
                ago
              </p>
            </div>
            <div>
              <p><b>----</b></p>
              <p>di_code</p>
            </div>
            <div id="buttons-div">
              <br />
              <button type="button" className="dangerous-red">
                <b>X</b>
              </button>
            </div>
          </div>
        </div>
        <br />
        <FilesTable
          files={files.map((f) => ({ id: f.id, name: f.name, type: f.type }))}
          headers={['Name']}
          onClick={(e) => {
            const target = e.currentTarget;
            const targetDataKey = target.getAttribute('data-key');
            const targetId = target.id;
            const file = files.filter((f) => f.id === targetId)[0];
            let link = '';
            if (targetDataKey === 'tree') {
              link = `/my-projects/${projectId}/visualizations/${visName}/path/${encodeURIComponent(file.path)}`;
            } else {
              link = `/my-projects/${projectId}/${visName}/blob/${encodeURIComponent(file.path)}`;
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
      projectId: string.isRequired,
      path: string,
      visName: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
};


export default connect(mapStateToProps)(DataVisualizationDetails);

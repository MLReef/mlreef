import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import folderIcon from '../../images/folder_01.svg';
import fileIcon from '../../images/file_01.svg';
import './dataInstanceDetails.css';
import filesApi from '../../apis/FilesApi';

const DataInstanceDetails = ({ ...props }) => {
  const project = props.projects.selectedProject;
  const groupName = project.namespace.name;
  const pipelineName = decodeURIComponent(props.match.params.di_name);
  const selectedPipeline = props.branches.filter((item) => item.name === pipelineName);

  const { match: { params: { projectId, path, di_name, branch } } } = props;
  const [files, setFiles] = useState([]);

  useEffect(() => {
    filesApi.getFilesPerProject(
      projectId,
      path || '',
      false,
      di_name,
    ).then((res) => {
      setFiles(res);
    }).catch((err) => {
      console.log(err);
    })
  }, [di_name, projectId, path])

  const getBack = () => window.history.back()

  const getReturnOption = () => (
    window.location.href.includes('path') ? (
      <tr className="files-row">
        <td className="file-type">
          <button
            type="button"
            onClick={getBack}
            style={{ padding: '0' }}
          >
            <img src={folderIcon} alt="" />
          </button>
          <button
            type="button"
            onClick={getBack}
          >
            ..
          </button>
        </td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    )
      : null);


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
        <div id="line" />
        <br />
        <div className="commit-per-date">
          <div className="commit-header">
            <p>Viewing</p>
          </div>
          {selectedPipeline && (
          <div className="summary-data" style={{ display: 'flex' }}>
            <div className="project-desc-experiment">
              <p><b>{pipelineName}</b></p>
              <p>
                Created by
                <b>{selectedPipeline[0].commit.author_name}</b>
                <br />
                --- ago
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
            <button style={{ margin: '1.5em', cursor: 'pointer', marginLeft: 'auto' }} className="dangerous-red"><b>X</b></button>
          </div>
          )}
        </div>
        <br />
        <div className="files-container">
          <table className="file-properties" id="file-tree">
            <thead>
              <tr className="title-row">
                <th>
                  <p id="paragraphName">Name</p>
                </th>
                <th>
                  <p id="paragraphLastCommit">Last Commit</p>
                </th>
                <th>
                  <p id="paragraphSize">Size(files)</p>
                </th>
                <th>
                  <p id="paragraphLastUpdate">Last Update</p>
                </th>
              </tr>
            </thead>
            <tbody>
            {getReturnOption()}
              {files.map((file) => {
                  let icon;
                  let link;
                  let routeType = '';
                  if (file.type === 'tree') {
                    routeType = 'path';
                    icon = folderIcon;
                    link = `/my-projects/${projectId}/${branch}/data-instances/${di_name}/${routeType}/${encodeURIComponent(file.path)}`;
                  } else {
                    routeType = 'blob';
                    icon = fileIcon;
                    link = `/my-projects/${projectId}/${di_name}/${routeType}/${encodeURIComponent(file.path)}`;
                  } 
                  return (
                    <tr key={`${file.id} ${file.name}`} className="files-row">
                      <td className="file-type">
                        <Link to={link}>
                          <img src={icon} alt="" />
                        </Link>
                        <Link to={link} className="file-name-link">
                          {file.name}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
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

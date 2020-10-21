import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import './dataVisualizationOverview.css';
import DataPipelineApi from 'apis/DataPipelineApi';
import { generateBreadCrumbs } from 'functions/helpers';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import Instruction from '../instruction/instruction';
import DataVisualizationCard from './dataVisualizationCard';
import GitlabPipelinesApi from '../../apis/GitlabPipelinesApi.ts';
import { classifyPipeLines } from '../../functions/pipeLinesHelpers';

const dataPipelineApi = new DataPipelineApi();
const gitlabPipelinesApi = new GitlabPipelinesApi();

export class DataVisualizationOverview extends Component {
  constructor(props) {
    super(props);
    const { selectedProject, selectedProject: { id }, branches } = this.props;
    this.state = {
      visualizations: null,
      all: null,
    };
    const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('data-visualization'));
    dataPipelineApi.getProjectPipelines(id)
      .then((backendPipelines) => {
        const visualPipelines = backendPipelines.filter((pipe) => pipe.pipeline_type === 'VISUALIZATION');
        gitlabPipelinesApi.getPipesByProjectId(selectedProject.gid).then((res) => {
          const visualizations = classifyPipeLines(res, arrayOfBranches, visualPipelines);
          const finalClassification = [];
          finalClassification[0] = { status: 'In progress', values: [...visualizations[0].values] };
          finalClassification[1] = {
            status: 'Active',
            values: [
              ...visualizations[1].values,
              ...visualizations[2].values,
              ...visualizations[3].values,
            ],
          };
          finalClassification[2] = {
            status: 'Expired',
            values: [
              ...visualizations[4].values,
            ],
          };
          this.setState({
            visualizations: finalClassification,
            all: finalClassification,
          });
        });
      });
    this.handleFilterBtnClick = this.handleFilterBtnClick.bind(this);
  }

  handleFilterBtnClick(idFilterButtonPressed) {
    let filteredIns = [];
    const { all } = this.state;
    switch (idFilterButtonPressed) {
      case 'all':
        filteredIns = all;
        break;
      case 'progress':
        filteredIns = all.filter((dataIns) => dataIns.status === 'In progress');
        break;
      case 'active':
        filteredIns = all.filter((dataIns) => dataIns.status === 'Active');
        break;
      default:
        filteredIns = all.filter((dataIns) => dataIns.status === 'Expired');
        break;
    }
    this.setState({ visualizations: filteredIns });
  }

  render() {
    const {
      selectedProject: {
        gid,
      },
      selectedProject,
      match: {
        params: {
          namespace,
          slug,
        },
      },
    } = this.props;
    const {
      visualizations,
    } = this.state;

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Visualizations',
        href: `/${namespace}/${slug}/-/visualizations`,
      },
    ];

    return (
      <>
        <Navbar />
        <ProjectContainer
          activeFeature="data"
          breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
        />
        <Instruction
          id="DataVisualizationOverview"
          titleText="Your data visualizations:"
          paragraph={
            `Here you will find all your data visualizations created by a data visualization pipeline. You can access the visualization of a pipeline
            as soon as it finished. `
          }
        />

        <div className="main-content">
          <div id="buttons-container" className="left">
            <button
              id="all"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              All
            </button>
            <button
              id="progress"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              In progress
            </button>
            <button
              id="active"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              Active
            </button>
            <button
              id="expired"
              type="button"
              className="btn btn-switch"
              onClick={(e) => this.handleFilterBtnClick(e.target.id)}
            >
              Expired
            </button>
          </div>
          {visualizations === null
            ? <div id="loading-circular-progress"><MLoadingSpinner /></div>
            : visualizations.map((dataInsClas) => (
              <DataVisualizationCard
                classification={dataInsClas}
                projectId={gid}
                namespace={namespace}
                slug={slug}
                key={dataInsClas.status}
              />
            ))}

        </div>
        <br />
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches,
  };
}

DataVisualizationOverview.propTypes = {
  selectedProject: shape({
    gid: number.isRequired,
    namespace: string.isRequired,
    name: string.isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
  branches: arrayOf(shape({})).isRequired,
};

export default connect(mapStateToProps)(DataVisualizationOverview);

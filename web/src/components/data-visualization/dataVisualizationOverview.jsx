import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import './dataVisualizationOverview.css';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import Instruction from '../instruction/instruction';
import DataVisualizationCard from './dataVisualizationCard';
import PipeLinesApi from '../../apis/PipelinesApi';
import { classifyPipeLines } from '../../functions/pipeLinesHelpers';
import DataVisualizationDetails from './dataVisualizationDetail';

export class DataVisualizationOverview extends Component {
  constructor(props) {
    super(props);
    const { selectedProject, branches } = this.props;
    this.state = {
      visualizations: null,
      all: null,
      visualizationSelected: null,
    };
    const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('data-visualization'));
    PipeLinesApi.getPipesByProjectId(selectedProject.id).then((res) => {
      const visualizations = classifyPipeLines(res, arrayOfBranches);
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
    this.handleFilterBtnClick = this.handleFilterBtnClick.bind(this);
    this.setVisualizationSelected = this.setVisualizationSelected.bind(this);
  }

  setVisualizationSelected = (visualization) => this.setState(() => ({
    visualizationSelected: visualization,
  }));

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
      selectedProject,
    } = this.props;
    const {
      visualizations,
      visualizationSelected,
    } = this.state;
    const groupName = selectedProject.namespace.name;
    return (
      <>
        <Navbar />
        <ProjectContainer
          project={selectedProject}
          activeFeature="data"
          folders={[groupName, selectedProject.name, 'Data', 'Visualizations']}
        />
        <div className="main-content">
          {visualizationSelected ? (
            <DataVisualizationDetails
              visualizationSelected={visualizationSelected}
              setVisualizationSelected={this.setVisualizationSelected}
            />
          ) : (
            <>
              <Instruction
                titleText="Handling data visualizations:"
                paragraph={
                `A data visualization is the output of your data visualization pipeline. 
                By clicking on the name of your visualization, you will get access to the output files`
                }
              />
              <br />
              <div id="line" />
              <br />
              <div id="buttons-container">
                <button
                  id="all"
                  type="button"
                  className="non-active-black-border rounded-pipeline-btn"
                  onClick={(e) => this.handleFilterBtnClick(e.target.id)}
                >
                All
                </button>
                <button
                  id="progress"
                  type="button"
                  className="non-active-black-border rounded-pipeline-btn"
                  onClick={(e) => this.handleFilterBtnClick(e.target.id)}
                >
                In progress
                </button>
                <button
                  id="active"
                  type="button"
                  className="non-active-black-border rounded-pipeline-btn"
                  onClick={(e) => this.handleFilterBtnClick(e.target.id)}
                >
                Active
                </button>
                <button
                  id="expired"
                  type="button"
                  className="non-active-black-border rounded-pipeline-btn"
                  onClick={(e) => this.handleFilterBtnClick(e.target.id)}
                >
                Expired
                </button>
              </div>
              {visualizations === null
                ? <div id="loading-circular-progress"><CircularProgress size={30} /></div>
                : visualizations.map((dataInsClas) => (
                  <DataVisualizationCard
                    setVisualizationSelected={this.setVisualizationSelected}
                    classification={dataInsClas}
                    projectId={selectedProject.id}
                    key={dataInsClas.status}
                  />
                ))}
            </>
          )}
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
    id: number.isRequired,
    namespace: shape({
      name: string.isRequired,
    }).isRequired,
    name: string.isRequired,
  }).isRequired,
  branches: arrayOf(shape({})).isRequired,
};

export default connect(mapStateToProps)(DataVisualizationOverview);

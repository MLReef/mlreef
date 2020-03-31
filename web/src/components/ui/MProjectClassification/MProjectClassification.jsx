import React, { Component } from 'react';
import { bool, shape, arrayOf, string } from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ArrowButton from 'components/arrow-button/arrowButton';
import ProjectSet from '../../projectSet';
import './MProjectClassification.scss';
import MCheckBox from '../MCheckBox/MCheckBox';

class MProjectClassification extends Component {
  projFilterBtnsList = ['own', 'starred', 'explore'];

  constructor(props) {
    super(props);
    this.state = {
      isDataTypesVisible: true,
    };
  }

  // this change tabs in projectSet
  changeScreen = (screen) => {
    const {
      history: {
        push,
        location: {
          pathname,
        },
      },
    } = this.props;

    push(`${pathname}${screen}`);
  }

  handleClickDataTypesButton = () => this.setState(
    (prevState) => ({
      isDataTypesVisible: !prevState.isDataTypesVisible,
    }),
  );

  handleProjectFilterBtn(e, screen) {
    this.changeScreen(screen);
    const { classification } = this.props;
    this.projFilterBtnsList.forEach((btnId) => {
      document.getElementById(`${classification}-${btnId}-btn`).classList.replace('btn-basic-info', 'btn-basic-dark');
    });
    e.target.classList.replace('btn-basic-dark', 'btn-basic-info');
  }

  render() {
    const {
      isDataTypesVisible,
    } = this.state;

    const {
      classification,
      isFetching,
      userProjects,
      starredProjects,
      allProjects,
      history: {
        location: {
          hash: screen,
        },
      },
    } = this.props;
    const dataTypes = [
      { name: `${classification} data-types`, label: 'Text' },
      { name: `${classification} data-types`, label: 'Image' },
      { name: `${classification} data-types`, label: 'Audio' },
      { name: `${classification} data-types`, label: 'Video' },
      { name: `${classification} data-types`, label: 'Tabular' },
    ];

    return (
      <div className="main-content">
        <div id="buttons-div">
          <div id="filter-div">
            <button
              id={`${classification}-own-btn`}
              key={this.ownBtn}
              onClick={(e) => this.handleProjectFilterBtn(e, '#personal')}
              type="button"
              className="btn btn-basic-dark"
            >
              Own
            </button>
            <button
              id={`${classification}-starred-btn`}
              key={this.starredBtn}
              onClick={(e) => this.handleProjectFilterBtn(e, '#starred')}
              type="button"
              className="btn btn-basic-dark"
            >
              Starred
            </button>
            <button
              id={`${classification}-explore-btn`}
              key={this.exploreBtn}
              onClick={(e) => this.handleProjectFilterBtn(e, '#explore')}
              type="button"
              className="btn btn-basic-dark"
            >
              Explore
            </button>
          </div>
          <div id="new-element-container">
            <Link
              to="/new-project"
              type="button"
              className="btn btn-primary"
            >
              New Project
            </Link>
          </div>
        </div>
        {isFetching
          ? (
            <div className="project-content-loader">
              <CircularProgress size={40} />
            </div>
          )
          : (
            <div id="main-content-div">
              <ProjectSet
                screen={screen || '#personal'}
                changeScreen={this.changeScreen}
                allProjects={allProjects}
                personalProjects={userProjects}
                starredProjects={starredProjects}
              />
              <div id="side-filters">
                <div id="input-div">
                  <p>Refine by</p>
                </div>
                <br />
                <div id="data-types-deploy-btn">
                  <p>
                    Data types
                  </p>
                  <ArrowButton callback={this.handleClickDataTypesButton} />
                </div>
                {isDataTypesVisible
                && (
                  dataTypes.map((dtype) => (
                    <MCheckBox
                      key={`${dtype.name} ${dtype.label} comp`}
                      name={dtype.name}
                      labelValue={dtype.label}
                      callback={(name, labelValue, newValue) => {
                        
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
      </div>
    );
  }
}

MProjectClassification.propTypes = {
  classification: string.isRequired,
  isFetching: bool.isRequired,
  userProjects: arrayOf(shape({})),
  starredProjects: arrayOf(shape({})),
  allProjects: arrayOf(shape({})),
};

MProjectClassification.defaultProps = {
  userProjects: [],
  starredProjects: [],
  allProjects: [],
};

export default MProjectClassification;

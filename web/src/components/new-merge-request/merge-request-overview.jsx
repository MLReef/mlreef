import React, { Component } from 'react';
import { CircularProgress } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  number, shape, string, arrayOf, func,
} from 'prop-types';
import { getMergeRequestsList } from 'actions/mergeActions';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './merge-request-overview.css';
import CustomizedButton from '../CustomizedButton';
import { mrStates } from '../../dataTypes';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';
import BlackBorderedButton from '../BlackBorderedButton';

/**
   * @param {mrs} is the merge requests list to be classified by state
   */
const classifyMrsByState = (mrs) => mrStates.map((state) => {
  const list = mrs.filter((mergeReq) => mergeReq.state === state);
  const { length } = list;
  return {
    mrState: state,
    list,
    length,
  };
});

class MergeRequestOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mrsList: null,
      btnSelected: 'all-btn',
    };
    this.handleFilterBtnClick = this.handleFilterBtnClick.bind(this);
    this.fetchMergeRequests = this.fetchMergeRequests.bind(this);
  }

  componentDidMount() {
    this.fetchMergeRequests();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.mergeRequests.length > 0) {
      const classifiedMrs = classifyMrsByState(nextProps.mergeRequests);
      return { mrsList: classifiedMrs };
    }

    if (nextProps.mergeRequests.length === 0) {
      return { mrsList: [] };
    }

    return prevState;
  }

  handleFilterBtnClick = (e) => {
    this.setState({ btnSelected: e.currentTarget.id });
  }

  filterStateAndCount = (stateIndex) => {
    const {
      mrsList,
    } = this.state;
    if (!mrsList) {
      return [];
    }
    return mrsList
      .filter(
        (mrClass) => mrClass.mrState === mrStates[stateIndex],
      )[0] || { list: [] };
  }

  fetchMergeRequests() {
    const {
      actions,
      match: {
        params: { projectId: gid },
      },
    } = this.props;

    return actions.getMergeRequestsList(gid);
  }

  render() {
    const {
      mrsList,
      btnSelected,
    } = this.state;
    const {
      selectedProject,
      history,
      match: {
        params: { namespace, slug },
      },
    } = this.props;
    const openedMrs = this.filterStateAndCount(0);
    const closedMrs = this.filterStateAndCount(1);
    const mergedMrs = this.filterStateAndCount(2);

    const projectName = selectedProject.name;
    const groupName = selectedProject.namespace;
    return (
      <>
        <Navbar />
        <ProjectContainer
          activeFeature="data"
          folders={[groupName, projectName, 'Data']}
        />
        <div className="main-content">
          {!mrsList
            ? <div id="circular-progress-container"><CircularProgress /></div>
            : (
              <>
                <br />
                <br />
                <div id="filter-buttons-new-mr">
                  <BlackBorderedButton className="mr-2 mb-2" id="open-btn" textContent={`${openedMrs.list.length} Open`} onClickHandler={this.handleFilterBtnClick} />
                  <BlackBorderedButton className="mr-2 mb-2" id="merged-btn" textContent={`${mergedMrs.list.length} Merged`} onClickHandler={this.handleFilterBtnClick} />
                  <BlackBorderedButton className="mr-2 mb-2" id="closed-btn" textContent={`${closedMrs.list.length} Closed`} onClickHandler={this.handleFilterBtnClick} />
                  <BlackBorderedButton className="mr-auto mb-2" id="all-btn" textContent="All" onClickHandler={this.handleFilterBtnClick} />
                  <CustomizedButton
                    className="ml-2 mb-2"
                    id="new-mr-link"
                    loading={false}
                    onClickHandler={() => {
                      history.push(`/${namespace}/${slug}/-/merge_requests/new`);
                    }}
                    buttonLabel="New merge request"
                  />
                </div>
                <div id="merge-requests-container-div">
                  {btnSelected === 'open-btn' && openedMrs.list.length > 0
                    ? <MergeRequestCard namespace={namespace} slug={slug} mergeRequestsList={openedMrs} key={openedMrs.mrState} />
                    : null}
                  {btnSelected === 'merged-btn' && mergedMrs.list.length > 0
                    ? <MergeRequestCard namespace={namespace} slug={slug} mergeRequestsList={mergedMrs} key={mergedMrs.mrState} />
                    : null}
                  {btnSelected === 'closed-btn' && closedMrs.list.length > 0
                    ? <MergeRequestCard namespace={namespace} slug={slug} mergeRequestsList={closedMrs} key={closedMrs.mrState} />
                    : null}
                  {btnSelected === 'all-btn' && mrsList
                    ? mrsList.map((mrsClass) => (
                      <MergeRequestCard namespace={namespace} slug={slug} mergeRequestsList={mrsClass} key={mrsClass.mrState} />
                    ))
                    : null}
                </div>
                <br />
                <br />
              </>
            )}
        </div>
      </>
    );
  }
}

const MergeRequestCard = ({ namespace, slug, mergeRequestsList }) => (
  <div className="merge-request-card" key={mergeRequestsList.mrState}>
    <div className="title">
      <p>{mergeRequestsList.mrState}</p>
    </div>
    <div>
      {mergeRequestsList.list.map(((mr, index) => (
        <div className="merge-request-subcard" key={`${index.toString()}`}>
          <p>
            <b>
              <Link to={`/${namespace}/${slug}/-/merge_requests/${mr.iid}`}>
                {mr.title}
              </Link>
            </b>
          </p>
          <p>
            {mr.reference}
            {' '}
            Opened by
            {' '}
            <b>
              <a href={`/${mr.author.username}`}>
                {mr.author.username}
              </a>
            </b>
            {' '}
            {getTimeCreatedAgo(mr.updated_at, new Date())}
            {' '}
            ago
          </p>
        </div>
      )
      ))}
    </div>
  </div>
);

MergeRequestCard.propTypes = {
  namespace: string.isRequired,
  slug: string.isRequired,
  mergeRequestsList: shape({
    mrState: string.isRequired,
    list: arrayOf(shape({
      title: string.isRequired,
      reference: string.isRequired,
      username: string,
      updated_at: string.isRequired,
    })).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    mergeRequests: state.mergeRequests,
  };
}

function mapActionsToProps(dispatch) {
  return {
    actions: {
      getMergeRequestsList: bindActionCreators(getMergeRequestsList, dispatch),
    },
  };
}

MergeRequestOverview.propTypes = {
  selectedProject: shape({
    gid: number.isRequired,
    name: string.isRequired,
    namespace: string.isRequired,
  }).isRequired,
  actions: shape({
    getMergeRequestsList: func.isRequired,
  }).isRequired,
  mergeRequests: arrayOf(shape).isRequired,
  match: shape({
    params: shape({}).isRequired,
  }).isRequired,
  history: shape({}).isRequired,
};

export default connect(mapStateToProps, mapActionsToProps)(MergeRequestOverview);

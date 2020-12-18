import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  number, shape, string, arrayOf, func,
} from 'prop-types';
import { generateBreadCrumbs } from 'functions/helpers';
import AuthWrapper from 'components/AuthWrapper';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import { getMergeRequestsList } from 'store/actions/mergeActions';
import Navbar from '../../navbar/navbar';
import ProjectContainer from '../../projectContainer';
import './merge-request-overview.css';
import { mrStates } from '../../../dataTypes';
import { getTimeCreatedAgo } from '../../../functions/dataParserHelpers';

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
      btnSelected: 'all',
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
      selectedProject: { gid },
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
    const classifiedMergeRequests = {
      open: this.filterStateAndCount(0),
      closed: this.filterStateAndCount(1),
      merged: this.filterStateAndCount(2),
      all: mrsList,
    };

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Merge Requests',
        href: `/${namespace}/${slug}/-/merge_requests`,
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
          {!mrsList
            ? <div id="circular-progress-container"><MLoadingSpinner /></div>
            : (
              <>
                <br />
                <br />
                <div id="filter-buttons-new-mr">
                  <button type="button" className="btn btn-basic-dark mr-2 mb-2" id="open" onClick={this.handleFilterBtnClick}>
                    {`${classifiedMergeRequests.open.list.length} Open`}
                  </button>
                  <button type="button" className="btn btn-basic-dark mr-2 mb-2" id="merged" onClick={this.handleFilterBtnClick}>
                    {`${classifiedMergeRequests.merged.list.length} Merged`}
                  </button>
                  <button type="button" className="btn btn-basic-dark mr-2 mb-2" id="closed" onClick={this.handleFilterBtnClick}>
                    {`${classifiedMergeRequests.closed.list.length} Closed`}
                  </button>
                  <button type="button" className="btn btn-basic-dark mr-auto mb-2" id="all" onClick={this.handleFilterBtnClick}>
                    All
                  </button>
                  <AuthWrapper minRole={30} norender>
                    <button
                      type="button"
                      className="btn btn-primary mr-2 ml-2 mb-2"
                      id="new-mr-link"
                      onClick={() => history.push(`/${namespace}/${slug}/-/merge_requests/new`)}
                    >
                      New merge request
                    </button>
                  </AuthWrapper>
                </div>
                <div id="merge-requests-container-div">
                  {btnSelected === 'all' && classifiedMergeRequests.all
                    ? classifiedMergeRequests.all.map((mrsClass) => (
                      <MergeRequestCard
                        namespace={namespace}
                        slug={slug}
                        mergeRequestsList={mrsClass}
                        key={mrsClass.mrState}
                      />
                    ))
                    : (
                      <MergeRequestCard
                        namespace={namespace}
                        slug={slug}
                        mergeRequestsList={classifiedMergeRequests[btnSelected]}
                        key={classifiedMergeRequests[btnSelected].mrState}
                      />
                    )}
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

const MergeRequestCard = ({ namespace, slug, mergeRequestsList }) => {
  if (mergeRequestsList.list.length === 0) return <div />;

  return (
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
};

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
    mergeRequests: state.mergeRequests.list,
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

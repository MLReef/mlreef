import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import {
  shape, number, string,
} from 'prop-types';
import moment from 'moment';
import greyLogo from 'images/icon_grey-01.png';
import './jobs.scss';
import JobsApi from 'apis/JobsApi';
import DataPipelineApi from 'apis/DataPipelineApi';
import { determineJobClass } from 'functions/pipeLinesHelpers';
import { getTimeCreatedAgo } from '../../../functions/dataParserHelpers';

const dataPipeApi = new DataPipelineApi();
const jobsApi = new JobsApi();

const Jobs = (props) => {
  const { selectedProject: { gid, id }, namespace, slug } = props;
  const [jobList, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [backendPipes, setBackendPipes] = useState([]);
  useEffect(() => {
    dataPipeApi.getProjectPipelines(id)
      .then((backendPipelines) => setBackendPipes(backendPipelines))
      .then(() => {
        jobsApi.getPerProject(gid)
          .then((res) => {
            setFilteredJobs(res);
            setJobs(res);
          });
      })
      .catch(() => toastr.error('Error', 'Could not retrieve all the jobs'));
  }, [id, gid]);

  const handleButtonsClick = (e) => {
    if (e.target.parentNode) {
      e.target.parentNode.childNodes.forEach((childNode) => {
        if (childNode.id !== e.target.id) {
          childNode.classList.remove('active');
        }
      });
      e.target.classList.add('active');
    }

    let allJobs = jobList;
    if (e.target.id !== 'all') {
      allJobs = allJobs.filter((job) => job.status === e.target.id);
    }
    setFilteredJobs(allJobs);
  };

  return (
    <>
      <div className="job-container">
        <div>
          <h1 className="job-container-title">Jobs</h1>
        </div>
        <div className="my-3 mx-0">
          <button
            type="button"
            className="btn btn-basic-dark"
            id="all"
            onClick={handleButtonsClick}
          >
            All
          </button>
          <button
            type="button"
            className="btn btn-basic-dark  ml-3"
            id="running"
            onClick={handleButtonsClick}
          >
            Running
          </button>
          <button
            type="button"
            className="btn btn-basic-dark  ml-3"
            id="success"
            onClick={handleButtonsClick}
          >
            Success
          </button>
          <button
            type="button"
            className="btn btn-basic-dark  ml-3"
            id="failed"
            onClick={handleButtonsClick}
          >
            Failed
          </button>
        </div>
        <table className="job-table">
          <thead className="job-table-head">
            <tr className="head-tr">
              <th>Status</th>
              <th>Job</th>
              <th>Class</th>
              <th>Pipeline</th>
              <th>Timing</th>
            </tr>
          </thead>
          {filteredJobs.length > 0
            ? (
              <tbody className="job-table-body">
                {filteredJobs.map((job, index) => {
                  const selectedPipe = backendPipes
                    ?.filter((pipe) => job?.ref.includes(pipe.name))[0];
                  const jobClass = selectedPipe?.pipeline_type;
                  let jobStatus = <span><b>{job.status}</b></span>;
                  const timeDuration = job.duration !== null && moment({}).startOf('day').seconds(job.duration).format('HH:mm:ss');
                  if (job.status === 'success' || job.status === 'running') {
                    jobStatus = <span style={{ color: '#2dbe91' }}><b>{job.status}</b></span>;
                  } else if (job.status === 'failed' || job.status === 'canceled') {
                    jobStatus = <span style={{ color: '#f2261d' }}><b>{job.status}</b></span>;
                  } else if (job.status === 'pending') {
                    jobStatus = <span style={{ color: '#ebba45' }}><b>pending</b></span>;
                  }
                  return (
                    <tr className="p-3" key={index.toString()}>
                      <td className="job-status p-3">
                        <Link to={`/${namespace}/${slug}/insights/-/jobs/${job.id}`}>
                          {jobStatus}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/${namespace}/${slug}/insights/-/jobs/${job.id}`}>
                          {`#${job.id}`}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/${namespace}/${slug}/insights/-/jobs/${job.id}`}>
                          {determineJobClass(jobClass)}
                        </Link>
                      </td>
                      <td className="job-pipeline-number p-3">
                        {`#${job.pipeline.id} by `}
                        <a href={`/${job.user.name}`}>
                          <img className="ml-2" width="20" src={job.user.avatar_url} alt="avatar" />
                        </a>
                      </td>
                      <td className="duration">
                        <p className="p-0 m-0">
                          {job.duration !== null && (
                            <>
                              <img src="https://gitlab.com/mlreef/frontend/uploads/d0bd85ce84f0a8754dbf852871a04a15/clock.png" width="12" alt="" />
                              {timeDuration}
                            </>
                          )}
                        </p>
                        <p className="p-0 m-0">
                          <img src="https://gitlab.com/mlreef/frontend/uploads/24a7b38a430ed0e01c381ba037613d1d/Calender.png" width="12" alt="" />
                          {`${getTimeCreatedAgo(job.created_at, new Date())} ago`}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <>
                <tbody />
              </>
            )}
        </table>
        {jobList.length === 0 && (
          <div className="job-table-empty">
            <img src={greyLogo} width="45" alt="empty" />
            <span>No Jobs to show</span>
          </div>
        )}
      </div>
    </>
  );
};

Jobs.propTypes = {
  namespace: string.isRequired,
  slug: string.isRequired,
  selectedProject: shape({
    gid: number.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
  };
}

export default connect(mapStateToProps)(Jobs);

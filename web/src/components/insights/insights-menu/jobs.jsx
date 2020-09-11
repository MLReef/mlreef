import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { arrayOf, shape, number, string } from 'prop-types';
import moment from 'moment';
import greyLogo from 'images/icon_grey-01.png';
import './jobs.scss';
import * as jobsActions from 'actions/jobsActions';
import DataPipelineApi from 'apis/DataPipelineApi';
import BlackBorderedButton from '../../BlackBorderedButton';
import { getTimeCreatedAgo } from '../../../functions/dataParserHelpers';

const dataPipeApi = new DataPipelineApi();

const Jobs = ({ jobs, selectedProject: { gid, id } }) => {
  const [jobList, setJobs] = useState(jobs);
  const [backendPipes, setBackendPipes] = useState([]);
  useEffect(() => {
    dataPipeApi.getProjectPipelines(id)
      .then((backendPipelines) => setBackendPipes(backendPipelines))
      .then(() => {
        jobsActions.getJobsListPerProject(gid);
      })
      .catch(() => toastr.error('Error', 'Could not retrieve all the jobs'));
  }, [id, gid]);

  const determineJobClass = (type) => {
    let jobClass = 'experiment';
    if (type === 'DATA') jobClass = 'data-ops';
    else if (type === 'VISUALIZATION') jobClass = 'visualization';

    return jobClass;
  };

  const handleButtonsClick = (e) => {
    if (e.target.parentNode) {
      e.target.parentNode.childNodes.forEach((childNode) => {
        if (childNode.id !== e.target.id) {
          childNode.classList.remove('active');
        }
      });
      e.target.classList.add('active');
    }

    let allJobs = jobs;
    if (e.target.id !== 'all') {
      allJobs = jobs.filter((job) => job.status === e.target.id);
    }
    setJobs(allJobs);
  };

  return (
    <>
      <div className="job-container">
        <div>
          <h1 className="job-container-title">Jobs</h1>
        </div>
        <div className="my-3 mx-0">
          <BlackBorderedButton
            id="all"
            onClickHandler={handleButtonsClick}
            textContent="All"
          />
          <BlackBorderedButton
            className="ml-3"
            id="pending"
            onClickHandler={handleButtonsClick}
            textContent="Pending"
          />
          <BlackBorderedButton
            className="ml-3"
            id="running"
            onClickHandler={handleButtonsClick}
            textContent="Running"
          />
          <BlackBorderedButton
            className="ml-3"
            id="success"
            onClickHandler={handleButtonsClick}
            textContent="Success"
          />
          <BlackBorderedButton
            className="ml-3"
            id="failed"
            onClickHandler={handleButtonsClick}
            textContent="Failed"
          />
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
          {jobs.length > 0
            ? (
              <tbody className="job-table-body">
                {jobList.map((job, index) => {
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
                        <Link to={`/my-projects/${gid}/insights/-/jobs/${job.id}`}>
                          {jobStatus}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/my-projects/${gid}/insights/-/jobs/${job.id}`}>
                          {`#${job.id}`}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/my-projects/${gid}/insights/-/jobs/${job.id}`}>
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
  jobs: arrayOf(
    shape({
      id: number.isRequired,
      name: string.isRequired,
      status: string.isRequired,
      duration: number,
      pipeline: {
        id: number.isRequired,
      }.isRequired,
    }).isRequired,
  ).isRequired,
  selectedProject: shape({
    gid: number.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    jobs: state.jobs,
  };
}

export default connect(mapStateToProps)(Jobs);

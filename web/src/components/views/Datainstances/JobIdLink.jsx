import React, { useCallback, useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { suscribeRT } from 'functions/apiCalls';
import { Link } from 'react-router-dom';
import actions from './DataInstanceActions';

const timeout = 30000;

const JobIdLink = ({
  gid,
  gitlabPipelineId,
  namespace,
  slug,
  statusParagraphColor,
  diStatus,
}) => {
  const [lastJob, setLastJob] = useState({});
  const fetchJobInfo = useCallback(() => {
    if (gid && gitlabPipelineId) {
      actions.fetchDatapipelineLastJob(gid, gitlabPipelineId)
        .then(setLastJob)
        .catch((err) => toastr.error('Error', err?.message));
    }
  },
  [gid, gitlabPipelineId]);

  useEffect(() => suscribeRT({ timeout })(fetchJobInfo), [fetchJobInfo]);
  return (
    <div data-testid="job-link">
      {lastJob?.id ? (
        <Link to={`/${namespace}/${slug}/insights/-/jobs/${lastJob?.id}`}>
          <div className="item">
            <p>Status:</p>
            <p style={{ color: `var(--${statusParagraphColor})` }}><b>{diStatus}</b></p>
          </div>
        </Link>
      ) : (
        <div className="item">
          ---
        </div>
      )}
    </div>
  );
};

export default JobIdLink;

import React, { useCallback, useEffect, useState } from 'react';
import { suscribeRT } from 'functions/apiCalls';
import moment from 'moment';
import { number, string } from 'prop-types';

const MTimer = (props) => {
  const { startTime, timeout } = props;
  const startTimeParsed = new Date(startTime);

  const [duration, setDuration] = useState();

  const updateDuration = useCallback(() => {
    setDuration(new Date() - startTimeParsed);
  }, [startTimeParsed]);

  useEffect(() => suscribeRT({ timeout })(updateDuration), [timeout, updateDuration]);

  return (
    <div>
      <p>
        {duration
          ? moment({}).startOf('day').milliseconds(duration).format('HH:mm:ss')
          : '---'}
      </p>
    </div>
  )
};

MTimer.propTypes = {
  startTime: string.isRequired,
  timeout: number,
};

MTimer.defaultProps = {
  timeout: 5000,
};

export default MTimer;

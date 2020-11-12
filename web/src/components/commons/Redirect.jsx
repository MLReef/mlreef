import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

// The main porpuse of this component is to reload the previus page
const Redirect = () => {
  const { action } = useParams();
  const history = useHistory();

  useEffect(
    () => {
      if (action === 'back') history.goBack();
      else history.push(action);
    },
    [history, action],
  );

  return (
    <div />
  );
};

export default Redirect;

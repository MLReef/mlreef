import React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { func, string } from 'prop-types';

const makeStylesBlackBorderedButton = makeStyles(() => ({
  styles: {
    '&:focus': {
      border: '2px solid #32afc3',
      color: '#32afc3',
    },
    border: '2px solid #1c2b40',
    padding: '0.5em 1em 0.5em 1em',
    height: '100%',
  },
}));

const BlackBorderedButton = ({ id, textContent, onClickHandler }) => {
  const classes = makeStylesBlackBorderedButton();
  return (
    <Button
      id={id}
      onClick={onClickHandler}
      className={classes.styles}
    >
      {textContent}
    </Button>
  );
};

BlackBorderedButton.propTypes = {
  id: string.isRequired,
  textContent: string.isRequired,
  onClickHandler: func.isRequired,
};

export default BlackBorderedButton;

import React from 'react';
import {
  string, func, bool,
} from 'prop-types';
import {
  makeStyles,
} from '@material-ui/core/styles';
import {
  Button,
  CircularProgress,
} from '@material-ui/core';

const cuztomizedStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(10),
    minWidth: 120,
    width: '80%',
  },
  loadingDiv: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    color: '#15b785',
    position: 'absolute',
    top: '45%',
    left: '45%',
    marginTop: -12,
    marginLeft: -6,
  },
}));

const useStylesSubmitButton = makeStyles((theme) => ({
  style: {
    height: theme.spacing(5),
    backgroundColor: '#15B785',
    color: 'white',
  },
}));

const CustomizedButton = ({
  id,
  onClickHandler,
  buttonLabel,
  loading,
}) => {
  const classes = useStylesSubmitButton();
  const customizedStyles = cuztomizedStyles();
  return (
    <>
      <Button
        className={classes.style}
        id={id}
        variant="contained"
        disabled={loading}
        onClick={(e) => onClickHandler(e)}
      >
        {buttonLabel}
      </Button>
      {loading && <CircularProgress size={30} className={customizedStyles.buttonProgress} />}
    </>
  );
};

CustomizedButton.propTypes = {
  id: string.isRequired,
  onClickHandler: func.isRequired,
  buttonLabel: string.isRequired,
  loading: bool.isRequired,
};

export default CustomizedButton;

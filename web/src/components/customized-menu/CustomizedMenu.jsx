import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { arrayOf, string, func } from 'prop-types';
import { ListItem, List } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import ListItemText from '@material-ui/core/ListItemText';
import BlueBorderedInput from '../BlueBorderedInput';
import arrowDown from '../../images/arrow_down_blue_01.svg';
import './CustomizedMenu.css';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    {...props}
  />
));

const StyledListItem = withStyles((theme) => ({
  root: {
    height: theme.spacing(6),
  },
}))(ListItem);

function CustomizedMenus({
  placeholder,
  options,
  menuTitle,
  onInputChangeHandler,
  onOptionSelectedHandler,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [inputNewTargetBranchValue, setInputNewTargetBranchValue] = React.useState('');
  const [finalOptions, setFinalOptions] = React.useState(options);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <button
          type="button"
          id="customized-menu"
          className="btn btn-outline-danger px-3"
          aria-controls="customized-menu"
          aria-haspopup="true"
          onClick={handleClick}
          style={{
            border: '1px solid gray',
          }}
        >
          {placeholder}
          <img style={{ marginLeft: '0.5em', width: '1em' }} src={arrowDown} alt="" />
        </button>
      </div>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <List>
          <StyledListItem>
            <ListItemText style={{ fontSize: '1.2em', textAlign: 'center' }}>{menuTitle}</ListItemText>
          </StyledListItem>
          <hr />
          <StyledListItem>
            <BlueBorderedInput
              value={inputNewTargetBranchValue}
              id="customized-menu-input"
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  setFinalOptions(options);
                } else {
                  const filteredOptions = finalOptions.filter((fOpt) => fOpt.includes(inputValue));
                  setFinalOptions(filteredOptions);
                }
                setInputNewTargetBranchValue(e.target.value);
                onInputChangeHandler(e.target.value);
              }}
            />
          </StyledListItem>
          {finalOptions.map((opt) => (
            <StyledListItem
              data-key={opt}
              key={`customized-menu-item-${opt}`}
              onClick={(e) => {
                onInputChangeHandler('');
                onOptionSelectedHandler(e.currentTarget.getAttribute('data-key'));
                handleClose();
              }}
            >
              <ListItemText primary={opt} />
            </StyledListItem>
          ))}
        </List>
      </StyledMenu>
    </div>
  );
}

CustomizedMenus.propTypes = {
  placeholder: string,
  options: arrayOf(string).isRequired,
  menuTitle: string,
  onInputChangeHandler: func,
  onOptionSelectedHandler: func,
};

CustomizedMenus.defaultProps = {
  placeholder: '',
  menuTitle: '',
  onInputChangeHandler: () => {},
  onOptionSelectedHandler: () => {},
};

export default CustomizedMenus;

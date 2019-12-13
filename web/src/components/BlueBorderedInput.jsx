import {
  withStyles,
} from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';

export default withStyles((theme) => ({
  root: {
    'label + &': {
      backgroundColor: 'white',
    },
  },
  input: {
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    padding: '18px 19px',
    '&:focus': {
      borderRadius: 4,
      boxShadow: '0 0 0 0.1rem rgb(50, 175, 195)',
    },
  },
}))(InputBase);

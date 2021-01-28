import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  startTutorial,
  updateCurrent,
  onCompleted,
  displayImage,
  toggleTutorial,
} from 'store/actions/tutorialActions';

import TutorialImported from './Tutorial';
import rules from './rules';

export const Tutorial = TutorialImported;

const props = (state) => ({
  ...state.tutorial,
  rules,
  username: state.user?.username,
  auth: state.user?.auth,
});

const actions = (dispatch) => ({
  actions: {
    startTutorial: bindActionCreators(startTutorial, dispatch),
    updateCurrent: bindActionCreators(updateCurrent, dispatch),
    onCompleted: bindActionCreators(onCompleted, dispatch),
    displayImage: bindActionCreators(displayImage, dispatch),
    close: bindActionCreators(() => toggleTutorial(false), dispatch),
  },
});

export default connect(props, actions)(TutorialImported);

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  startTutorial,
  updateCurrent,
  onCompleted,
  displayImage,
  setActive,
} from 'store/actions/tutorialActions';
import { closeModal } from 'store/actions/actionModalActions';

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
    setActive: bindActionCreators(setActive, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
  },
});

export default connect(props, actions)(TutorialImported);

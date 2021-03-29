import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setGraphs } from 'store/actions/experimentsActions';
import ExperimentTableImp from './ExperimentTable';

export const ExperimentTable = ExperimentTableImp;

const mapStateToProps = (state) => ({
  store: {
    ...state.experiments,
    currentProjectId: state.projects?.selectedProject?.id,
  },
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    setGraphs: bindActionCreators(setGraphs, dispatch),
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentTableImp);

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../../css/genericModal.css';
import './projectDeletionModal.css';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import Input from '../input/input';
import projectGeneralInfoApi from '../../apis/projectGeneralInfoApi';
import * as actions from '../../actions/projectInfoActions';

class ProjectDeletionModal extends React.Component {
  constructor(props) {
    super(props);
    this.inputKeyUp = this.inputKeyUp.bind(this);
    this.state = {
      isEnabledConfirmButton: false,
    };
  }

    inputKeyUp = (e) => this.setState({
      isEnabledConfirmButton: e.target.value === this.props.projectName,
    });

    render = () =>
      (
        <div className={`modal modal-danger dark-cover ${this.props.isShowing ? 'show' : ''}`}>
          <div onClick={() => this.props.hideModal()} className="modal-cover"></div>
          <div className="modal-container">
            <div className="modal-container-close">
              <button
                className="btn btn-hidden fa fa-times"
                onClick={() => this.props.hideModal()}
              />
            </div>
            <div className="modal-header py-2">
              Confirmation required
            </div>
            <div className="modal-content" id="project-deletion-message">
              <p id="warning">
                        You are going to remove {this.props.projectName}.
                        Removed project CANNOT be restored!
                        are you ABSOLUTELY sure?
              </p>
              <p id="confirmation">
                        This action can lead to data loss. To prevent accidental actions we ask you permission to confirm your intention.
                        Please type
                {' '}
                <b>{this.props.projectName}</b>
                {' '}
                        to proceed or close this modal.
              </p>
              <br />
              <Input id="project-input" callback={this.inputKeyUp} />
            </div>
            <div className="modal-actions p-3" id="button-container">
                  <button
                    className="btn btn-danger ml-auto"
                    disabled={!this.state.isEnabledConfirmButton}
                    onClick={() => {
                      projectGeneralInfoApi
                        .removeProject(this.props.owner)
                        .then((res) => {
                          if (res.ok) {
                            this.props.actions
                              .updateProjectsList(
                                this.props.projectsList.filter(
                                  (project) => project.id !== this.props.owner,
                                ),
                              );
                            toastr.success('Success', `Project ${this.props.projectName} has been deleted successfully`);
                          } else {
                            toastr.error('Error', `Project ${this.props.projectName} could not be deleted`);
                          }
                          this.props.hideModal();
                        });
                    }}
                  >
                    Confirm
                  </button>
            </div>
          </div>
        </div>
      )
}

ProjectDeletionModal.propTypes = {
  isShowing: PropTypes.bool.isRequired,
  projectsList: PropTypes.array.isRequired,
  projectName: PropTypes.string.isRequired,
  hideModal: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(() => ({ }), mapDispatchToProps)(ProjectDeletionModal);

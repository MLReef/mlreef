import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../../css/globalStyles.css';
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

    render = () => (this.props.isShowing
      ? (
        <div className="generic-modal">
          <div
            className="modal-content"
            style={{
              height: '25%',
              width: '25%',
              minHeight: '280px',
              minWidth: '420px',
              left: '35%',
              top: '10%',
            }}
          >
            <div className="title-div">
              <p>
                <b>Confirmation required</b>
              </p>
              <button onClick={() => this.props.hideModal()} style={{ color: 'white' }}>
                <b>
                        X
                </b>
              </button>
            </div>
            <div id="project-deletion-message">
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
            <div id="button-container">
              {this.state.isEnabledConfirmButton
                ? (
                  <button
                    style={{ cursor: 'pointer' }}
                    className="dangerous-red"
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
                )
                : (
                  <button
                    disabled
                  >
                            Confirm
                  </button>
                )}
            </div>
          </div>
        </div>
      )
      : null)
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

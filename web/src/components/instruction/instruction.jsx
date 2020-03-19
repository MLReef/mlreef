import React, { useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateUserClosedInstructions } from '../../actions/userActions';
import advice01 from '../../images/advice-01.png';
import './instruction.css';

const Instruction = ({
  id, titleText, paragraph, closedInstructions, actions,
}) => {
  const isShown = useMemo(() => !closedInstructions[id] || false, [id, closedInstructions]);

  const handleClose = () => {
    actions.updateUserClosedInstructions({ [id]: true });
  };

  return (
    isShown
      ? (
        <div id="instruction-pipe-line">
          <div id="icon">
            <img src={advice01} alt="" />
          </div>
          <div id="instruction">
            <p id="title">
              {' '}
              <b>{titleText}</b>
            </p>
            <p>
              {paragraph}
            </p>
          </div>
          <div id="xButton">
            <button
              type="button"
              className="btn btn-hidden fa fa-times pl-2 pt-1"
              onClick={handleClose}
            />
          </div>
        </div>
      )
      : null
  );
};

const mapStateToProps = (state) => ({
  closedInstructions: state.user.meta.closedInstructions,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ updateUserClosedInstructions }, dispatch),
});

Instruction.propTypes = {
  id: PropTypes.string.isRequired,
  titleText: PropTypes.string.isRequired,
  paragraph: PropTypes.string.isRequired,
  closedInstructions: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({
    updateUserClosedInstructions: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Instruction);

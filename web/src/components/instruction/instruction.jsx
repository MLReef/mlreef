import React, { useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { func, node, shape, string } from 'prop-types';
import { updateUserClosedInstructions } from 'store/actions/userActions';
import advice01 from '../../images/advice-01.png';
import './instruction.css';

const Instruction = ({
  id, titleText, paragraph, htmlParagraph, closedInstructions, actions,
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
            {htmlParagraph || (
            <p>
              {paragraph}
            </p>
            )}
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
  id: string.isRequired,
  titleText: string.isRequired,
  paragraph: string,
  closedInstructions: shape({}).isRequired,
  actions: shape({
    updateUserClosedInstructions: func.isRequired,
  }).isRequired,
  htmlParagraph: node,
};

Instruction.defaultProps = {
  paragraph: '',
  htmlParagraph: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(Instruction);

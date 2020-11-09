import React, { useMemo } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './MActionModal.scss';
import { closeModal as closeModalAction } from 'actions/actionModalActions';

const MActionModal = (props) => {
  const {
    title,
    type,
    subtitle,
    content,
    positiveLabel,
    onPositive,
    negativeLabel,
    onNegative,
    ignoreLabel,
    dark,
    small,
    isShown,
    closable,
    noActions,
    actions,
  } = props;

  const classes = useMemo(() => ({
    main: `m-action-modal modal modal-${type} ${isShown ? 'show' : ''} ${dark ? 'dark-cover' : ''} ${small ? 'modal-sm' : ''}`,
    header: 'modal-header',
    btnPositive: `positive btn btn-${type}`,
    btnNegative: `negative btn btn-outline-${type}`,
    btnIgnore: 'ignore btn  btn-basic-dark',
  }), [isShown, dark, type, small]);

  const closeModal = () => actions.closeModal();

  const handleCoverClick = (e) => {
    e.stopPropagation();
    return closable && closeModal();
  };

  const handleClose = () => {
    closeModal();
  };

  const handlePositive = (val) => {
    closeModal();
    return onPositive(val);
  };

  const handleNegative = (val) => {
    closeModal();
    return onNegative && onNegative(val);
  };

  return (
    <div className={classes.main}>
      <div onClick={handleCoverClick} className="modal-cover"/>
      <div className="m-action-modal_container modal-container">
        {closable && (
          <div className="modal-container-close">
            <button
              type="button"
              className="btn btn-hidden fa fa-times"
              onClick={handleClose}
              label="close modal"
              aria-label="close modal"
            />
          </div>
        )}
        <div className={classes.header}>
          <div className="title">
            <b>{title}</b>
          </div>
          <div className="subtitle">{subtitle}</div>
        </div>
        <div className="modal-content">
          {content}
        </div>
        {!noActions && (
          <div className="modal-actions px-3">
            {ignoreLabel && (
              <button
                type="button"
                onClick={handleClose}
                className={classes.btnIgnore}
              >
                {ignoreLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleNegative}
              className={classes.btnNegative}
            >
              {negativeLabel}
            </button>
            <button
              type="button"
              onClick={handlePositive}
              className={classes.btnPositive}
            >
              {positiveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

MActionModal.defaultProps = {
  subtitle: '',
  content: '',
  positiveLabel: 'Accept',
  onPositive: () => {},
  negativeLabel: 'Cancel',
  onNegative: null,
  type: 'default',
  ignoreLabel: '',
  dark: true,
  small: false,
  isShown: false,
  closable: true,
  noActions: false,
};

MActionModal.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
  subtitle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  positiveLabel: PropTypes.string,
  onPositive: PropTypes.func,
  negativeLabel: PropTypes.string,
  onNegative: PropTypes.func,
  ignoreLabel: PropTypes.string,
  dark: PropTypes.bool,
  small: PropTypes.bool,
  isShown: PropTypes.bool,
  closable: PropTypes.bool,
  noActions: PropTypes.bool,
  actions: PropTypes.shape({
    closeModal: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = ({ actionModal }) => actionModal;

const mapActionsToProps = (dispatch) => ({
  actions: {
    closeModal: bindActionCreators(closeModalAction, dispatch),
  },
});

export default connect(mapStateToProps, mapActionsToProps)(MActionModal);

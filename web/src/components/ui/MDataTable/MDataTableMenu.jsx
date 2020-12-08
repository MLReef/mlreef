import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';

const MDataTableMenu = (props) => {
  const {
    className,
    onClose,
    decimals,
    setDecimals,
  } = props;

  return (
    <div className={cx('m-data-table-menu', className)}>
      <div className="p-2 mr-3 d-flex">
        <button
          type="button"
          label="close"
          className="btn btn-icon btn-hidden fa fa-times mr-0"
          onClick={onClose}
        />
      </div>

      <div className="m-data-table-menu-field p-3">
        <MCheckBox
          small
          className="mr-3"
          name="decimals"
          value={!!decimals}
          callback={(_, __, v) => setDecimals(v ? 4 : '')}
        />
        <label className="m-data-table-menu-field-label" htmlFor="table-decimals">
          decimals
        </label>
        <input
          id="table-decimals"
          type="number"
          min="0"
          max="12"
          disabled={decimals === ''}
          value={decimals}
          onChange={(e) => setDecimals(parseInt(e.target.value, 10))}
          className="m-data-table-menu-field-input"
        />
      </div>
    </div>
  );
};

MDataTableMenu.defaultProps = {
  className: '',
  decimals: '',
};

MDataTableMenu.propTypes = {
  className: PropTypes.string,
  decimals: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  setDecimals: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MDataTableMenu;

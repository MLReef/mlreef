import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useDropdown from 'customHooks/useDropdown';

export default () => {
  const [dropDownRef, toggleShow, isDropdownOpen] = useDropdown();
  return useMemo(() => (
    <div className="dashboard-v2-content-search-bar-dropdown">
      <button
        ref={dropDownRef}
        type="button"
        className="new-project btn-primary"
        onClick={toggleShow}
      >
        New Module
        {' '}
        <i className={`fa fa-chevron-${isDropdownOpen ? 'up' : 'down'} my-auto`} />
      </button>
      {isDropdownOpen && (
        <div className="dashboard-v2-content-search-bar-dropdown-content mt-1" style={{ top: `${dropDownRef.current.offsetTop + 42}px` }}>
          <hr className="m-0" />
          <Link to="/new-project/classification/model">
            <h5 className="t-warning m-0 mb-1">New algorithm</h5>
            <span>Algorithms module can be used in experiment pipelines</span>
          </Link>
          <hr className="m-0" />
          <Link to="/new-project/classification/data-operation">
            <h5 className="t-danger m-0 mb-1">New data operation</h5>
            <span>Data operations are pre-processing modules for DataOps pipelines</span>
          </Link>
          <hr className="m-0" />
          <Link to="/new-project/classification/data-visualization">
            <h5 style={{ color: 'rgb(115, 93, 168)' }} className="m-0 mb-1">New visualization</h5>
            <span>Create modules for visualizing data</span>
          </Link>
        </div>
      )}
    </div>
  ), [dropDownRef, toggleShow, isDropdownOpen]);
};

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
        New Project
        {' '}
        <i className={`fa fa-chevron-${isDropdownOpen ? 'up' : 'down'} p-1 my-auto`} />
      </button>
      {isDropdownOpen && (
        <div className="dashboard-v2-content-search-bar-dropdown-content mt-1" style={{ top: `${dropDownRef.current.offsetTop + 42}px` }}>
          <Link to="/new-project/classification/ml-project">
            <h5 className="t-primary m-0 mb-1">New ML project</h5>
            <span>Create a ML project</span>
          </Link>
          <hr className="m-0" />
          <Link to="/new-project/classification/model">
            <h5 className="t-warning m-0 mb-1">New Model</h5>
            <span>Create a model</span>
          </Link>
          <hr className="m-0" />
          <Link to="/new-project/classification/data-operation">
            <h5 className="t-danger m-0 mb-1">New Data operation</h5>
            <span>Create a data operation</span>
          </Link>
          <hr className="m-0" />
          <Link to="/new-project/classification/data-visualization">
            <h5 style={{ color: 'rgb(115, 93, 168)' }} className="m-0 mb-1">New Data visualization</h5>
            <span>Create a data visualization</span>
          </Link>
        </div>
      )}
    </div>
  ), [dropDownRef, toggleShow, isDropdownOpen]);
};

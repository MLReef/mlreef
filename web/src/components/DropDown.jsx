import React from "react";
import arrowDownWhite01 from '../images/arrow_down_white_01.svg';

export default function Dropdown() {
  const [state, setState] = React.useState(false);
  const node = React.useRef();

  const handleClickOutside = (e) => {
    if (node.current.contains(e.target)) {
      return;
    }
    setState(false);
  };

  React.useEffect(() => {
    if (state) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setState(!state)}
        ref={node}
        className="light-green-button rounded-pipeline-btn non-active-black-border"
      >
        <span>
          <b style={{ margin: '0 10px 10px 0' }}>
            Save
          </b>
        </span>
        <img className="dropdown-white" src={arrowDownWhite01} alt="" />
      </button>
      {state
        && (
        <div className="save-instance">
          <div
            style={{ marginLeft: '25%', fontSize: '14px' }}
          >
            <p>Save Data Instances</p>
          </div>
          <hr />
          <div className="search-branch">
            <div>
              <p><b>New branch</b></p>
              <p className="dull">Only new data is saved in new branch</p>
            </div>
            <div>
              <p><b>Create Pull Request</b></p>
              <p className="dull">New data and original data coexist in existing branch</p>
            </div>
          </div>
        </div>
        )}
    </>
  );
}
import React from 'react';
import PropTypes from 'prop-types';
import './MCloneDropdown.scss';

const MCloneDropdown = (props) => {
  const {
    className,
    http,
  } = props;

  const node = React.useRef();
  const httpRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);

  const handleCopyHttp = () => {
    if (httpRef.current) {
      httpRef.current.select();
      document.execCommand('copy');
    }
    setOpen(false);
  };

  const handleClickInput = (e) => {
    e.target.select();
  };

  return (
    // eslint-disable-next-line
    <div
      id="t-clonedropdown-toggle"
      className={`${className} counter clone-dropdown`}
      ref={node}
      onClick={() => setOpen(!open)}
      style={{ cursor: 'pointer' }}
    >
      <span
        role="button"
        label="toggle"
        aria-label="toggle"
        className={`fa fa-chevron-${open ? 'up' : 'down'}`}
      />
      {open && (
        <div className="clone-box mt-1">
          {/* <div className="link-box">
            <p>Clone with SSH</p>
            <div className="clone-link">
              <input
                ref={sshRef}
                onClick={handleClickInput}
                type="text"
                value={ssh}
                className="ssh-http-link"
                readOnly
              />
              <img
                onClick={handleCopySsh}
                className="clone-icon ssh"
                src="/images/svg/clone_01.svg"
                alt="copy-icon" />
            </div>
          </div> */}
          <div className="link-box">
            <p>Clone with HTTPS</p>
            <div className="clone-link">
              <input
                ref={httpRef}
                onClick={handleClickInput}
                type="text"
                value={http}
                className="ssh-http-link"
                readOnly
              />
              {/* eslint-disable-next-line */}
              <img
                onClick={handleCopyHttp}
                className="clone-icon http"
                src="/images/svg/clone_01.svg"
                alt="copy-icon"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MCloneDropdown.defaultProps = {
  className: '',
};

MCloneDropdown.propTypes = {
  http: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default MCloneDropdown;

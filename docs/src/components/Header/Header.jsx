import React from 'react'
import {Link} from 'gatsby';
import './Header.scss';

const prefix = process.env.GATSBY_PATH_PREFIX;
const logoPath = (prefix || '') + '/logos/MLReef_Logo_POS_H-01.png';

const Header = ({ toggleSidebar }) => (
  <header className="header py-2 px-4">
    <div className="header-section left ml-0">
      <Link to="/">
        <img className="header-brand m-auto" src={logoPath} alt="mlreef logo" />
      </Link>
    </div>
    <div className="header-section center">
      {/* todo */}
    </div>
    <div className="header-section right d-lg-none flex-0 mr-0">
      <button
        type="button"
        label="menu"
        onClick={toggleSidebar}
        className="btn btn-icon btn-basic-dark fa fa-bars"
      />
    </div>
  </header>
);

Header.defaultProps = {
  toggleSidebar: () => {},
};

export default Header;

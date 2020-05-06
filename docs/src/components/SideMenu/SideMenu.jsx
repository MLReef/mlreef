import React from 'react'
// import { useStaticQuery, Link, graphql } from "gatsby"
import SideMenuItem from './SideMenuItem';
import { useCreateMenuIndex } from './useCreateMenuIndex';
import './SideMenu.scss';

const SideMenu = props => {
  const { className } = props;

  const data = useCreateMenuIndex();
  return (
    <aside className={`side-menu ${className}`}>
      <nav className="side-menu-container">
        {
          (data.items).map(item => <SideMenuItem key={`${item.label}`} content={item} />)
        }
      </nav>
    </aside>
  );
};

SideMenu.defaultProps = {
  className: '',
};

export default SideMenu;

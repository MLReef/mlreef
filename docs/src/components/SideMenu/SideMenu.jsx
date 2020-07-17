import React, {useState} from 'react'
// import { useStaticQuery, Link, graphql } from "gatsby"
import SideMenuItem from './SideMenuItem';
import { useCreateMenuIndex } from './useCreateMenuIndex';
import './SideMenu.scss';

const SideMenu = props => {
  const { className } = props;

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  }

  const data = useCreateMenuIndex();
  return (
    <aside className={`side-menu ${className}`}>
      <nav className={`side-menu-container ${collapsed ? 'hidden' : ''}`}>
        {
          (data.items).map(item => <SideMenuItem key={`${item.label}`} content={item} />)
        }
      </nav>
      {collapsed ? (
        <button type="button" className="btn mt-auto py-3 px-4" onClick={toggleCollapse}>
          <span className="fa fa-chevron-right" />
        </button>
      ) : (
        <button type="button" onClick={toggleCollapse} className="btn py-3">
          <span className="fa fa-chevron-left mr-2" />
          Collapse
        </button>
      )}
    </aside>
  );
};

SideMenu.defaultProps = {
  className: '',
};

export default SideMenu;

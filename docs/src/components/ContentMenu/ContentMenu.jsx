import React from 'react'
import SideMenuItem from './ContentMenuItem';
import './ContentMenu.scss';

const ContentMenu = props => {
  const { headings, className } = props;

  return (
    <aside className={`content-menu ${className}`}>
      <nav className="content-menu-container">
        <h3 className="px-3">
          On this Page
        </h3>
        <hr />
        {
          headings.map(header => <SideMenuItem key={`${header.value}`} header={header} />)
        }
      </nav>
    </aside>
  );
};

ContentMenu.defaultProps = {
  className: '',
};

export default ContentMenu;

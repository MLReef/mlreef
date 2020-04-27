import React, {useState} from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import './Layout.scss';
import SideMenu from '../SideMenu';
import ContentMenu from '../ContentMenu';
import Sidebar from 'react-sidebar';

const Layout = props => {
  const { children, headings } = props;

  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return (
    <Sidebar
      dragToggleDistance={30}
      open={open}
      onSetOpen={toggleOpen}
      sidebar={<SideMenu />}
      styles={{ sidebar: { background: "#FFF" } }}
    >
      <div className="layout-container">
        <Header toggleSidebar={toggleOpen} />
          <div className="main-content-container d-flex flex-1">
            <SideMenu className="d-none d-lg-flex" />
            <main className="main-content flex-1 p-3">
              {children}
            </main>
            <ContentMenu headings={headings} className="d-none d-lg-flex" />
          </div>
        <Footer config={{
          copyright: '© 2020 by MLreef GmbH.',
        }}
        />
      </div>
    </Sidebar>
  );
};

Layout.defaultProps = {
  headings: []
};

export default Layout;

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';
import Sidebar from 'react-sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import './Layout.scss';
import SideMenu from '../SideMenu';
import ContentMenu from '../ContentMenu';

const parseMeta = (prop, sufix) => `${prop ? `${prop} | ` : ''}${sufix}`;

const Layout = props => {
  const {
    children,
    headings,
    seo,
  } = props;

  const { site: { siteMetadata: site } } = useStaticQuery(
    graphql`
      query FetchSiteMetadata {
        site {
          siteMetadata {
            title
            siteUrl
            description
            keywords
            logo
          }
        }
      }
    `,
  );

  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  const title = useMemo(() => parseMeta(seo?.title, site.title), [seo, site]);
  const description = useMemo(() => seo?.description || site.description, [seo, site]);
  const url = useMemo(() => `${site.siteUrl}/${seo?.path || ''}`, [seo, site]);

  return (
    <Sidebar
      dragToggleDistance={30}
      open={open}
      onSetOpen={toggleOpen}
      sidebar={<SideMenu />}
      styles={{ sidebar: { background: "#FFF" } }}
    >
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="image" content={`${site.siteUrl}/${site.logo}`} />
        <meta name="keywords" content={site.keywords} />
        <link rel="canonical" href={url} />
      </Helmet>
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

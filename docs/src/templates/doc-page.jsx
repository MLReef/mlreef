import React from 'react';
import Layout from '../components/Layout';

const DocPage = props => {
  const { pageContext: { node } } = props;
  const { childMarkdownRemark: { html, headings } } = node;

  return (
    <Layout headings={headings}>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </Layout>
  );
}

export default DocPage;

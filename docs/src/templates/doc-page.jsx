import React, { useMemo } from 'react';
import Layout from '../components/Layout';

const DocPage = props => {
  const { pageContext: { node } } = props;
  const {
    childMarkdownRemark: { html, headings, excerpt },
    relativePath,
  } = node;

  const seo = useMemo(
    () => ({
      title: headings[0]?.value,
      description: excerpt,
      path: relativePath,
    }),
    [headings, excerpt, relativePath],
  );

  return (
    <Layout headings={headings} seo={seo}>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </Layout>
  );
}

export default DocPage;

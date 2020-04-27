import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';

const HomePage = props => {
  const {
    data: {
      markdownRemark: { html, headings }
    }
  } = props;

  return (
    <Layout headings={headings}>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </Layout>
  );
}


export const query = graphql`
  query MainReadme {
    markdownRemark(
    headings:{
      elemMatch:{
        depth: {
          eq:1
        }
        value: {
          eq: "MLReef Docs"
        }
      }
    }
  ) {
      html
      headings {
        depth
        value
      }
    }
  }
`;

export default HomePage;

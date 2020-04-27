const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query fetchDocs {
      allFile(filter: {extension: {eq: "md"}}, sort: {fields: relativePath, order: ASC}) {
        nodes {
          relativeDirectory
          relativePath
          name
          childMarkdownRemark {
            html
            headings {
              depth
              value
            }
          }
        }
      }
    }
  `);

  result.data.allFile.nodes.forEach(node => {
    createPage({
      path: node.relativePath,
      component: path.resolve(`./src/templates/doc-page.jsx`),
      context: {
        node
      }
    });
  });
};

/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

const pathPrefix = process.env.GATSBY_PATH_PREFIX;

module.exports = {
  /* Your site config here */
  pathPrefix,

  plugins: [
    'gatsby-plugin-sass',
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "doc",
        path: `${__dirname}/content/`
      }
    },
    'gatsby-transformer-remark',
  ]
}

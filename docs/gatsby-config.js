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
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              // destinationDir: `path/to/dir`,
              ignoreFileExtensions: ['md'],
            },
          },
        ],
      },
      // options: {
      //   plugins: [
      //     {
      //       resolve: "gatsby-remark-images",
      //       options: {
      //         maxWidth: 690
      //       }
      //     },
      //     // {
      //     //   resolve: "gatsby-remark-responsive-iframe"
      //     // },
      //     // "gatsby-remark-copy-linked-files",
      //     // "gatsby-remark-autolink-headers",
      //     // "gatsby-remark-prismjs"
      //   ]
      // }
    },
  ]
}

/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

const pathPrefix = process.env.GATSBY_PATH_PREFIX;

module.exports = {
  /* Your site config here */
  pathPrefix,

  siteMetadata: {
    title: 'MLReef Docs',
    siteUrl: 'https://docs.mlreef.com',
    description: 'Documentation for MLReef platform.',
    keywords: 'machine learning, data operations, deep learning, MLOps, artificial intelligence, machine learning pipeline, git, git lfs, classification, clustering, neural networks, computer vision, supervised learning, applied AI',
    logo: '/logos/MLReef_Logo_POS_H-01.png',
    email: 'hello@mlreef.com',
    mlreefUrl: 'https://mlreef.com',
  },

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
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sitemap',
  ]
}

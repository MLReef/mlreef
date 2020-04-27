// import React from 'react'
import { useStaticQuery, graphql } from "gatsby"

/**
 * Get the h1 text from a graphql node.
 *
 * @param {GraphqlNode} node a node with a MarkdownRemark object.
 * @return {String} h1 or node name.
 */
const getLabel = node => {
  const headings = node.childMarkdownRemark && node.childMarkdownRemark.headings;

  return (headings && headings.length)
    ? headings[0].value
    : node.name;
}

/**
 * Reducer for makeTree.
 */
const reduceFile = (acc = {}, {node, dirs}) => {
  const [cur, ...rest] = dirs;
  if (cur) {
    return {
      ...acc,
      [cur]: reduceFile(acc[cur], {node, dirs: rest})
    }
  } else {
    return {
      ...acc,
      _files: [...(acc.files || []), {_name: getLabel(node), _href: node.relativePath}]
    }
  }
};

/**
 * Receive an array of nodes and return a tree.
 *
 * @param {Array[GatsbyNode]} nodes
 *
 * @return {Object}
 *
 * @example return:
 * {
 *   _files: [_name, _href],
 *   one_dir: {_files: [], nested_dir: {}}
 * }
 */
const makeTree = nodes => nodes
  .map(node => {
    const { relativeDirectory } = node;
    const dirs = relativeDirectory.split('/');

    return { node, dirs };
  })
  .reduce(reduceFile, {});

/**
 * Map the tree to the format needed by the component.
 *
 * @param {Object} tree
 */
const mapMenuItem = tree => {
  if (!tree) return null;

  return Object.entries(tree).reduce((acc, [k, v]) => {
    if (k === '_files') {
      v.forEach(file => {
        if (file._name === 'README') {
          acc.label = file._name;
          acc.href = file._href;

        } else {
          acc.items = [...(acc.items || []), {
            label: file._name,
            href: file._href
          }]
        }
      })

    } else {
      acc.items = [...(acc.items || []), {
        label: k,
        ...mapMenuItem(v)
      }]
    }

    return acc;
  }, {})
}

export const useCreateMenuIndex = () => {
  const data = useStaticQuery(
    graphql`
      query fetchDocs {
        allFile(
          filter: {extension: {eq: "md"}},
          sort: {fields: relativePath, order: ASC}
        ) {
          nodes {
            relativeDirectory
            relativePath
            name
            childMarkdownRemark {
              headings(depth: h1) {
                value
              }
            }
          }
        }
      }
      `
  );
  const { allFile: { nodes } } = data;
  // console.log(nodes);
  const tree = makeTree(nodes);
  // console.log(tree);
  return mapMenuItem(tree);
};

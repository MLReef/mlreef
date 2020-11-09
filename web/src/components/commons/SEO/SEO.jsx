import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { EXTERNAL_URL } from 'apiConfig.js';

const normalizeURL = (url) => /^http/.test(url) ? url : EXTERNAL_URL + url;

const SEO = (props) => {
  const {
    title,
    description,
    image: rawImageUrl,
    keywords,
    path,
    type,
  } = props;

  const url = `${EXTERNAL_URL}${path}`;
  const image = normalizeURL(rawImageUrl);

  return (
    <Helmet>
      {/* General tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="image" content={image} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* OpenGraph tags */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary" />
      <meta property="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

SEO.defaultProps = {
  title: 'MLReef',
  description: 'MLReef is an open source MLOps platform that provides hosting to Machine Learning projects via an efficient, collaborative and scalable development environment.',
  image: '',
  keywords: 'ML MLOps',
  path: EXTERNAL_URL,
  type: 'website',
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  keywords: PropTypes.string,
  path: PropTypes.string,
  type: PropTypes.string,
};

export default SEO;

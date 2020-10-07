const fs = require('fs');
const path = require('path');
const routesMod = require('./routes');

const OUTPUT = path.join(__dirname, '/../public/sitemap.xml');

const createXmlRoute = (route) => `
  <url>
    <loc>${route.name || route}/</loc>
    <changefreq>${route.changefreq || 'daily'}</changefreq>
    <priority>${route.priority || '0.7'}</priority>
  </url>
`;

const parseRoutes = (routes) => routes.map(createXmlRoute);

const generateContent = (xmlRoutes) => {
  // eslint-disable-next-line
  console.log(`Generating for ${xmlRoutes.length} routes...\n`);
  const routesTxt = xmlRoutes.join('');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    ${routesTxt}\n</urlset>  `
  );
};

const writeSitemapFile = (content) => {
  // eslint-disable-next-line
  console.log(`Saving as ${OUTPUT}...\n`);
  return fs.writeFileSync(OUTPUT, content);
};

// eslint-disable-next-line
console.group('Creating sitemap:\n');

routesMod.fetchAllSiteRoutes()
  .then(parseRoutes)
  .then(generateContent)
  .then(writeSitemapFile)
  .then(() => {
    // eslint-disable-next-line
    console.log('Done.\n');
  })
  .finally(() => {
    // eslint-disable-next-line
    console.groupEnd();
  });

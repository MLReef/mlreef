// this is a dummy menu
export default [
  {
    label: 'GitLab Docs',
    href: '/ee/README.html'
  },
  {
    label: 'Install',
    href: '/ee/install/README.html',
    items: [
      {
        label: 'Requirements',
        href: '/ee/install/requirements.html',
        items: [
          {
            label: 'Third level',
            href: '/ee/README.html'
          }
        ]
      },
      {
        label: 'Omnibus packages',
        href: 'https://about.gitlab.com/install/'
      }
    ]
  }
];

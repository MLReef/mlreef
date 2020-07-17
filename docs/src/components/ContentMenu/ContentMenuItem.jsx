import React, { useMemo } from 'react'

const ContentMenuItem = props => {
  const {
    header: { depth, value },
  } = props;

  const label = useMemo(() => value.replace(/^<a.*<\/a> ?(.*)$/, '$1'), [value]);

  const href = useMemo(
    () => {
      return /^<a/.test(value) ? value.replace(/^<a.*name="(.*)".*$/, '#$1') : null;
    },
    [value]
  );

  return (
    <div className="content-menu-item">
      <span
        className="content-menu-item-label"
        style={{
          paddingLeft: `${1.5 * depth - 1}rem`,
        }}
      >
        {href ? (
          <a className="nav-link flex-1" href={href}>
            <span
              style={{ textDecoration: 'underline' }}
              className="mr-2">
              {`> ${label}`}
            </span>
          </a>
        ) : (
          <span className="mr-2">{`> ${label}`}</span>
        )}
      </span>
    </div>
  );
};

ContentMenuItem.defaultProps = {

};

export default ContentMenuItem;

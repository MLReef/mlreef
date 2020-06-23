// prototype.
// The idea is to have tabs reacting to url (hash part) changes.
// it works well in the first level next ones left some garbage in the url.

import React, { useState, useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import MSimpleTabs from './MSimpleTabs';

const MSimpleTabsRouted = (props) => {
  const {
    depth,
  } = props;

  const [selectionOverride, setSelectionOverride] = useState('');
  const location = useLocation();
  const history = useHistory();

  useEffect(
    () => {
      const items = location.hash.replace(/^#/, '').split('/');
      if (items.length > 0) {
        setSelectionOverride(decodeURIComponent(items[depth]));
      }
    },
    [location.hash],
  );

  const handleSelect = (label) => {
    const items = location.hash.replace(/^#/, '').split('/');
    items[depth] = label;
    history.push(`#${items.join('/')}`);
  };

  return (
    <MSimpleTabs
      {...props}
      selectionOverride={selectionOverride}
      onSelect={handleSelect}
    />
  );
};

MSimpleTabsRouted.defaultProps = {
  depth: 0,
};

MSimpleTabsRouted.propTypes = {
  depth: PropTypes.number,
};

export default MSimpleTabsRouted;

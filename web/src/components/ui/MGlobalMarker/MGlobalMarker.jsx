import React from 'react';
import './MGlobalMarker.scss';
import { string, bool } from 'prop-types';

const LOADING = false;

const MGlobalMarker = ({ isLoading, globalColorMarker }) => (
  <div data-testid="global-marker" className="global-marker">
    <div
      className="global-marker-bar"
      style={{
        animationIterationCount: isLoading ? 'infinite' : 'unset',
        animationDuration: isLoading ? '1s' : '0s',
        backgroundColor: globalColorMarker,
      }}
    />
  </div>
);

MGlobalMarker.propTypes = {
  isLoading: bool,
  globalColorMarker: string.isRequired,
};

MGlobalMarker.defaultProps = {
  isLoading: LOADING,
};

export default MGlobalMarker;

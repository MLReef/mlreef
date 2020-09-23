import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import sortGrid from './sortGrid';
import './MBricksWall.scss';

const MBricksWall = (props) => {
  const {
    bricks,
    animated,
    className,
  } = props;

  const containerRef = useRef();

  const sortBricks = useCallback(
    () => {
      const container = containerRef.current;
      const rects = container?.getClientRects();

      // sometimes no rects... OGK
      if (!(rects && rects[0])) return;

      const { width } = rects[0];
      const info = {};
      const replaceBrick = sortGrid(width, info);

      Array.from(container.children).forEach(replaceBrick);
      container.style.height = `${info.maxHeight}px`;
    },
    // eslint-disable-next-line
    [bricks.length], // bricks.length is required implicitly.
  );

  const resizeObs = useMemo(
    () => new ResizeObserver(sortBricks),
    [sortBricks],
  );

  useEffect(
    () => {
      resizeObs.observe(containerRef.current);
    },
    [bricks, resizeObs],
  );

  return (
    <div ref={containerRef} className={cx('m-bricks-wall', className)}>
      {bricks.map((brick, index) => (
        // eslint-disable-next-line
        <div className={cx('m-bricks-wall-brick', { animated })} key={brick.key || index}>
          {brick}
        </div>
      ))}
    </div>
  );
};

MBricksWall.defaultProps = {
  bricks: [],
  animated: false,
  className: '',
};

MBricksWall.propTypes = {
  bricks: PropTypes.arrayOf(PropTypes.node),
  animated: PropTypes.bool,
  className: PropTypes.string,
};

export default MBricksWall;

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
      const { width } = container.getClientRects()[0];
      const info = {};
      const replaceBrick = sortGrid(width, info);

      Array.from(container.children).forEach(replaceBrick);
      container.style.height = `${info.maxHeight}px`;
    },
    [],
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
        <div className={cx('m-bricks-wall-brick', { animated })} key={index}>
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

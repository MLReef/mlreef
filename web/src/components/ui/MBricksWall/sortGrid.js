/**
 * Reorganize squared elements.
 *
 * Calculates new top and left for each brick and sets them as inline attrs.
 *
 * @param {Number[integer]} maxWidth the container's width.
 * @param {Object} info a reference to record maxHeight.
 * @param {HTMLElement} brick card's container what will be replaced.
 */
export default (maxWidth, info = {}) => {
  // contains cells { x, y, top, left, width, height }
  const grid = [];
  let x = 0;
  let y = 0;

  return (brick) => {
    const { width, height } = brick.getClientRects()[0];
    const prevCell = grid[y] && grid[y][x];

    if (prevCell) {
      const nextLeft = prevCell.left + prevCell.width;
      // console.log(brick, nextX, maxWidth);
      if (nextLeft + width < maxWidth) {
        // set next cell
        x = 1 + x;
        const upperCell = grid[y - 1]
          ? grid[y - 1][x]
          : { top: 0, height: 0 };

        grid[y].push({
          left: nextLeft,
          top: upperCell.top + upperCell.height,
          x,
          y,
          width,
          height,
        });
      } else {
        // set new row
        x = 0;
        y = 1 + y;
        const upperCell = grid[y - 1][x];

        grid.push([{
          left: 0,
          top: upperCell.top + upperCell.height,
          x,
          y,
          width,
          height,
        }]);
      }
    } else {
      // set the very first cell
      grid.push([{
        left: 0,
        top: 0,
        x,
        y,
        width,
        height,
      }]);
    }

    const cell = grid[y][x];
    const rightColumn = grid[y][grid[y].length - 1];

    // eslint-disable-next-line
    brick.style.top = `${cell.top}px`;
    // eslint-disable-next-line
    brick.style.left = `${cell.left}px`;
    // eslint-disable-next-line
    info.maxHeight = Math.max(info.maxHeight || 0, cell.top + height);
    // eslint-disable-next-line
    info.width = Math.max(info.width || 0, rightColumn.left + width);
  };
};

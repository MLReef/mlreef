import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const TutorialList = (props) => {
  const {
    tutorials,
    onSelect,
  } = props;

  const allowedTutorials = useMemo(
    () => tutorials.filter((t) => t.visibility !== 'hidden'),
    [tutorials],
  );

  return (
    <div className="tutorial-dialog">
      {allowedTutorials.map((tutorial) => (
        <section key={`tutorial-list${tutorial.id}`} className="tutorial-dialog-card border-rounded">
          {tutorial.image && (
            <div
              className="tutorial-dialog-card-image border-rounded tutorial-list"
              style={{ backgroundImage: `url(${tutorial.image})` }}
            />
          )}
          <div className="tutorial-dialog-card-content">
            <h4 className="tutorial-dialog-card-content-title">
              {tutorial.name}
            </h4>
            <div className="tutorial-dialog-card-content-description">
              {tutorial.description}
            </div>
            <div className="tutorial-dialog-card-content-actions">
              {true && (
                <button
                  type="button"
                  onClick={() => onSelect(tutorial.id)}
                  className="tutorial-dialog-card-content-actions-btn-link t-info"
                >
                  Start Tutorial
                </button>
              )}
              {tutorial.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => onSelect(tutorial.id)}
                  className="tutorial-dialog-card-content-actions-btn-link t-primary"
                >
                  Resume Tutorial
                </button>
              )}
              {tutorial.status === 'done' && (
                <button
                  type="button"
                  onClick={() => onSelect(tutorial.id)}
                  className="tutorial-dialog-card-content-actions-btn-link t-secondary"
                >
                  Unmark as done
                </button>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

TutorialList.defaultProps = {
};

TutorialList.propTypes = {
  tutorials: PropTypes.arrayOf(PropTypes.shape).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default TutorialList;

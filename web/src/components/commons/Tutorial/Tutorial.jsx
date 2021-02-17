import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import TutorialModals from './TutorialModals';
import TutorialList from './TutorialList';
import TutorialExecution from './TutorialExecution';
import data from './data.json';
import { useContextValue, ContextProvider } from './context';
import './Tutorial.scss';

const Tutorial = (props) => {
  const {
    className,
    active,
    rules,
    current: storedStatus,
    actions,
    defaultTutorials,
    records,
    username,
    auth,
  } = props;

  const location = useLocation();
  const contRef = useRef();
  const [modalInfo, setModalInfo] = useState(['exit', null]);
  const [activeScreen, setActiveScreen] = useState('execution');
  const [ctxState, ctxDispatch] = useContextValue();
  const {
    dialogShown,
    modalShown,
    tutorial,
    status,
  } = ctxState;

  const contents = useMemo(
    () => defaultTutorials.concat(data.tutorials),
    [defaultTutorials],
  );

  const selectTutorial = useCallback(
    (id, fresh = false) => {
      const tut = contents.find((t) => t.id === id);

      const newStatus = (!fresh && records.find((r) => r.id === tut.id)) || {
        id: tut.id,
        total: tut.steps.length,
        step: 1,
        task: 1,
        done: [1, 0],
      };

      if (actions) actions.startTutorial(newStatus, fresh);
      ctxDispatch({ type: 'SET_EXEC_TUTORIAL', status: newStatus, tutorial: tut });
    },
    [contents, records, actions, ctxDispatch],
  );

  const handleClose = () => {
    ctxDispatch({ type: 'HIDE_DIALOG' });
    if (actions) actions.setActive(false);
  };

  const handleResumeTutorial = (id) => selectTutorial(id);

  const handleStartFreshTutorial = (id) => selectTutorial(id, true);

  const handleExitTutorial = () => {
    ctxDispatch({ type: 'SET_TUTORIAL' });
    if (actions) actions.updateCurrent();
    if (contRef.current) contRef.current.scrollTo(0, 0);
  };

  const handleSelectTutorial = (id) => {
    const recorded = records.find((r) => r.id === id);

    if (recorded) {
      setModalInfo(['resume', id]);
      ctxDispatch({ type: 'SHOW_MODAL' });
    } else {
      selectTutorial(id);
    }
  };

  const handleCloseModal = () => {
    setModalInfo(['exit', null]);
    ctxDispatch({ type: 'HIDE_MODAL' });
  };

  const handleGoNextTutorial = (nextTutorial) => {
    setActiveScreen('execution');
    ctxDispatch({ type: 'SHOW_DIALOG' });
    if (actions) actions.closeModal({ reset: true });
    handleSelectTutorial(nextTutorial.id);
  };

  const handleCompleted = () => {
    setActiveScreen('completed');

    const nextTutorial = contents.find((t) => t.id === tutorial?.nextTutorial);

    const payload = {
      type: 'success',
      title: 'Tutorial completed',
      noActions: true,
      content: tutorial?.epilogue ? (
        <div className="px-3">
          <ReactMarkdown source={tutorial.epilogue} />
          {nextTutorial && (
            <>
              <p>Why not continue with the next tutorial?</p>

              <button
                type="button"
                onClick={() => handleGoNextTutorial(nextTutorial)}
                style={{ border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <img
                  style={{ width: '300px' }}
                  className="border-rounded"
                  src={nextTutorial.image}
                  alt={nextTutorial.name}
                />
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          {/* eslint-disable-next-line */}
          The <strong>{tutorial.name}</strong> was completed successfuly.
        </div>
      ),
    };

    if (actions?.onCompleted) {
      actions.onCompleted(payload);
      setTimeout(() => {
        ctxDispatch({ type: 'HIDE_DIALOG' });
      });
    }
  };

  const handleGoToIndex = () => {
    setActiveScreen('execution');
    handleExitTutorial();
  };

  const progressLabel = useMemo(
    () => status?.total && `Step ${status.step} of ${status.total}`,
    [status],
  );

  // run only in creation for recovery saved data
  useEffect(
    () => {
      ctxDispatch({ type: 'SET_META', meta: { username } });

      if (storedStatus?.id) {
        const tut = contents.find((t) => t.id === storedStatus.id);
        ctxDispatch({ type: 'SET_EXEC_TUTORIAL', tutorial: tut, status: storedStatus });
      }
    },
    // eslint-disable-next-line
    [username],
  );

  // listen tutorial instructions in url
  useEffect(
    () => {
      const { search } = location;
      const q = search.slice(1).split('&')
        .map((i) => i.split('='))
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

      if (q.tutorial) {
        if (actions) actions.setActive(true);
        ctxDispatch({ type: 'SHOW_DIALOG' });

        if (q.id) selectTutorial(parseInt(q.id, 10));
      }
    },
    // eslint-disable-next-line
    [location],
  );

  const buttonIcon = dialogShown ? 'url(/images/arrow_down_white-01.png)' : 'url(/images/Tutorials-01.png)';

  return auth && active && (
    <div className={cx('tutorial', className)}>
      <button
        type="button"
        label="info"
        onClick={() => ctxDispatch({ type: dialogShown ? 'HIDE_DIALOG' : 'SHOW_DIALOG' })}
        className="tutorial-btn btn"
        style={{ backgroundImage: buttonIcon }}
      />
      <div ref={contRef} className={cx('tutorial-dialog-container border-rounded scroll-styled', { show: dialogShown })}>
        <button
          type="button"
          label="close"
          onClick={handleClose}
          className="tutorial-dialog-container-close btn btn-hidden fa fa-times"
        />
        <div className="tutorial-dialog">
          {activeScreen === 'completed' ? (
            <div className="mt-4">
              <section className="tutorial-dialog-card border-rounded">
                <h4 className="tutorial-dialog-card-content-title">
                  Congratulations!
                </h4>
                {tutorial?.image && (
                  <div
                    className="tutorial-dialog-card-image border-rounded tutorial-list"
                    style={{ backgroundImage: `url(${tutorial.image})` }}
                  />
                )}
                <div className="tutorial-dialog-card-content">
                  <h4 className="tutorial-dialog-card-content-title">
                    {tutorial?.name}
                  </h4>
                  <div className="tutorial-dialog-card-content-description">
                    {tutorial?.epilogue ? (
                      <ReactMarkdown source={tutorial.epilogue} />
                    ) : 'tutorial has been completed successfully.'}
                  </div>
                  <div className="tutorial-dialog-card-content-actions">
                    <button
                      type="button"
                      onClick={handleGoToIndex}
                      className="tutorial-dialog-card-content-actions-btn-link t-info"
                    >
                      Go to list
                    </button>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <>
              <header className="tutorial-dialog-header">
                <h3 className="tutorial-dialog-header-title">
                  {tutorial?.name || 'You have no active tutorial.'}
                </h3>
                <div className="tutorial-dialog-header-subtitle">
                  {progressLabel || 'Choose one from below!'}
                </div>
              </header>
              {tutorial ? (
                <TutorialExecution
                  name={tutorial.name}
                  steps={tutorial.steps}
                  tutorial={tutorial}
                  rules={rules}
                  actions={actions}
                  onCompleted={handleCompleted}
                />
              ) : (
                <TutorialList
                  tutorials={contents}
                  onSelect={handleSelectTutorial}
                />
              )}
            </>
          )}
        </div>
        <div className={cx('tutorial-modal-container', { show: modalShown })}>
          <TutorialModals
            onClose={handleCloseModal}
            onExitTutorial={handleExitTutorial}
            onResumeTutorial={handleResumeTutorial}
            onStartFreshTutorial={handleStartFreshTutorial}
            modalType={modalInfo[0]}
            payload={modalInfo[1]}
          />
        </div>
      </div>
    </div>
  );
};

Tutorial.defaultProps = {
  className: '',
  actions: undefined,
  current: undefined,
  defaultTutorials: [],
  records: [],
  username: undefined,
  auth: true,
};

Tutorial.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool.isRequired,
  rules: PropTypes.shape({}).isRequired,
  actions: PropTypes.shape({
    startTutorial: PropTypes.func,
    updateCurrent: PropTypes.func,
    onCompleted: PropTypes.func,
    setActive: PropTypes.func,
    closeModal: PropTypes.func,
  }),
  current: PropTypes.shape({
    id: PropTypes.number,
    step: PropTypes.number,
    total: PropTypes.number,
  }),
  records: PropTypes.arrayOf(PropTypes.shape),
  defaultTutorials: PropTypes.arrayOf(PropTypes.shape),
  username: PropTypes.string,
  auth: PropTypes.bool,
};

const TutorialWithContext = (props) => (
  <ContextProvider>
    {/* eslint-disable-next-line */}
    <Tutorial {...props} />
  </ContextProvider>
);

export default TutorialWithContext;

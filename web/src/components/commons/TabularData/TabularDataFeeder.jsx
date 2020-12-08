import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import cx from 'classnames';
import RepositoryFileExplorer from 'components/commons/RepositoryFileExplorer';
import FilesApi from 'apis/FilesApi.ts';
import { fireModal, closeModal } from 'actions/actionModalActions';
import { inspect } from 'functions/apiCalls';
import { cvsToArray, jsonToArray, arrayToRichData } from './functions';

const filesApi = new FilesApi();

const TabularDataFeeder = (props) => {
  const {
    className,
    onDataLoaded,
  } = props;

  const dispatch = useDispatch();

  const [raw, setRaw] = useState();
  const [sourceFile, setSourceFile] = useState();

  const {
    projects: {
      selectedProject: { gid },
    },
  } = useSelector((s) => s);

  const handleFileClicked = (file) => {
    dispatch(closeModal({ reset: true }));

    return filesApi.getBlobRaw(gid, file.id)
      .then(inspect)
      .then((res) => res.ok ? res.text() : res)
      .then((rawContent) => {
        setRaw(rawContent);
        setSourceFile(file);

        return rawContent;
      })
      .then(cvsToArray)
      .then(arrayToRichData)
      .then(onDataLoaded)
      .catch((err) => {
        // console.log(err);
        toastr.error('Error loading data', err.message);
      });
  };

  const showFileExplorerModal = () => {
    dispatch(fireModal({
      type: 'primary',
      title: 'Select file',
      noActions: true,
      content: (
        <RepositoryFileExplorer
          onFileClicked={handleFileClicked}
          className="tabular-data-feeder-file-explorer"
        />
      ),
    }));
  };

  const showRawFileModal = () => {
    dispatch(fireModal({
      type: 'primary',
      title: 'Raw file data',
      noActions: true,
      content: (
        <div className="tabular-data-feeder-file-explorer">
          <pre>{raw}</pre>
        </div>
      ),
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];

    return file.text()
      .then((txt) => {
        if (file.type === 'application/json') {
          setRaw(txt);
          setSourceFile({ path: file.name });
          return jsonToArray(JSON.parse(txt));
        }

        if (file.type === 'text/cvs') {
          setRaw(txt);
          setSourceFile({ path: file.name });
          return cvsToArray(txt);
        }

        return Promise.reject(Error(`format ${file.type} not recognized.`));
      })
      .then(arrayToRichData)
      .then(onDataLoaded)
      .catch((err) => {
        // eslint-disable-next-line
        console.log(err);
      });
  };

  return (
    <div className={cx('tabular-data-feeder', className)}>
      <div>
        {sourceFile ? (
          <div>
            {`Using data from: ${sourceFile.path}`}
            <button
              type="button"
              className="btn btn-link btn-hidden ml-3"
              onClick={showRawFileModal}
            >
              See raw
            </button>
          </div>
        ) : (
          <div>
            No data selected
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={showFileExplorerModal}
        className="btn btn-primary m-2"
      >
        Explore repository
      </button>

      <button
        type="button"
        className="btn btn-primary m-2 fa fa-upload"
        style={{ position: 'relative', fontSize: '1rem' }}
      >
        <input
          type="file"
          className="tabular-data-feeder-upload-btn"
          onChange={handleFile}
        />
      </button>
    </div>
  );
};

TabularDataFeeder.defaultProps = {
  className: '',
};

TabularDataFeeder.propTypes = {
  className: PropTypes.string,
  onDataLoaded: PropTypes.func.isRequired,
};

export default TabularDataFeeder;

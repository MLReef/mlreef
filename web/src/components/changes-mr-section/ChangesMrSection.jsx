import React, { useEffect, useState } from 'react';
import * as PropTypes from 'prop-types';
import { isImageFormat } from 'functions/dataParserHelpers';
import ImageDiffSection from 'components/imageDiffSection/imageDiffSection';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import useMount from 'customHooks/useMount';
import useLoading from 'customHooks/useLoading';
import CodeDiffSection from '../code-diff-section/codeDiffSection';
import { fetchFileDiffInfo } from './functions';

const ChangesMrSection = (props) => {
  const { projectId, aheadCommits } = props;
  const [filesToRender, setFiles] = useState([]);
  const [reseting, setReseting] = useState(false);
  const [count, setCount] = useState(0);

  const isMounted = useMount();

  const fetchDiffs = () => fetchFileDiffInfo(projectId, aheadCommits)
    .then((files) => {
      if (files.length > 0) {
        setFiles(files.filter((f) => f.length > 0).map((f) => f[0]));
      }
    });

  const [isLoading, executeDiffsFetch] = useLoading(fetchDiffs);

  useEffect(() => {
    if (projectId && isMounted) {
      executeDiffsFetch(projectId, aheadCommits);
    }
  }, [projectId, aheadCommits]);

  // fired one time on mouse hover
  const resetOnce = () => {
    if (count > 0) {
      return;
    }
    setTimeout(() => {
      setReseting(false);
    });
    setReseting(true);
    setCount(count + 1);
  };

  if (isLoading) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <div className="changes-mr-section" onMouseEnter={resetOnce}>
      {filesToRender.length > 0 && filesToRender.map((fileToRender) => {
        if (isImageFormat(fileToRender.fileName)) {
          return (
            <ImageDiffSection
              key={`i-${fileToRender.id}-${fileToRender.imageFileSize}`}
              fileInfo={fileToRender}
              fileSize={fileToRender.imageFileSize}
              original={fileToRender.previousVersionFileParsed}
              modified={fileToRender.nextVersionFileParsed}
            />
          );
        }
        return isMounted && !isLoading && !reseting ? (
          <CodeDiffSection
            key={`c-${fileToRender.id}`}
            fileInfo={fileToRender}
            original={fileToRender.previousVersionFileParsed}
            modified={fileToRender.nextVersionFileParsed}
          />
        ) : null
      })}
    </div>
  );
}

ChangesMrSection.propTypes = {
  aheadCommits: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  projectId: PropTypes.number.isRequired,
};

export default ChangesMrSection;

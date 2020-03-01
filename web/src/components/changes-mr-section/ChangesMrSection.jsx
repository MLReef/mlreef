import React, { Component } from 'react';
import { Base64 } from 'js-base64';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import { isImageFormat } from 'functions/dataParserHelpers';
import ImageDiffSection from 'components/imageDiffSection/imageDiffSection';
import CodeDiffSection from '../code-diff-section/codeDiffSection';
import { getFileDifferences } from '../../functions/apiCalls';
import CommitsApi from '../../apis/CommitsApi';

class ChangesMrSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filesToRender: [],
    };
  }

  componentDidMount() {
    const { aheadCommits, projectId } = this.props;
    aheadCommits.forEach(async (commit, index) => {
      const { id: commitId } = commit;
      const commitDiffs = await CommitsApi.getCommitDiff(projectId, commitId);
      const file = await Promise.all(commitDiffs.map(async (commitDiff) => {
        const {
          previousVersionFile,
          nextVersionFile,
        } = await getFileDifferences(projectId, commitDiff, commit.parent_ids[0], commit.id);
        let previousVersionFileParsed = previousVersionFile;
        let nextVersionFileParsed = nextVersionFile;
        let sizeDeleted = 0;
        let sizeAdded = 0;
        const fileName = commitDiff.old_path.split('/').slice(-1)[0];
        if (previousVersionFile && !isImageFormat(fileName)) {
          previousVersionFileParsed = Base64.decode(
            Base64ToArrayBuffer.encode(previousVersionFile),
          );
          sizeDeleted = previousVersionFile.byteLength;
        }
        if (nextVersionFile && !isImageFormat(fileName)) {
          nextVersionFileParsed = Base64.decode(Base64ToArrayBuffer.encode(nextVersionFile));
          sizeAdded = nextVersionFile.byteLength;
        }
        const path = commitDiff.new_path
          ? commitDiff.new_path
          : commitDiff.old_path;
        const fileExtension = path.split('.').pop().toLowerCase();
        return {
          fileName,
          fileExtension,
          previousVersionFileParsed,
          nextVersionFileParsed,
          id: `${commit.id} ${index}`,
          sizeDeleted,
          sizeAdded,
        };
      }));

      const { filesToRender: filesInState } = this.state;
      const finalArrayOfFiles = [...filesInState, file[0]];
      this.setState({ filesToRender: finalArrayOfFiles });
    });
  }

  render() {
    const { filesToRender } = this.state;
    return (
      <>
        {filesToRender.map((fileToRender) => {
          if (isImageFormat(fileToRender.fileName)) {
            return (
              <ImageDiffSection imageFile={fileToRender} key={filesToRender.id} />
            );
          }
          return (
            <CodeDiffSection fileToRender={fileToRender} key={filesToRender.id} />
          );
        })}
      </>
    );
  }
}

export default ChangesMrSection;

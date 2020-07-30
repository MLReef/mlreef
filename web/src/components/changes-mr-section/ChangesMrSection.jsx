import React, { Component } from 'react';
import { Base64 } from 'js-base64';
import * as PropTypes from 'prop-types';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import { isImageFormat, compareArrayBy } from 'functions/dataParserHelpers';
import ImageDiffSection from 'components/imageDiffSection/imageDiffSection';
import CodeDiffSection from '../code-diff-section/codeDiffSection';
import { getFileDifferences } from '../../functions/apiCalls';
import CommitsApi from '../../apis/CommitsApi.ts';

const commitsApi = new CommitsApi();

class ChangesMrSection extends Component {
  mounted = false // to avoid setState when component is not mounted.

  reseted = false // set true when hover. It's important for avoid issue.

  constructor(props) {
    super(props);

    this.state = {
      filesToRender: [],
      reseting: false,
    };

    this.fetchDiffs = this.fetchDiffs.bind(this);
    this.resetCodeDiff = this.resetCodeDiff.bind(this);
    this.resetOnce = this.resetOnce.bind(this);
    this.mounted = true;
  }

  componentDidMount() {
    this.fetchDiffs(this.props);
  }

  componentDidUpdate(prevProps) {
    const { aheadCommits, projectId } = this.props;

    // fetch if props changed
    if (!compareArrayBy('id')(aheadCommits, prevProps.aheadCommits)) {
      this.fetchDiffs({ aheadCommits, projectId });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  resetCodeDiff() {
    setTimeout(() => {
      this.setState({ reseting: false });
    });
    this.setState({ reseting: true });
  }

  // fired one time on mouse hover
  resetOnce() {
    if (!this.reseted) {
      this.reseted = true;
      this.resetCodeDiff();
    }
  }

  fetchDiffs({ projectId, aheadCommits }) {
    aheadCommits.forEach(async (commit, index) => {
      const { id: commitId } = commit;
      const commitDiffs = await commitsApi.getCommitDiff(projectId, commitId);
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

      if (this.mounted) {
        this.setState((s) => ({ ...s, filesToRender: finalArrayOfFiles }));
      }
    });
  }

  render() {
    const { filesToRender, reseting } = this.state;

    return (
      <div onMouseEnter={this.resetOnce} className="changes-mr-section">
        <button
          type="button"
          label="reload"
          className="d-block ml-auto btn btn-icon btn-basic-secondary fa fa-redo-alt"
          onClick={this.resetCodeDiff}
        />
        {filesToRender.length > 0 && filesToRender.map((fileToRender) => {
          if (isImageFormat(fileToRender.fileName)) {
            return (
              <ImageDiffSection
                key={`i-${fileToRender.id}`}
                fileInfo={fileToRender}
                original={fileToRender.previousVersionFileParsed}
                modified={fileToRender.nextVersionFileParsed}
              />
            );
          }
          return !reseting && (
            <CodeDiffSection
              key={`c-${fileToRender.id}`}
              fileInfo={fileToRender}
              original={fileToRender.previousVersionFileParsed}
              modified={fileToRender.nextVersionFileParsed}
              onReset={this.handle}
            />
          );
        })}
      </div>
    );
  }
}

ChangesMrSection.propTypes = {
  aheadCommits: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  projectId: PropTypes.number.isRequired,
};

export default ChangesMrSection;

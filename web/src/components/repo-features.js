import React from "react";
import arrow_down_blue_01 from "./../images/arrow_down_blue_01.svg";
import plus_01 from "./../images/plus_01.svg";

export default class RepoFeatures extends React.Component {
  state = {
    isOpen: false,
    branchSelected: "Master"
  };

  Branches = ["Master", "feature/28-repo", "feature/41-pipeline"];

  handleBlur = e => {
    if (
      e.nativeEvent.explicitOriginalTarget &&
      e.nativeEvent.explicitOriginalTarget === e.nativeEvent.originalTarget
    ) {
      return;
    }

    if (this.state.isOpen) {
      setTimeout(() => {
        this.setState({ isOpen: false });
      }, 200);
    }
  };

  handleBranch = e => {
    e.target.focus();
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    return (
      <>
        <div id="repo-features">
          <div>
            <div className="reference">
              <button className="white-button" onClick={this.handleBranch}>
                {this.state.branchSelected}
                <img id="leftfeature-image" src={arrow_down_blue_01} alt="" />
              </button>
              {this.state.isOpen && (
                <div className="select-branch" onBlur={this.handleBlur}>
                  <div
                    style={{
                      margin: "0 50px",
                      fontSize: "14px",
                      padding: "0 40px"
                    }}
                  >
                    <p>Switch Branches</p>
                  </div>
                  <hr />
                  <div className="search-branch">
                    <input
                      autoFocus={true}
                      type="text"
                      placeholder="Search branches or tags"
                    />
                    <div className="branches">
                      <ul>
                        <li className="branch-header">Branches</li>
                        {this.Branches.map((branch, index) => (
                          <li key={index}>
                            <p>{branch}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className="white-button">
              <img id="plus" src={plus_01} alt="" />
              <img id="leftfeature-image" src={arrow_down_blue_01} alt="" />
            </button>

            <button className="blue-button">
              <p>Data Visualisation</p>
            </button>

            <button className="blue-button">
              <p>Data Pipeline</p>
            </button>
          </div>
          <div>
            <button className="white-button">
              <p>History</p>
            </button>

            <button className="white-button">
              <p>Web IDE</p>
            </button>

            <button className="white-button">
              <img id="leftfeature-image" src={arrow_down_blue_01} alt="" />
            </button>
          </div>
        </div>
      </>
    );
  }
}

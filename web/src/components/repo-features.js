import React from "react";
import arrow_down_blue_01 from "./../images/arrow_down_blue_01.svg";
import plus_01 from "./../images/plus_01.svg";

export default class RepoFeatures extends React.Component {
  render() {
    return (
      <div id="repo-features">
        <div>
          <button className="white-button">
            Master
            <img id="leftfeature-image" src={arrow_down_blue_01} alt="" />
          </button>

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
    );
  }
}

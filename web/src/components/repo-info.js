import React from 'react';
import { Link } from "react-router-dom";

export default class RepoInfo extends React.Component {
    render() {
        const projectId = window.location.href.split("/my-projects/")[1];
        return <div className="repo-info">
            <Link to={`/my-projects/${projectId}/commits`} className="repo-stat" replace>
                <p className="stat-no">17</p>
                <p className="stat-type">Commits</p>
            </Link>
            <div className="repo-stat">
                <p className="stat-no">2</p>
                <p className="stat-type">Branches</p>
            </div>
            <div className="repo-stat">
                <p className="stat-no">2</p>
                <p className="stat-type">Visualizations</p>
            </div>
            <Link to={`/my-projects/${projectId}/data-instances`} className="repo-stat" replace>
                <p className="stat-no">3</p>
                <p className="stat-type">Data Instances</p>
            </Link>
            <div className="repo-stat">
                <p className="stat-no">3</p>
                <p className="stat-type">Contributers</p>
            </div>
            <div className="repo-stat">
                <p className="stat-no"></p>
                <p className="stat-type">MIT License</p>
            </div>
        </div>
    }
}

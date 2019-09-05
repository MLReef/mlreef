import React from 'react';
import { Link } from "react-router-dom";

export default class RepoInfo extends React.Component {
    render() {
        const projectId = window.location.href.split("/my-projects/")[1];
        return <div className="repo-info">
            <Link to={`/my-projects/${projectId}/commits`} className="repo-stat">
                <p className="stat-no">01</p>
                <p className="stat-type">Commits</p>
            </Link>
            <div className="repo-stat">
                <p className="stat-no">01</p>
                <p className="stat-type">Branches</p>
            </div>
            <div className="repo-stat">
                <p className="stat-no">03</p>
                <p className="stat-type">Data Instances</p>
            </div>
            <div className="repo-stat">
                <p className="stat-no">01</p>
                <p className="stat-type">Contributers</p>
            </div>
            <div className="repo-stat">
                <p className="stat-no">568</p>
                <p className="stat-type">MB Files</p>
            </div>
            <div className="repo-stat">
                <p className="stat-no"></p>
                <p className="stat-type">MIT License</p>
            </div>
        </div>
    }
}

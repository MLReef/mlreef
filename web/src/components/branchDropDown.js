import React from "react";
import { Link } from "react-router-dom";

export default function BranchDropdown(props) {
    const branches = ["master", "feat/pipelines"];
    return (
        <div className="select-branch">
            <div
                style={{ margin: "0 50px", fontSize: "14px", padding: "0 40px" }}>
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
                        {branches.map((branch, index) => {
                            return (
                                <li key={index}>
                                    <Link to={`/my-projects`}><p>{branch}</p></Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}
import React, { Component } from "react";
import Navbar from "../navbar/navbar";
import ProjectContainer from "../projectContainer";
import { bindActionCreators } from "redux";
import * as commitActions from "../../actions/commitActions";
import "./commitDetails.css";
import arrow_blue from "../../images/arrow_down_blue_01.svg";
import triangle_01 from "../../images/triangle-01.png";
import { connect } from "react-redux";

class CommitDetails extends Component {

    state = {
        show: false,
        commits: {},
        commitId: window.location.href.split("/commit/")[1]
    }


    componentDidMount() {
        const projectId = this.props.match.params.projectId;
        this.props.actions.getCommitDetails("gitlab.com", projectId, this.state.commitId)
            .then(res => res.json())
            .then(response => this.setState({ commits: response }));
    }

    render() {

        const projectId = this.props.match.params.projectId;
        const proj = this.props.projects.filter(proj => proj.id === parseInt(projectId))[0];
        const author_name = this.state.commits.author_name;
        const commitId = this.state.commits.short_id;

        return (
            <div id="commits-view-container">
                <Navbar />
                <ProjectContainer project={proj} activeFeature="data" folders={['Group Name', proj.name, 'Data', 'Commits', this.state.commits.short_id]} />
                <br />
                <br />
                <div className="main-content">
                    <div className="wrapper">
                        <span className="commit-information">
                            <span className="commit-authored">Commit <b>{commitId}</b> authored 4 days ago by</span>
                            <div className="profile-pic-darkcircle" />
                            <span className="author"><b>{author_name}</b></span>
                        </span>
                        <div className="other-options">
                            <div className="btn">
                                <a href="#foo">
                                    <b>Browse Files</b>
                                </a>
                            </div>
                            <div className="btn">
                                <a href="#foo">
                                    <b>Options</b>
                                    <img className="dropdown-white" src={arrow_blue} alt="" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="commit-message">
                        <span><b>Commit message</b></span>
                        <div className="messages">
                            <span>{this.state.commits.message}</span>
                            <span>More info coming up</span>
                        </div>
                    </div>
                    <hr />
                    <p className="stats">Showing {this.state.commits.stats ? this.state.commits.stats.total : 0} files changed with
                        <span className="addition"> {this.state.commits.stats ? this.state.commits.stats.additions : 0} additions</span> and
                        <span className="deleted"> {this.state.commits.stats ? this.state.commits.stats.deletions : 0} deletions</span>. In total 423MB were added
                    </p>
                    <div>
                        <div className="commit-per-date">
                            {/* <div className="file-changed-header">
                                <p>File file 01.jpg added by merging data pipeline new_pipeline2</p>
                                <div className="pipeline-details">
                                    <span>{this.state.commits.last_pipeline ? this.state.commits.last_pipeline.id : ""}</span>
                                    <a href="#foo">View Pipeline</a>
                                </div>
                            </div> */}
                            <div className="pipeline-modify-details">
                                <div style={{ flex: "1", padding: "1em" }}>
                                    <span>file 01.jpg</span>
                                    <span className="addition">Added via Pipeline</span>
                                    <span>+2.20MB</span>
                                </div>
                                <div className="filechange-info">
                                    <div className="btn btn-background">
                                        <a href="#foo">
                                            <img className="dropdown-white" src={triangle_01} alt="" />
                                        </a>
                                    </div>
                                    <div className="btn btn-background">
                                        <a href="#foo">
                                            <b>Copy Path</b>
                                        </a>
                                    </div>
                                    <div className="btn btn-background">
                                        <a href="#foo">
                                            <b>View Files</b>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="image-display">
                                <div>
                                    <span>Source File</span>
                                    <div className="grey-area" />
                                </div>
                                <div>
                                    <span className="addition">Added</span>
                                    <div className="grey-area" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    console.log(state);
    return {
        projects: state.projects
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(commitActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommitDetails);

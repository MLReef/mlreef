import React from 'react';

export default class RepoInfo extends React.Component{
    render(){
        return <div class="repo-info">
            <div class="repo-stat">
                <p class="stat-no">01</p>
                <p class="stat-type">Commits</p>
            </div>
            <div class="repo-stat">
                <p class="stat-no">01</p>
                <p class="stat-type">Branches</p>
            </div>
            <div class="repo-stat">
                <p class="stat-no">03</p>
                <p class="stat-type">Data Instances</p>
            </div>
            <div class="repo-stat">
                <p class="stat-no">01</p>
                <p class="stat-type">Contributers</p>
            </div>
            <div class="repo-stat">
                <p class="stat-no">568</p>
                <p class="stat-type">MB Files</p>
            </div>
            <div class="repo-stat">
                <p class="stat-no"></p>
                <p class="stat-type">MIT License</p>
            </div>   
        </div>
    }
}
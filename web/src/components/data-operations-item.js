import React, { Component } from 'react';
import star_01 from './../images/star_01.svg';
import triangle_01 from './../images/triangle-01.png';

class DataOperationsItem extends Component {

    constructor(props) {
        super(props);

        this.handleDragStart = this.handleDragStart.bind(this);
    }

    handleDragStart(e) {
        const dt = e.dataTransfer;
        dt.setData('text/plain', e.currentTarget.id);
        dt.effectAllowed = 'move';
    }

    render() {
        const title = this.props.title;
        const username = this.props.username;
        const starCount = this.props.starCount;
        const index = this.props.index;
        return (
            <div draggable={true} onDragStart={this.handleDragStart}
                className="data-operations-item round-border-button shadowed-element" id={`data-operations-item-${index}`}>
                <div className="header flexible-div">
                    <div id="title-content">
                        <p className="bold-text">{title}</p>
                    </div>
                    <div className="data-oper-options flexible-div">
                        <div><img alt="" src={star_01} /></div>
                        <div><p>&nbsp;{starCount}&nbsp;</p></div>
                        <div>
                            <img alt="" src={triangle_01} />
                        </div>
                    </div>
                </div>
                <p>Created by <span className="bold-text">{username}</span></p>
            </div>
        )
    }
}

export default DataOperationsItem;
import React, {Component} from 'react';
import {PropTypes} from "prop-types";
//var _ = require('underscore');
import DataWrapper from "../Wrapper/DataWrapper";
import {observer, inject} from 'mobx-react';
import {toJS} from 'mobx'

@DataWrapper
@inject('appStore') @observer
class Article extends Component {
    static propTypes = {
        children: PropTypes.any
    };

    state = {
        collapsed: false
    };

    constructor(props) {
        super(props);
        this.store = this.props.appStore;
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed
        });
    };
    render() {
        if(!(this.store && this.store.details)){
            return <div>Loadinggggggggg----</div>
        }
        return <div>

            {JSON.stringify(this.store.details)}

        </div>
    }
}


export default Article;

import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
//import styles from './index.scss';
//import Home from '../../containers/layouts';
var _ = require('underscore');

@inject('appStore')
@observer
export default class CssModule extends Component {
  render() {
    return (
      <div>
        Hello world! this is cssModules file
        <span>Store: {this.props.appStore.name}</span>
      </div>
    );
  }
}

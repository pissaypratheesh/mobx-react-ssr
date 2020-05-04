import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
//import styles from './index.scss';
//import Home from '../../containers/layouts';
var _ = require('underscore');

@inject('appStore')
@observer
export default class CssModule extends Component {
  render() {
    let k = _.map([1,2],(a)=>a);
    console.log("pratheesh CSS MODULE",k);
//    return <Home/>
    return (
      <div>
        <span >SanmithaPratheesh will be marreid</span>
        Hello world! this is cssModules file
        <span>Store: {this.props.appStore.name}</span>
      </div>
    );
  }
}

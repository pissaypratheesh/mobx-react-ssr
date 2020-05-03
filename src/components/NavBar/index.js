import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {Link} from 'react-router-dom';
import Nav from './Nav';
//import 'antd/lib/layout/style';
//import styles from './index.scss';

export default class NavBar extends Component {
  static propTypes = {
    children: PropTypes.any
  };
  state = {
    collapsed: false
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };
  render() {
    return (
      <div>THIs is nav bar</div>
    );
  }
}

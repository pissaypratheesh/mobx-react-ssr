import React, {Component} from 'react';
import {hot} from 'react-hot-loader';
//var _ = require('underscore');
import Routers from './router';
global._ = require('underscore');
global._ = global._.mixin(require('./helpers/utility/mixins'));
global.l = console.log;




class App extends Component {
  render() {
    return <Routers />;
  }
}

export default hot(module)(App);

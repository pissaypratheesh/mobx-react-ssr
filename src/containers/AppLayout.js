import React from 'react';
import Loadable from 'react-loadable';
import {Route, Switch} from 'react-router-dom';
import NotFound from '../containers/NotFound';
import NavBar from '../components/NavBar';
const l = console.log;
// import Article from '../components/Article';
var _ = require('underscore');

export class AppLayout extends React.Component {
  // static propTypes = {
  //   loading: PropTypes.bool.isRequired
  // };

  render() {
    l("--prahteeeh-->",this.props);
    return (
        <Switch>
          <Route path="*" component={NotFound} />
        </Switch>
    );
  }
}

export default AppLayout;

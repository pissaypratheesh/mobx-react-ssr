import React from 'react';
import Loadable from 'react-loadable';
import {Route, Switch} from 'react-router-dom';
import NotFound from '../containers/NotFound';
import NavBar from '../components/NavBar';
// import Article from '../components/Article';
var _ = require('underscore');

const Home = Loadable({
  loader: () => import('../components/CssModule' /* webpackChunkName: 'Home' */),
  loading: () => <p>Loading...</p>
});

const Article = Loadable({
  loader: () => import('../components/Article' /* webpackChunkName: 'Article' */),
  loading: () => <p>Loading...</p>
});

export class AppLayout extends React.Component {
  // static propTypes = {
  //   loading: PropTypes.bool.isRequired
  // };

  render() {
    let k = _.map([1,2],(a)=>a);
    console.log("In applayout",k);
    return (
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/article" component={Article} />
          <Route path="*" component={NotFound} />
        </Switch>
    );
  }
}

export default AppLayout;

import React, {Component} from 'react';
import {Route, Switch,Redirect} from 'react-router-dom';
import routeComponentMap from './config/routeComponentMap'
import AppLayout from './containers/AppLayout';
var _ = require('underscore')
import Loadable from "react-loadable";
//import LoginForm from './containers/LoginForm';
const Home = Loadable({
  loader: () => import('@components/CssModule' /* webpackChunkName: 'Home' */),
  loading: () => <p>Loading...</p>
});


const Article = Loadable({
    loader: () => import('@components/Article' /* webpackChunkName: 'Article' */),
    loading: () => <p>Loading...</p>
});

export default class Routers extends Component {
  render() {
    return (
      <Switch>
{/*
        <Route path="/login" name="login" component={LoginForm} />
*/}

        <Route path="/" exact
          render={props => {
           return <Redirect to={'/home'}/>
          }}
        />
        <Route path="/layout" exact name="layout" component={AppLayout} />
        <Route path="/home" exact name="layout" component={Home} />
        <Route path="/home/article" component={Article} />


      </Switch>
    );
  }
}

import React, { Component } from "react";
import { toJS,extendObservable } from "mobx"
import { inject, observer } from "mobx-react";
const isBrowser = typeof window !== 'undefined'
const queryString = require('query-string')
var _ = require('underscore');
_ = _.mixin(require('../../helpers/utility/mixins'));

export default function DataWrapper(Component) {

    @inject("appStore")
    @observer
    class DataFetcher extends Component {
        constructor(props) {
            super(props);
            this.store = _.at(this,'props.appStore');
        }

        componentDidMount() {
          if(isBrowser) {
            let url = _.at(this, 'props.location.pathname');
            let pattern = _.at(this, 'props.match.path');
            let params = _.at(this, 'props.match.params');
            let query = _.at(this, 'props.location.search');
            params && (params.url = _.at(this,'props.match.url'));
            _.deepExtend(params,toJS(this.store));
            query && (params.query = queryString.parse(query.split("?")[1]));
            if (url && pattern && params) {
              this.store.fetchData && this.store.fetchData(url, pattern, params);
            }
          }
        }

        componentWillUnmount() {
        }

    componentWillReceiveProps(nextProps,prevProps){

      if(nextProps && isBrowser){
        let url = _.at(nextProps,'location.pathname');
        let pattern = _.at(nextProps,'match.path');
        let params = _.at(nextProps,'match.params');
        params.url = _.at(nextProps,'match.url');
        let query = _.at(nextProps,'location.search');
        _.deepExtend(params,toJS(this.store));
        query && (params.query = queryString.parse(query.split("?")[1]));
        if(url && pattern && params) {
          this.store.fetchData(url, pattern, params);
        }
      }
    }

		render() {
			return <Component {...this.props} />;
		}
	}
	return DataFetcher;
}

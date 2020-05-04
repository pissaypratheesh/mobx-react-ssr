import {observable, action} from 'mobx';
import routeUrlMap from '@config/routeAPIMap'
import {makeRequest} from '@helpers/makeRequest'

class AppStore {
  @observable name = 'solo8969';
  @observable day = '2096';
  @action.bound
  log() {
    console.log('mobx');
  }

  constructor(state) {
    let context = this;
  }


  @action clearData(name){
    let context = this;
    _.isArray(name) ? (_.map(name,(eachName)=>{context[eachName] = undefined})) : (this[name] = undefined);
  }
  @action updateData(objArr){
    let context = this;
    _.isObject(objArr) && _.each(objArr,(val,key)=>{context[key] = val});
  }


  //For a given pattern or url, fetch all the required data and update the state
  @action fetchData(url, pattern, params) {
    var context = this;
    let ignoreInit = _.at(params,'query.ignoreInit') &&  _.bool( _.at(params,'query.ignoreInit')) && !!_.at(this,'topicsList.0.data.data')
    _.extend(params,context);

    // Fetch in an array all the calls that need to be fired with its params and method
    routeUrlMap(params, _.extend({},params,context), function(dataToFetch){
      if(!dataToFetch || _.isEmpty(dataToFetch.urlList) || ignoreInit){
/*
        let fetchCallback1 = context.fetchDataCallbackMap.get(context.activeNavIndex);
        fetchCallback1 && fetchCallback1(200);
        context.fetchDataStatusCode = 200;
        context.fetchDataDetailsStatusCode = 200;
        if (url.indexOf('all-topics') !== -1) {
          context.fetchDataAllTopicsStatusCode = 200;
        }
*/
        return context[dataToFetch.updateFunction](null, url, params,{dataToFetch:dataToFetch})
      }
      dataToFetch.source = "client";
      dataToFetch.store = context;
      if (url.indexOf('all-topics') !== -1) {
        context.fetchDataAllTopicsStatusCode = -2;
      }
      makeRequest(dataToFetch,(error, results)=>{
        /*let fetchCallback = context.fetchDataCallbackMap.get(context.activeNavIndex);
        if (error) {
          context.fetchDataStatusCode = context.getErrorStatusCode(error);
          context.fetchDataDetailsStatusCode = context.getErrorStatusCode(error);
          if (url.indexOf('all-topics') !== -1) {
            context.fetchDataAllTopicsStatusCode = context.getErrorStatusCode(error);
          }
          fetchCallback && fetchCallback(context.getErrorStatusCode(error));
        }
        else {
          fetchCallback && fetchCallback(200);
          context.fetchDataStatusCode = 200;
          context.fetchDataDetailsStatusCode = 200;
          if (url.indexOf('all-topics') !== -1) {
            context.fetchDataAllTopicsStatusCode = 200;
          }
        }*/

        let headers = [];
        let resp = results && results.map((r) => {
          //!window.__dhpwa__.enableClientLogs && (r.headers.enablelogs === "true") && (window.__dhpwa__.enableClientLogs = true);
          _.at(r,'headers') && headers.push(r.headers);
          return _.at(r,'data') && r.data;
        });

        context[dataToFetch.updateFunction](resp || null, url, params,{dataToFetch,headers});
      })
    });
  }


}

export default new AppStore();

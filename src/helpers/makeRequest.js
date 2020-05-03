const isBrowser = typeof window !== 'undefined'
const querystring = require('querystring');
import { CtoSTimeout, StoSTimeout, isProduction} from '../config/constants.js';
import axios from 'axios';
import { json } from 'body-parser';
var appendQuery = require('append-query')
const queryString = require('query-string');
var async = require('async-lite');
var _ = require('underscore');
var promiseToCallback = require('promise-to-callback')
_.mixin(require('../helpers/utility/mixins'));
var retry = 3;
var defaultHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};
import {fetchUtmFromUrl} from "../helpers/utility/utility"

function makeRequest(reqObj,callback) {
  if(!reqObj.ignoreDefaultHeds && (!reqObj.source || !reqObj.urlList)){
    if(reqObj.source === 'server' && !reqObj.clientReq){
      return callback({Error: "Missing client request"}, null);
    }
    return callback({Error:"Missing source or urlList"},null)
  }
  //Override the retry if specified
  reqObj.retry && (retry = reqObj.retry)

  let requestArray =  reqObj.urlList && reqObj.urlList.map((params) => {
    return function (clbk) {
      individualReqHandler(params, clbk);
    }
  });

  return async.parallel(requestArray, function (err, resp) {
    return callback(err,resp);
  });


  // End of flow here, below are function declarations
  function individualReqHandler(params, cbk) {
    _request(params, 1, cbk);
  }

  //Recursive call for retry
  function _request(params, retriedCount, callback) {
    let counter = retriedCount;

    if(!disableRetry){
      if (params && params.url && params.url.includes("attempt=")) {
        params.url = (params.url.includes("&attempt=1") || params.url.includes("?attempt=1"))
          ? params.url.replace("&attempt=1", "&attempt=2").replace("?attempt=1", "?attempt=2")
          : params.url.replace("&attempt=2", "&attempt=3").replace("?attempt=2", "?attempt=3");
      } else {
        params && params.url && params.url.includes("?")
          ? (params.url += "&attempt=" + counter)
          : (params.url += "?attempt=" + counter);
      }
    }
    let parsedQuery = isBrowser && window.location.search  
    let utm_medium = queryString.parse(parsedQuery).utm_medium
    let utm_channel = queryString.parse(parsedQuery).utm_channel
    let showRelated = traffic_type(utm_medium,utm_channel) && traffic_type(utm_medium,utm_channel).showRelated
    let utmParameter = fetchUtmFromUrl()
    params.url = appendQuery(params.url,utmParameter);
    params.url = appendQuery(params.url,{showRelated:showRelated})
    if(isBrowser && (_.at(window,'__STATE.env.isCampaign'))){
      params.url = appendQuery(params.url,{campaign:true});
    }
    let checkPartner = isBrowser && ( _.at(window, '__dhpwa__.partner') || (window.getPartner && window.getPartner()))
    let applyPartner = checkPartner && partnerConfig(checkPartner);
    checkPartner &&  _.at(params,'url') && (params.url.indexOf("partner=") === -1) && ((params.url.indexOf("?") !== -1) ? (params.url += "&partner="+checkPartner) : (params.url += "?partner="+checkPartner));
    makeCall(params, function (error, res) {
      let forceRetry = params.forceRetry;
      if(!error){
        return callback && callback(error,res);
      }
      if(disableRetry && error && !forceRetry){
        return callback && callback(error);
      }
      if((!disableRetry || forceRetry) && error) {
        if (retriedCount >= (params.retry || CToSCallRetries)) {
          return callback && callback(error);
        }
        return _request(params, retriedCount + 1, callback);
      }
    });
  }

  function makeCall(params,cb) {
    let defaultOptions = manageClientCalls(params,reqObj);
    let promiseArray = [];
    let method = _.at(params,'method') && params.method.toLowerCase();
    params.withCredentials =  true;
    if(params.url && method === "get"){
      promiseArray.push(axios[params.method](params.url, {...defaultOptions}));
    }
    if(params.url && (method === "post" || method === "put")){
      promiseArray.push(axios[params.method](params.url, _.at(params,'body') || _.at(params,'data'),{...defaultOptions}))
    }
    try{
      promiseToCallback(axios.all(promiseArray))((err,res)=>{
        err && (reqObj.source !== "client" || !isProduction) && logError(err,_.pick(params,'url','method','body'));
        return cb(err,_.at(res,'0'))
      });
    }catch (e) {
      return cb("Unknown Error:"+e&&e.toString(),null)
    }
  }


  function logError(err,reqObj){
    !isProduction && console.error('~~FAILED REQUEST ERROR:',JSON.stringify(_.extend(reqObj,{
      error:err&&err.toString(),
      errorCode:err&&err.code,
      time:new Date()
    })));
  }

  function manageClientCalls(params, reqObj) {
    let timeout = (params && params.timeout) || reqObj.timeout,
        clientData = isBrowser && _.at(window,'__dhpwa__.clientData') || {},
        extraCookieForYou;


    !timeout && (timeout = CtoSTimeout);
    !reqObj.ignoreDefaultHeds && _.at(params,'url') && (params.url.indexOf("mode=pwa") === -1) && ((params.url.indexOf("?") !== -1) ? (params.url += "&mode=pwa") : (params.url += "?mode=pwa"));
/*
    if(params.url.startsWith('/apis')){
      params.url = "http://localhost:4000" + params.url;
    }
*/
    return  {
      headers: params.ignoreDefaultHeds ? params.headers : _.extend({
          surpasscookie: params.surpasscookie || _.at(clientData,'signature') || '',
          clientInfo:  clientData && JSON.stringify(_.omit(clientData,'signature')),
      },
      defaultHeaders, params.headers || {}),
      timeout: timeout
    };

  }
}


function promiseRequest(reqObj,callback) {
  if(!reqObj.ignoreDefaultHeds && (!reqObj.source || !reqObj.urlList)){
    if(reqObj.source === 'server' && !reqObj.clientReq){
      return callback({Error: "Missing client request"}, null);
    }
    return callback({Error:"Missing source or urlList"},null)
  }
  //Override the retry if specified
  reqObj.retry && (retry = reqObj.retry)
  let promiseArray = [];

  reqObj.urlList && reqObj.urlList.map((params) => {
    let checkPartner = isBrowser && ( _.at(window, '__dhpwa__.partner') || (window.getPartner && window.getPartner()))
    let applyPartner = checkPartner && partnerConfig(checkPartner);
    checkPartner &&  _.at(params,'url') && (params.url.indexOf("partner=") === -1) && ((params.url.indexOf("?") !== -1) ? (params.url += "&partner="+checkPartner) : (params.url += "?partner="+checkPartner));
    let defaultOptions = manageClientCalls(params,reqObj);
    let method = _.at(params,'method') && params.method.toLowerCase();
    params.withCredentials =  true;
    if(params.url && method === "get"){
      promiseArray.push(axios[params.method](params.url, {...defaultOptions}));
    }
    if(params.url && (method === "post" || method === "put")){
      promiseArray.push(()=>{ axios[params.method](params.url, _.at(params,'body') || _.at(params,'data'),{...defaultOptions})})
    }

  });
  return axios.all(promiseArray);




  function manageClientCalls(params, reqObj) {
    let timeout = (params && params.timeout) || reqObj.timeout,
      clientData = isBrowser && _.at(window,'__dhpwa__.clientData') || {},
      extraCookieForYou;



    !timeout && (timeout = CtoSTimeout);
    !reqObj.ignoreDefaultHeds && _.at(params,'url') && (params.url.indexOf("mode=pwa") === -1) && ((params.url.indexOf("?") !== -1) ? (params.url += "&mode=pwa") : (params.url += "?mode=pwa"));
    /*
        if(params.url.startsWith('/apis')){
          params.url = "http://localhost:4000" + params.url;
        }
    */
    return  {
      headers: params.ignoreDefaultHeds ? params.headers : _.extend({
          surpasscookie: params.surpasscookie || _.at(clientData,'signature') || defaultCookie,
          clientInfo:  clientData && JSON.stringify(_.omit(clientData,'signature')),
        },
        defaultHeaders, params.headers || {}),
      timeout: timeout
    };

  }
}


export {
  makeRequest,
  promiseRequest
};

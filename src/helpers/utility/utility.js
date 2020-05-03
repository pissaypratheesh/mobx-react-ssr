import { toJS  } from "mobx"

const isBrowser = typeof window !== 'undefined'
const navigatorSupported = isBrowser && (typeof window.navigator !== 'undefined');
const queryString = require('query-string');
let appendQuery = require('append-query');
var _ = require('underscore');
var cookies = require('js-cookie');
var cookie = require('cookie');

_.mixin(require('../client/src/lib/mixins'));
var uaParser =  isBrowser && navigatorSupported  && _.at(window,'navigator.userAgent') && require('ua-parser-js')(window.navigator.userAgent);

//url(optional): pass url or by defaults picks from URL,
//params(optional): query params obj,
//others:(optional) pass an array of keys to be included
function fetchUtmFromUrl(url,params, others) {
  let utmNotherParams = {};
  let paramsObj = params || fetchParamsFromUrl(url);
  _.each(paramsObj,(val,key)=>{
    if(key.includes('utm_') || (others && _.contains(others,key))){
      utmNotherParams[key] = val;
    }
  });
  return utmNotherParams;
}

function fetchParamsFromUrl(url,store){
  let search = url || (isBrowser ? window.location.search : _.at(store,'landingUrl.search'));
  let urlParamsStr = search && search.split('?')[1];
  return urlParamsStr ? queryString.parse(urlParamsStr) : {};
}

function isValidJSON(jsonStr) {
  try {
    JSON.parse(jsonStr);
    return true;
  }
  catch (ex) {
    return false;
  }
}



export {
  fetchUtmFromUrl,
  fetchParamsFromUrl,
  isValidJSON,
}

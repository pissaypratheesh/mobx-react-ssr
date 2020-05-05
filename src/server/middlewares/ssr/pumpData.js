import AppStore from "../../../store/appStore";
import allStore from '../../../store';

import { appVersion, isQa, isStage,isProduction, activeEnv} from '../../../config/constants'
import routeUrlMap from '../../../config/routeAPIMap'
import { makeRequest } from '../../../helpers/makeRequest'
import {toJS} from 'mobx'

const baseUrl = "http://localhost:1443";
var _ = require('underscore');
var appendQuery = require('append-query')

_ = _.mixin(require('../../../helpers/utility/mixins'));

/**
 Pump the relevant data into the store based on url and attach to req obj
 */
export default (req,res, next) => {
  let cookies =  req.cookies,
    resolution = cookies && cookies.resolution || '1080x1920',
    clientId = cookies && cookies.client_id ,
    lang = 'en',
    useragent = req.useragent,
    clientType = !useragent ? 'unknown' : ( useragent.isAndroid ? 'android' : ((useragent.isiPhone || useragent.isiPad) ? 'iphone' : 'unknown')),
    meta,
    urlLang;
  clientId = "clientId";
  let params = _.extend({},req.params,{language:req.params.language},_.pick(req.query,'lite'));
  if(!clientId){

  }
  let host  = req.get('host');
  routeUrlMap(params,req.pattern,(routeResp)=>{
    let parsed;
    parsed = {
        store: {
          appStore: new AppStore() || {}
        }
    }
    if(routeResp){
      let urlList = _.map(routeResp.urlList,(val,ind)=>{
        if(_.at(val,'url.startsWith') && val.url.startsWith('/')){
          val.url = baseUrl + val.url;
        }
        var list =  {
          url: appendQuery(val.url,{}) ,
          method: val.method
        };
        (ind === 0) && meta && (list.headers = {client: JSON.stringify(meta)});
        return list;
      });
    let urlObj = {
      urlList: urlList,
      source: "client"
    };
    return makeRequest(urlObj,(err,resp)=>{
      if(err || !_.at(parsed,'store.appStore')){
        return next();
      }
      if(parsed.store.appStore){
        if(_.at(parsed,'store.appStore') && _.at(parsed,'store.appStore')[routeResp.updateFunction]){
          let search = req.url.split('?')[1];
          parsed.store.appStore = parsed.store.appStore[routeResp.updateFunction]([_.at(resp,'0.data')],'',params,{},parsed.store.appStore);
          //parsed.store.appStore = _.pick(parsed.store.appStore,"details",'supportedLanguages','regData','selectedIdDetails','activeNav','topics','clientId','subtopicNm',"topicNm","topicKey","npKey","npName","npGroupCatKey","npGroupCatName","generalizedTopics","newspaperLanding","activeNavIndex","activeTopic","animateShowMenu","appVersion","directDetailsLanding","selectedCountry","selectedLang","showContent","showLandingPage","showMenu","topicsList","user","missingUrlParam","livetv", "extraCookie","viralData")
          req.store = parsed.store.appStore || {};
          req.store.landingPagePattern = req.pattern;
          req.store.selectedLang = lang || 'en';
          req.store.landingUrl = {
            href: 'https://' + req.headers.host + req.url,
            origin: 'https://' + req.headers.host,
            pathname: req.url,
            search: search ? ("?" + search) : ''
          };
          req.store.clientMeta = {
            width: _.at(req,'nhClientJson.width'),
            height: _.at(req,'nhClientJson.height')
          }
          req.store.delayHandshake = 2000;//req.url.includes('-newsid-') ?  2000 : 6000;
          req.store.dataFromHtml = true;
          req.store.host = host;
          req.store.isTopStoriesSupported = (req.url.includes('top+stories'));
          req.store.urlLang = urlLang;
          req.store.env = {isQa,isStage,isProd: isProduction};
          req.store.activeEnv = activeEnv;
          req.store.tabSwitched = false;
          return next();
        }
        }
      })
    }
  })
}

/**
 * Created by sharadkumar on 20/7/17.
 */

import { idbArrToJson, indexedDb } from '../lib/indexedDb';
import {partner} from '../../../sharedConfig/constants';
const isBrowser = typeof window !== 'undefined'
const navigatorSupported = isBrowser && (typeof window.navigator !== 'undefined');


var assetName = 'assets';
var uaParser = (isBrowser && navigatorSupported) ? require('ua-parser-js')(window.navigator.userAgent):{};
var _ = require('underscore');
_.mixin(require('../lib/mixins'));

switch (partner){
  case 'samsung':
    assetName = 'navipage';
    break;
}

function linksGetApp(os){
  switch (os) {
    case 'Android':
      return "//acdn.newshunt.com/nhbinaries/binFilesPath/promotion/install_dailyhunt_13.1.7_APK.apk?";
      // return "/dh.apk?mode=pwa";
      // return "https://play.google.com/store/apps/details?id=com.eterno&referrer=utm_source%3DPWA%26utm_medium%3DApp%2520Install";
      break;
    case 'iOS':
      return  "https://itunes.apple.com/us/app/apple-store/id338525188?pt=296722&ct=Smartbanner&mt=8";
    case 'Windows Phone':
      return "https://www.microsoft.com/en-in/store/p/dailyhunt-formerly-newshunt/9wzdncrfj1l1?cid=Smartbanner&ocid=badge&rtc=1";
    default:
      return "market://details?id=com.eterno&referrer=utm_source%3DPWAmenu%26utm_content%3DMenu%26utm_campaign%3DPWA";
  }
}

function linksSmartBanner(os){
  switch (os) {
    case 'Android':
      return "//acdn.newshunt.com/nhbinaries/binFilesPath/promotion/install_dailyhunt_13.1.7_APK.apk?";
      //return "/dh.apk?mode=pwa"
      // return "https://play.google.com/store/apps/details?id=com.eterno&referrer=utm_source%3DPWA%26utm_medium%3DApp%2520Install";
      break;
    case 'iOS':
      return  "https://itunes.apple.com/us/app/apple-store/id338525188?pt=296722&ct=Smartbanner&mt=8";
    case 'Windows Phone':
      return "https://www.microsoft.com/en-in/store/p/dailyhunt-formerly-newshunt/9wzdncrfj1l1?cid=Smartbanner&ocid=badge&rtc=1";
    default:
      return "market://details?id=com.eterno&referrer=utm_source%3DPWAmenu%26utm_content%3DMenu%26utm_campaign%3DPWA";
  }
}

function utmBannerLink(os){
  switch (os) {
    case 'Android':
      return "https://play.google.com/store/apps/details?id=com.eterno&referrer=utm_source%3DWAP%20to%20APP%26utm_medium%3DObscured";
      //return "/dh.apk?mode=pwa"
      // return "https://play.google.com/store/apps/details?id=com.eterno&referrer=utm_source%3DPWA%26utm_medium%3DApp%2520Install";
      break;
    case 'iOS':
    case 'ios':
      return  "https://itunes.apple.com/us/app/apple-store/id338525188?pt=296722&ct=Smartbanner&mt=8";
    case 'Windows Phone':
      return "https://www.microsoft.com/en-in/store/p/dailyhunt-formerly-newshunt/9wzdncrfj1l1?cid=Smartbanner&ocid=badge&rtc=1";
    default:
      return "market://details?id=com.eterno&referrer=utm_source%3DPWAmenu%26utm_content%3DMenu%26utm_campaign%3DPWA";
  }
}

module.exports = {
  manufacturer: _.at(uaParser,'device.vendor'),
  browserName:_.at(uaParser,'browser.name'),
  name:_.at(uaParser,'browser.name'),
  os:_.at(uaParser,'os.name'),
  browserInfo: uaParser,
  desktop:_.at(uaParser,'device.type')=='mobile'?false:true,
  utmSrc:function(){
    let str = {'iOS':'pi','Android':'pa','Windows Phone':'pw'}
    return (str[_.at(uaParser,'os.name')]?str[_.at(uaParser,'os.name')]:'pu');
  },
  product:_.at(uaParser,'device.model'),
  linksSmartBanner:linksSmartBanner(_.at(uaParser,'os.name')),
  utmBannerLink:utmBannerLink(_.at(uaParser,'os.name')),
  linksGetApp:linksGetApp(_.at(uaParser,'os.name')),
  deviceSize:{height:isBrowser && screen.height,width:isBrowser && screen.width,queryStr:`h=${isBrowser && screen.height}&w=${isBrowser && screen.width}`},
  resolution:(isBrowser && (Math.round(screen.width*window.devicePixelRatio)+'x'+Math.round(screen.height*window.devicePixelRatio))),
  tile_3:function(){
    if(!isBrowser){
      return;
    }
    let res = screen.width;
    let fullCardWidth = res - 30;
    let imgSize = (fullCardWidth -20)/ 3;
    return imgSize;
  },
  ads_Size : {
    //for listing page
    ads1:{
      width : 720,
      height : 280,
      subSlot : 'web-1',
      adHeight : function(){if(!isBrowser) return; let ad = this.width/this.height;return ad;},
    },
    ads2: {
      width : 990,
      height : 505,
      subSlot : 'web-2',
      adHeight : function(){if(!isBrowser) return; let ad = this.width/this.height;return ad;},
    },
    ads3: {
      width : 300,
      height : 250,
      subSlot : 'web-3',
      adHeight : function(){if(!isBrowser) return; let ad = this.width/this.height;return ad;},
    },
    ads5: {
      width : 320,
      height : 50,
      subSlot : 'web-5',
      adHeight : function(){let ad = this.width/this.height;return ad;},
    },
    ads6: {
      width : 300,
      height : 250,
      subSlot : 'web-6',
      adHeight : function(){if(!isBrowser) return; let ad = this.width/this.height;return ad;},
    },
    adsPgi: {
      subSlot : 'web-pgi',
    },
    adsSupplement: {
      subSlot : 'web-supplement',
      requiredAdTags: 'sp1:1,sp2:1,sp3:1,sp4:1'
    }
  },
  fontCall:function(lang){
    if(lang=='hi'||lang=='en'){return;}
    return "<"+"style>@font-face {font-family:'dyLang'; src: url('" + (isBrowser ? window.location.origin : "https://m.dailyhunt.in")+ "/" + assetName + "/fonts/"+lang+"/notoRegular.ttf?mode=pwa') format('truetype');font-weight:normal;font-style:normal;}</style>"
  },
  addToHomeScreen:function(obj){
    //console.log('deviceDetect');
    var dbGa = indexedDb('ga','collection');
    dbGa.get('addToHomeScreen').then((data) => {
      !data && dbGa.set('addToHomeScreen',{viewCount:1,dissmissedCount:0,appInstalled:false});
      data && setDb(obj,data,dbGa);
    }).catch((err)=>{
      console.error('Index db error (ga collection deviceDetect) ',err);
    });
  }
};

function setDb(obj,data,dbGa){
  let addToHome = data.val;

  obj.viewCount && (addToHome.viewCount = addToHome.viewCount+1)
  obj.dissmissedCount && (addToHome.dissmissedCount = addToHome.dissmissedCount+1)
  obj.appInstalled && (addToHome.appInstalled = true)

  dbGa.set('addToHomeScreen',addToHome);
}

//console.log('{{ USERAGENT }}' ,'name-->'+deviceInfo.name,'>>version--->'+deviceInfo.version,'>>layout--->'+deviceInfo.layout,'>>os--->'+deviceInfo.os,'>>description--->'+deviceInfo.description,'>>product--->'+deviceInfo.product );

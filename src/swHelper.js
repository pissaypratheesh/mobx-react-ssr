
/**
 * Created on 22/5/17.
 */
var conf = {
  "version": "1.2.28",
}
var appVersion = conf.version;
const isBrowser = typeof window !== 'undefined'
const navigatorSupported = isBrowser && (typeof window.navigator !== 'undefined');
const isLocalhost = Boolean(
  window.location.hostname === 'localhost'
);
let isSubscribed = false;
let applicationServerPublicKey = "BISnhTNfSN34XAvX6ZPCxULeN8wIJCDyjH_4ujKhdj_AnPcNOx-ITgjkuY1mj0wW3yoHVzxeBIK7NS7A_CWpuPw";
let swVersion = appVersion;
let callForCommonProperties;
let callForCid;
let callForCommonParams;
let callForClientId;
let defaultSurpassCookie = 'nhClientInfoV1=%7B%22device%22%3A%22pwa%22%2C%22featureMask%22%3A8192%7D';
// for viral and forYou use this: "nhClientInfoV1=%7B%22device%22%3A%22pwa%22%2C%22featureMask%22%3A268707848%7D";

const apiDomain = '' ;// 'https://api-news.dailyhunt.in';
const apiBasePattern =  apiDomain + '/api/v100/';

var extend = function() {
  var extended = {};

  for(let key in arguments) {
    var argument = arguments[key];
    for ( let prop in argument) {
      if (Object.prototype.hasOwnProperty.call(argument, prop)) {
        extended[prop] = argument[prop];
      }
    }
  }

  return extended;
};

function readClientData() {
  let dhpwa = window && window.__dhpwa__,
      clientData = dhpwa && window.__dhpwa__.clientData,
      clientId = clientData && clientData.clientid;
  if(clientId) {
    clearInterval(callForCid);
    subscribeUser(clientId);
  }
}

if (navigatorSupported && ('serviceWorker' in navigator)) {
//if (navigatorSupported && !isLocalhost && ('serviceWorker' in navigator)) {

  setTimeout(()=>{
    navigator && navigator.serviceWorker.register('/sw.js?mode=pwa&v='+swVersion, { insecure: true, scope:'/'}).then(function(reg) {
      let shouldRefresh = true;
      setInterval(function(){
        shouldRefresh && fetch(apiBasePattern + 'appVersion?mode=pwa&v='+swVersion)
          .then(
            function(response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
              }

              // Examine the text in the response
              response.json().then(function(data) {
                var params = getGaParam();
                var downloadBanner = document.getElementById('downloadBanner');
                var refreshBanner =document.getElementById('refreshBtn');
                if(data && !data.sameVersion){
                  shouldRefresh = false;
                  refreshBanner && (refreshBanner.style.display != 'block') && sendGaEvent(params,'View')
                  refreshBanner && (refreshBanner.style.display='block');
                  downloadBanner && (downloadBanner.style.display='none');
                }
              });
            }
          ).catch(function(err) {
            console.log(" sw fetch error:",err);
            console.log('Fetch Error :', err);
          });
      }, 600000);
      if(("Notification" in window) && (Notification.permission !=='denied')) {
        registerNotification();
        initialiseState();
      }else{
        clearSubscriptionFromDB();
      }
    }).catch(function(err) {
      console.log(" sw fetch error:",err);
      console.log('Service Worker Error', err);
    });
  },5000);
} else {
  console.log('Push messaging is not supported');
}

function initialiseState() {
  navigatorSupported && navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    if(serviceWorkerRegistration && serviceWorkerRegistration.pushManager && serviceWorkerRegistration.pushManager.getSubscription) {
      serviceWorkerRegistration.pushManager.getSubscription()  // Do we already have a push message subscription?
        .then(function (subscription) {
          isSubscribed = !!subscription;
          let allowSubscription = true;
          if (navigator.getInstalledRelatedApps) {
            navigator.getInstalledRelatedApps().then(apps => {
              if (apps.length > 0) {
                if (isSubscribed) {
                  subscription.unsubscribe().then(function (successful) {
                    if (successful) {
                      callForCommonProperties = setInterval(handleDeniedSubscription, 3000);
                    }
                  }).catch(function (e) {
                    console.error("Un-subscription failed");
                  });
                }
                allowSubscription = false;
              }
              checkSubscription(allowSubscription, isSubscribed, subscription);
            }).catch(function (er) {
              console.log("Error getting getInstalledRelatedApps:",er);
            });
          } else {
            checkSubscription(allowSubscription, isSubscribed, subscription);
          }
        }).catch(function (ex) {
        console.error("Un-subscription failed", ex);
      });
    }
  }).catch(function (err) {
    console.log("Service worker not ready:",err);
  });
}

function checkSubscription(allowSubscription, isSubscribed, subscription){
  if(allowSubscription){
    if (isSubscribed) {
      let subJSObject = getSubscriptionObject(subscription);
      if(!window.subscription) {
        window.subscription = JSON.stringify(subJSObject);
      }
      if(!window.subscription){
        window.subscription = window.localStorage && window.localStorage.getItem("gcm_id");
      }

      if(!window.subscription){
        window.subscription = window && window.localStorage && localStorage.getItem("gcm_id");
        readFromDbWithKey("registration", "register", "gcm_id");
      }

      callForCommonParams = setInterval(instrumentation, 5000, {
        event_name:'device_google_ids',
        event_section: 'pwa_app',
        properties: {
          device_id: window && window.__dhpwa__ && window.__dhpwa__.clientData && window.__dhpwa__.clientData.fingerprint,
          gcm_id: window.subscription,
          pv_event: 'false'
        },
      });
    } else {
      // Don't ask for notification permission by default
      // callForCid = setInterval(readClientData, 3000);
    }
    if(("Notification" in window) && Notification.permission ==='granted') {
      readFromDbAndSendSubscription("registration", "register", "gcm_id_register3");
    }
  }
}

//getDialogBox event
function genericDialogInstrObj(from) {
  let landingPageRef = window && window.__dhpwa__ && window.__dhpwa__.landingPageReference;
  let returnObject =  {
    event_section: 'pwa_app',
    properties: {
      type: from ? 'pwa_dh_tray' : 'pwa_browser_notification',
      device_id:  window && window.__dhpwa__ && window.__dhpwa__.clientData && window.__dhpwa__.clientData.fingerprint,
      gcm_id: window.subscription,
      pv_event: 'false',
      referrer: landingPageRef && (landingPageRef.presentId === 1 ? 'headlines' : 'topic'),
      referrer_id: landingPageRef && landingPageRef.presentId
    },
  };
  if (from === "dialog") {
    let notificationDialogCount = window && window.localStorage && window.localStorage.getItem("viewed_pwa_browser_notification");
    notificationDialogCount ? notificationDialogCount++ : notificationDialogCount = 1;
    window && window.localStorage && window.localStorage.setItem("viewed_pwa_browser_notification", notificationDialogCount);
    returnObject.properties.type = 'pwa_browser_notification';
    returnObject.properties.seen_count = notificationDialogCount;
}
  return returnObject;
}

window.subscribeUser = function (clientId, from, result) {
  console.log("subscribeUser log", clientId, from, result);
  let genericInstrObj = genericDialogInstrObj(from);
  //disabled sendGAEvents('View','Default');
  instrumentation(extend({},genericInstrObj,{event_name:'dialogbox_viewed'}));
  navigatorSupported && navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(applicationServerPublicKey)
    }).then(function(subscription) {
        let stringifiedSubscription = subscription && JSON.stringify(getSubscriptionObject(subscription));
        if (stringifiedSubscription) {
          window.subscription = stringifiedSubscription;
        }
        isSubscribed = true;
        insertIntoDB({id:"gcm_id",val:window.subscription});
        sendSubscription(stringifiedSubscription, clientId);
        instrumentation(extend({},genericInstrObj,{
          event_name:'dialogbox_action',
          properties:extend({},genericInstrObj.properties,{action:'allow'})
        }));
        // sendGAEvents('Accept','Default');
        if (typeof(Storage) !== "undefined") {
          window && window.localStorage && window.localStorage.setItem("gcm_id", window.subscription);
        }
    }).catch(function(err) {
      let action  = (result === 'denied') ? "block" : "dismiss";
      instrumentation(extend({},genericInstrObj,{
        event_name:'dialogbox_action',
        properties:extend({},genericInstrObj.properties,{action: action})
      }));
      // sendGAEvents((result === 'denied') ? "Block" : "Dismiss",'Default');
      handleDeniedSubscription();
    });
  }).catch((error)=>{
    console.log("Error with service worker being ready:",error);
  });
}

function sendSubscription(subscription,clientId) {
  getCommonParams(function(err, commonParams){
    let client = commonParams.user_os_platform;
    client = client ? client : "pwa_android";
    let surpasscookie =  window && window.__dhpwa__ && window.__dhpwa__.clientData && window.__dhpwa__.clientData.signature;
    surpasscookie = surpasscookie ? surpasscookie : defaultSurpassCookie;
    if(subscription) {
      return fetch(apiBasePattern + 'registerSubscription?mode=pwa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'surpasscookie': surpasscookie
        },
        body: JSON.stringify({
          "notificationToken": subscription,
          "enabled": true,
          "clientId": clientId,
          "clientType": client
        })
      }).then(function (response) {
        if (!response.ok) {
          return "ERROR";
        }
        return response.json();
      }).then(function (responseData) {
        if (responseData.data) {
          callForCommonParams = setInterval(instrumentation, 5000, {
            event_name: 'device_google_ids',
            event_section: 'pwa_app',
            properties: {
              device_id:   window && window.__dhpwa__ && window.__dhpwa__.clientData && window.__dhpwa__.clientData.fingerprint,
              gcm_id: subscription,
              pv_event: 'false'
            },
          });
          updateDB(true);
        }
      });
    }
  });
}

function handleDeniedSubscription() {
  getCommonParams(function (err, commonParams) {
    if(commonParams){
      clearInterval(callForCommonProperties);
      let clientId= commonParams.client_id;
      let client = commonParams.user_os_platform;
      client = client ? client : "pwa_android";
      let surpasscookie =  window &&  window.__dhpwa__ && window.__dhpwa__.clientData && window.__dhpwa__.clientData.signature;
      surpasscookie = surpasscookie ? surpasscookie : defaultSurpassCookie;
      return fetch(apiBasePattern + 'toggleSubscription?mode=pwa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'surpasscookie': surpasscookie
        },
        body:  JSON.stringify({"enabled": false,"clientId":clientId,"clientType": client})
      }).then(function(response) {
        if (!response.ok) {
          return "ERROR";
        }
        return response.json();
      }).then(function(responseData) {
        if (typeof responseData.data === undefined) {
          console.log('Bad response from server.');
        }
      });
    }
  })
}

function urlB64ToUint8Array(base64String) {
  let padding = '='.repeat((4 - base64String.length % 4) % 4);
  let base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  let rawData = window.atob(base64);
  let outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function instrumentation(obj){
  getCommonParams(function (err, properties) {
    if(properties){
      callForCommonParams && clearInterval(callForCommonParams);
      let date = Math.round((new Date()).getTime() / 1000);
      if(obj.properties){
        properties = extend(properties,obj.properties);
      }
      let eventObj = {
        event_section : obj.event_section,
        event_name: obj.event_name,
        epoch_time: date,
        //app_id : "DH_PWA",
        //app_family_id: "DH",
        client_id: properties.client_id,
      };
      delete properties.client_id;
      properties.event_section && delete properties.event_section;

      properties.app_id = "DH_PWA";
      properties.app_family_id = "DH";

      eventObj.properties = properties;
      let instruObj = [btoa(unescape(encodeURIComponent(JSON.stringify(eventObj))))];
      InsertSubscriptionToDB(instruObj);
    }
  })
}


function getSubscriptionObject(subscription){
  let subJSObject = JSON.parse(JSON.stringify(subscription)),
    endpoint = subJSObject.endpoint,
    auth = subJSObject.keys.auth,
    p256dh = subJSObject.keys.p256dh,
    deviceId = {ep: endpoint,
      dtp: p256dh,
      dta: auth
    };
  return deviceId;
}

function InsertSubscriptionToDB(insertValue){
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let open = indexedDB && indexedDB.open("instrumentation");
    let logErrors = window && !(window.__dhpwa__ && window.__dhpwa__.isProduction);
    if(open) {

      open.onupgradeneeded = function(){
        try {
          let db = open.result;
          db.createObjectStore("collection", { keyPath: "id"});
        } catch (ex) {
        }
      };

      open && (open.onsuccess = function () {
        let db = open.result;
        let dbTransaction;
        try {
          dbTransaction = db && db.transaction && db.transaction("collection", "readwrite");
        } catch(ex){
           logErrors && console.log("Error in insertSubscriptionDb:",ex);
        }
        let objectStore = dbTransaction && dbTransaction.objectStore("collection");
        let id = stringGen();
        let request = objectStore && objectStore.put({id: id, val: insertValue});
        request && (request.onerror = function (event) {
          logErrors && console.log("Error while writing into DB", event);
        });
      });
      open.onerror = function(event) {
        // Do something with request.errorCode!
      };
    }
}

function stringGen(){
  let text = " ";
  let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( let i=0; i < 9; i++ )
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
}


function getCommonParams(callback){
  let commonParams;
  let fromWindowObj = window.__dhpwa__ && window.__dhpwa__.commonParams;
  let fromLSObj =  window && window.localStorage && window.localStorage.getItem('commonParams4');
  let fromLS;
  if(!fromWindowObj && typeof fromLSObj === "string"){
    try{
      fromLS = JSON.parse(fromLSObj);
    }catch (err){

    }
  }
  let properties;
  let generic = {
    "user_app_ver": "generic",
    "user_connection": "generic",
    "user_language_primary": "generic",
    "user_os_platform": "pwa_android",
    "user_os_version": "generic",
    "user_browser": "generic",
    "user_browser_ver": "generic",
    "user_agent": "generic",
    "user_type": "pwa",
    "user_handset_maker": "generic",
    "user_handset_model": "generic",
    "user_device_screen_resolution": "generic",
    "user_os_name": "generic",
    "client_id": "generic"
  };
  try{
    commonParams =  (fromWindowObj || fromLS) && JSON.parse(JSON.stringify(fromWindowObj || fromLS));
    if(commonParams){
      return callback(null,commonParams);
    }
  }catch(er){

  }
  if(window && window.idb && !commonParams) {
    idb.open('personalization', 1).then(function (db) {
      db.transaction(["signature"], "readonly").objectStore("signature")
        .get("commonParams4").then(function (request) {
        let commonParams = request && request.val;
        try {
          properties = commonParams && JSON.parse(commonParams);
          return callback(null, properties || generic);
        } catch (err) {
          console.log("commonParams parse error from IndexedDb:", err);
          return callback(null, generic);
        }
      }).catch((er) => {
        console.log(" Error accessing db for user details:", er);
        return callback(null, generic);
      })
    })
  }
}

function sendGAEvents(action,label){
  var params = getGaParam();

  let gaObj = {
    hitType: 'event',
    eventCategory: 'Notification Prompt',
    eventAction: action,
    eventLabel: label || 'Default'
  };
  let userId = window && window.__dhpwa__  && window.__dhpwa__.clientData && window.__dhpwa__.clientData.clientid;
  userId && extend(gaObj,params);
  ga('send', gaObj);
}


function insertIntoDB(obj){
  let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  let open = indexedDB.open("registration");
  if(open) {
    open.onupgradeneeded = function () {
      try {
        let db = open.result;
        db && db.createObjectStore("register", {keyPath: "id"});
      } catch (ex) {
      }
    };

    open.onsuccess = function () {
      try {
        let db = open.result;
        let objectStore =  db && db.transaction && db.transaction("register", "readwrite").objectStore("register");
        let registerObj =  objectStore && objectStore.get("gcm_id");
        registerObj && (registerObj.onsuccess = function() {
          if(!registerObj.result){
            let request = objectStore.put(obj);
            request.onerror = function(event) {
              console.error("Error while writing into DB",event);
            };
          }else{
            let data = registerObj.result;
            data.val =obj.val;
            objectStore.put(data);
          }
        });
      } catch (ex) {
      }
    };
    open.onerror = function(event) {
      // Do something with request.errorCode!
    };

  }
}

function registerNotification(){
  try {
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let open = indexedDB && indexedDB.open("registration");
    if(open) {

      open.onupgradeneeded = function () {
        let db = open.result;
        db && db.createObjectStore("register", {keyPath: "id"});
      };

      open.onsuccess = function () {
        let db = open.result;
        if (db && db.objectStoreNames.length > 0) {
          let objectStore = db.transaction("register", "readwrite").objectStore('register');
          let registerObj = objectStore.get("gcm_id_register3");
          registerObj.onsuccess = function () {
            if (!registerObj.result) {
              let request = objectStore.put({id: "gcm_id_register3", val: {gcm_id_register3: false}});
              request.onerror = function (event) {
                console.log("Error while writing into DB", event);
              };
            }
          };
        }
      };
      open.onerror = function(event) {
        // Do something with request.errorCode!
      };

    }
  }catch(ex){
  }
}

function readFromDbWithKey(dbase,dataStore,value){
  try {
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let open = indexedDB.open(dbase);
    if(open){
      open.onupgradeneeded = function () {
        let db = open.result;
        db && db.createObjectStore(dataStore, {keyPath: "id"});
      };
      open.onsuccess = function () {
        let db = open.result;
        if (db && db.objectStoreNames.length > 0) {
          let objectStore = db.transaction(dataStore, "readonly").objectStore(dataStore);
          let registerObj = objectStore.get(value);
          registerObj.onsuccess = function () {
            let gcm_id = registerObj.result;
            let gcmid_val = gcm_id && gcm_id.val;
            gcmid_val && !(window && window.subscription) && (window.subscription = gcmid_val);
          };
        }
      };
      open.onerror = function(event) {
        // Do something with request.errorCode!
        console.log(" Errored to fetch subscription from db:",event);
      };

      //used to delay the operation so that the promise value is set in subscription.
      let counter = 0;
      if (counter < 1000) {
        counter = counter + 1;
      }

    }
  }catch(ex){}
}

function readFromDbAndSendSubscription(dbase,dataStore,value){
  try{
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let open = indexedDB.open(dbase);
    if(open) {
      open.onupgradeneeded = function () {
        let db = open.result;
        db && db.createObjectStore(dataStore, {keyPath: "id"});
      };
      open.onsuccess = function () {
        let db = open.result;
        if (db && db.objectStoreNames.length > 0) {
          let objectStore = db.transaction(dataStore, "readonly").objectStore(dataStore);
          let registerObj = objectStore.get(value);
          if(registerObj) {
            registerObj.onsuccess = function () {
              let gcm_id = registerObj && registerObj.result && registerObj.result.val;
              if (gcm_id && !gcm_id.gcm_id_register3) {
                if (!window.subscription) {
                  readFromDbWithKey("registration", "register", "gcm_id");
                }
                if(!window.subscription){
                  window.subscription = window && window.localStorage &&  window.localStorage.getItem("gcm_id");
                }
                callForClientId = setInterval(subscriptionCall, 3000);
              }
            };
            registerObj.onerror = function(event) {
              // Do something with request.errorCode!
            };
          }
        }
      };
      open.onerror = function(event) {
        // Do something with request.errorCode!
      };

    }
  }catch(ex){}
}

function subscriptionCall() {
  getCommonParams(function (err,commonParams) {
    let clientId = commonParams && commonParams.client_id;
    if(clientId) {
      callForClientId && clearInterval(callForClientId);
      window.subscription && sendSubscription(window.subscription, clientId);
    }
  })
}

function updateDB(bool){
  try {
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let open = indexedDB.open("registration");
    if(open) {
      open.onupgradeneeded = function () {
        let db = open.result;
        db && db.createObjectStore("register", {keyPath: "id"});
      };

      open.onsuccess = function () {
        let db = open.result;
        if (db && db.objectStoreNames.length > 0) {
          let objectStore = db.transaction("register", "readwrite").objectStore('register');
          let registerObj = objectStore.get("gcm_id_register3");
          if(registerObj) {
            registerObj.onsuccess = function () {
              let data = registerObj.result;
              data.val = {gcm_id_register3: bool};
              objectStore.put(data);
            };
            registerObj.onerror = function(event) {
              // Do something with request.errorCode!
            };

          }
        }
      };
      open.onerror = function(event) {
        // Do something with request.errorCode!
      };

    }
  }catch(ex){}
}

function clearSubscriptionFromDB() {
  if (typeof(Storage) !== "undefined") {
    window && window.localStorage && window.localStorage.setItem("gcm_id", "");
  }
  try {
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    let open = indexedDB.open("registration");
    if(open) {
     open.onsuccess = function () {
        let db = open.result;
        if (db && db.objectStoreNames.length > 0) {
          db.transaction("register", "readwrite").objectStore('register').delete("gcm_id");
          updateDB(false);
        }
      };
      open.onerror = function(event) {
        // Do something with request.errorCode!
      };

    }
  }catch(ex){}
}

function refreshPage(a){
  var params = getGaParam();
  sendGaEvent(params,'Click')
  a && (a.style.display = 'none');
  window.location.reload(true);
}

function sendGaEvent(params,eventType) {
  ga && ga('set',params)
  ga && ga('send', {
    hitType: 'event',
    eventCategory: 'SW Refresh',
    eventAction: eventType,
    eventLabel: window.location.pathname
  });
}

function getGaParam() {
  var urlParam = (window && window.location && window.location.pathname && window.location.pathname.split('/'));
  var lang = (urlParam[3] || 'english' );
  var res = (Math.round(screen.width*window.devicePixelRatio)+'x'+Math.round(screen.height*window.devicePixelRatio));
  var clientId = window && window.__dhpwa__  && window.__dhpwa__.clientData && window.__dhpwa__.clientData.clientid;

  return {dimension1:lang,dimension4:res,dimension5:'PWA',dimension6:clientId,userId:clientId}
}

/*
function createDB(idb, databaseName, storeName, keyPath) {
  idb.open(databaseName, 1, function(upgradeDB) {
    let store = upgradeDB.createObjectStore(storeName, {
      keyPath: keyPath
      //autoIncrement : true
    });
  });
}

function addNotification(idb, title, icon, targetUrl, notId, id) {
  let  date = new Date().getTime();
  let epaper = targetUrl && targetUrl.split("-epaper-")[0];
  let epaperArr =  epaper && epaper.split("/")[6];
  let nPaper = epaperArr && epaperArr.replace("+"," ");
  let dbObj = {nId: id, title: title, icon: icon, targetUrl: targetUrl, date: date, notId:notId, nPaper:nPaper || ''};
  InsertToDB(idb, 'pushNotification', 'notifications', dbObj);
}


function removeNotification(idb, id) {
  /!*
    idb.open('pushNotification', 1).then(function(db) {
      let request = db.transaction(["notifications"], "readwrite")
        .objectStore("notifications")
        .delete(id);
    }).then(function(items) {
    });
  *!/
}

function instrumentation(idb, payload){
  if(payload) {
    let message_v3 = payload && self.decodeURIComponent(payload.message_v3);
    try {
      message_v3 = message_v3 && JSON.parse(message_v3);
    } catch (err) {
      console.log("Parse error");
    }

    let notId = message_v3 && message_v3.baseInfo.id,
      deeplinkUrl = message_v3 && message_v3.deeplinkUrl,
      itemId = deeplinkUrl && deeplinkUrl.split("-newsid-")[1],
      notification_type = payload.type,
      date = Math.round((new Date()).getTime() / 1000);

    idb.open('personalization', 1).then(function (db) {
      db.transaction(["signature"], "readonly").objectStore("signature")
        .get("commonParams4").then(function (request) {
        let commonParams = request && request.val;
        let properties;
        try {
          properties = JSON.parse(commonParams);
        } catch (err) {
          console.log("commonParams parse error from IndexedDb:", err);
          try {
            properties = JSON.parse(localStorage.getItem("commonParams4"));
          } catch (ex) {
            console.log("commonParams parse error from localStorage:", ex)
          }
        }
        if (properties) {
          properties.notification_id = notId;
          properties.itemId = itemId;
          properties.notification_type = notification_type;
          properties.notification_delivery_mechanism = "PUSH";
          properties.pv_event = "false";

          let eventObj = {
            event_section: "pwa_notification",
            event_name: "notification_delivered",
            epoch_time: date,
            client_id: properties.client_id,
          };
          delete properties.client_id;
          eventObj.properties = properties;
          fireToInstrument(eventObj);
        }
      });
    }).then(function (items) {
    });
  }
}

function fireToInstrument(data) {
  fetch(apiBasePattern + 'sendInstrumentation?mode=pwa', {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({eventArray: [data]})
  }).then(function (response) {
    if (!response.ok) {
      return "ERROR";
    }
    return response.json();
  }).then(function (responseData) {
  });
}

function InsertToDB(idb, databaseName, storeName, insertValue){
  idb.open(databaseName, 1).then(function(db) {
    let tx = db.transaction([storeName], 'readwrite');
    let store = tx.objectStore(storeName);
    store.put(insertValue);
  }).then(function(items) {
    // Use beverage data
  });
}*/

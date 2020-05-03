var conf = {
  "version": "1.2.28",
}
var appVersion = conf.version;

const isBrowser = typeof window !== 'undefined';

var self = isBrowser ? self : this;
var sw = self && self.toolbox;
var CACHE_NAME = 'dh-cache';
var delayInRetry = 300;
var noOfRetry = 4;
var apiBasePattern = '/api/v100/';
var urlsToCache = [
  'index.html?mode=pwa&v='+appVersion,
  'indexLite.html?mode=pwa&v='+appVersion,
  'indexDesktop.html?mode=pwa&v='+appVersion,
];
var cacheArray = ['dhapis', 'dh-cache'];// ['dhimagecaches','dhapis','dhassets'];

if(self && self.importScripts){
  self.importScripts('assets/idb/lib/idb.js?mode=pwa&v='+appVersion);
  self.importScripts('assets/sw-toolbox/sw-toolbox.js?mode=pwa'+appVersion, 'assets/sw-toolbox/toolbox-script.js?mode=pwa&v='+appVersion);
}

function isFunction(variableToCheck){
  //If our variable is an instance of "Function"
  if(variableToCheck && variableToCheck instanceof Function) {
    return true;
  }
  return false;
}

function fetchAndCache(url) {
    return fetch(url)
      .then(function(response) {
        // Check if we received a valid response
        if (!response.ok) {
         // throw Error(response.statusText);
        }
        return caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(url, response.clone());
            return response;
          });
      })
      .catch(function(error) {
        // You could return a custom offline 404 page here
      });
}


function fetchOnly(url) {
    return fetch(url)
      .then(function(response) {
        // Check if we received a valid response
        if (!response.ok) {
        //  throw Error(response.statusText);
        }
        return response;
      })
      .catch(function(error) {
        // You could return a custom offline 404 page here
      });
}



if(self) {
  isFunction(self.addEventListener) && self.addEventListener('install', function (event) {
    self.skipWaiting();
    if(event) {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function (cache) {
            return cache.addAll(urlsToCache);
          })
      );
    }
  });

  isFunction(self.addEventListener) && self.addEventListener('activate', function (event) {
    self.skipWaiting();
    // to be reviewed, added line: self.createDB(idb, "pushNotification", "notifications", "nId"),
    setTimeout(()=>{
      self.createDB(idb, "pushNotification", "notifications", "nId");
    },2000)

    event.waitUntil(
      caches.keys().then(function(keys){
        return Promise.all(keys.map(function(key, i){
          if(cacheArray.includes(key)){
            caches.delete(keys);
          }
        }))
      })
    )
  });

  // isFunction(self.addEventListener) && self.addEventListener('fetch', function (event) {
  //   if(event) {
  //     var re1 = new RegExp("^https?://" + location.host,"g");
  //     var re2 = new RegExp("^https?://" + "[A-Za-z0-9.]*\.newshunt\.com","g");
  //     if(event.request.url.includes("mode=wap")){
  //       //return event.respondWith(fetchOnly(event.request));
  //       return ;
  //     }

  //     if(event.request && event.request.method !== "GET"){
  //       return ;//event.respondWith(fetchOnly(event.request));
  //     }
  //   //   if(event.request.url.match(re1) || event.request.url.match(re2)){
  //   //     return event.respondWith(
  //   //       caches.match(event.request)
  //   //         .then(function (response) {
  //   //           if(response){
  //   //             fetchAndCache(event.request);
  //   //             return response;
  //   //           }
  //   //           return fetchAndCache(event.request);
  //   //         })
  //   //     );
  //   //  }
  //     return;
  //   }
  // });
/*

  isFunction(self.addEventListener) && self.addEventListener('message', function (event) {
    //console.log('From SW: message Event------->', event);
  });
*/


  isFunction(self.addEventListener) && self.addEventListener('push', function (e) {

    let title = 'New Notification Received from Dailyhunt';
    let icon = '/assets/img/icon-512x512.png';
    let targetUrl = 'https://m.dailyhunt.in/news';
    let notId;
    let dt = new Date();
    let mode;
    let secs = dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours());
    let message_v3="";
    if (e && e.data) {
      let payload = e.data.json();
      message_v3 = payload && payload.message_v3 && self.decodeURIComponent(payload.message_v3);
      try{
      message_v3 = message_v3 && JSON.parse(message_v3);
      }catch(ex){
        console.log(" Error parsing the message_ve:",ex,message_v3);
      }
      message_v3 && (message_v3.storyId = extractIdFromUrl(message_v3.deeplinkUrl));
      message_v3 && (message_v3.mode = extractQueryFromUrl(message_v3.deeplinkUrl,'mode'));
      notId =  message_v3 && message_v3.baseInfo && message_v3.baseInfo.id;
      let uniMsg = message_v3 && message_v3.baseInfo && message_v3.baseInfo.uniMsg;
      let utmValue = "utm_source=Notification&utm_campaign=" + (notId || "notAvailable");
      title = uniMsg ? uniMsg : message_v3.baseInfo.msg;
      title = title.replace(/["+"]/gi, ' ');
      if(!message_v3.baseInfo.bigImageLinkV2){
        icon = (message_v3 && message_v3.baseInfo && message_v3.baseInfo.imageLinkV2) ? message_v3.baseInfo.imageLinkV2 : icon;
      }
      targetUrl = message_v3.deeplinkUrl ? message_v3.deeplinkUrl : targetUrl;
      message_v3.storyId && self.addNotification({
        idb:idb,
        title:title,
        icon:message_v3.baseInfo.inboxImageLink,
        targetUrl:targetUrl,
        notId:notId,
        nId:secs,
        mode: message_v3.mode,
        storyId: message_v3.storyId
      });
      self.logNotificationDeliveredEvent(payload);

      //let eventLabel = notId + "_" + message_v3.storyId;
      //sendGAAnalyticsEvent("Notification", "Received", eventLabel);
    }

    let options = {
      //tag: 'id1',
      icon: icon,
      body : title,
      badge: '/assets/img/homescreen48.png',
      image: message_v3.baseInfo.bigImageLinkV2,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: secs,
        targetUrl : targetUrl,
        notId : notId
      }
    };

    self.clients.matchAll({includeUncontrolled: true, type: 'window'})
      .then(all => all.map(client => client.postMessage({"notify":true,"url":targetUrl,"notId": notId})));

    self.registration.showNotification("Dailyhunt Lite",options)
  });

  isFunction(self.addEventListener) && self.addEventListener('notificationclose', function (e) {
    let notification = e.notification;
    let primaryKey = notification.data.primaryKey;
    e.notification.close();
  });

  isFunction(self.addEventListener) && self.addEventListener('notificationclick', function (event) {
    let notification = event.notification;
    let url = notification.data.targetUrl;

    if (url.indexOf("?") != -1) {
          url += (url.includes("utm_source") ? "" : "&utm_source=Notification") + "&utm_campaign=" + notification.data.notId + "&label=System Tray";
        } else {
          url += "?"+ (url.includes("utm_source") ? "" : "utm_source=Notification&") + "utm_campaign=" + notification.data.notId + "&label=System Tray";
        }

    if(!url.includes('mode=')){
      let char = url.includes('?') ? '&' : '?';
      url += (char + 'mode=pwa');
    }

    let primaryKey = notification.data.primaryKey;
    //self.removeNotification(idb, primaryKey);
    self.logNotificationOpenEvent(notification);

    let notificationId = notification.data.notId;
    let itemId = extractIdFromUrl(notification.data.targetUrl);
    let eventLabel = notificationId + "_" + itemId;
    sendGAAnalyticsEvent("Notification", "Opened", eventLabel);

    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          // If so, just focus it.
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, then open the target URL in a new window/tab.
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
}

//From serviceworkerscript

function createDB(idb, databaseName, storeName, keyPath) {
  idb.open(databaseName, 1, function(upgradeDB) {
    let store = upgradeDB.createObjectStore(storeName, {
      keyPath: keyPath
      //autoIncrement : true
    });
  });
}

function addNotification(notifObj){//idb, title, icon, targetUrl, notId, id) {
  let epaper = notifObj.targetUrl && notifObj.targetUrl.split("-epaper-")[0];
  let epaperArr =  epaper && epaper.split("/")[6];
  let nPaper = epaperArr && epaperArr.replace("+"," ");
  notifObj.date =  new Date().getTime();
  notifObj.nPaper = nPaper || '';
  self.InsertToDb(idb, 'pushNotification', 'notifications', notifObj);
}

function extractIdFromUrl(url) {
   let itemIdStr = url && url.split("-newsid-")[1],
    itemId =  itemIdStr && itemIdStr.split('?')[0];
    return itemId;
}

function extractQueryFromUrl(url,param) {
   let queryStr = url && url.split("?")[1];

   let queryObj = queryStr && parseQuery(queryStr);
    return queryObj && queryObj[param];
}

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

function InsertToDb(idb, databaseName, storeName, insertValue){
  let idbFunctions = {};
  caches.delete('dhimagecaches').then(function(boolean) {
    // your cache is now deleted
    //console.log(" Cleared the dhimagecaches-->",boolean);
  });

  var req = indexedDB.deleteDatabase("sw-toolbox-dhimagecaches");
  req.onsuccess = function () {
    //console.log("Deleted database successfully");
  };
  req.onerror = function () {
    console.log("Couldn't delete database sw-toolbox-dhimagecaches");
  };
  req.onblocked = function () {
    console.log("Couldn't delete database due to the operation being blocked sw-toolbox-dhimagecaches");
  };
/*

  var req2 = indexedDB.deleteDatabase("sw-toolbox-dhassets");
  req2.onsuccess = function () {
    console.log("Deleted database successfully2");
  };
  req2.onerror = function () {
    console.log("Couldn't delete database2");
  };
  req2.onblocked = function () {
    console.log("Couldn't delete database due to the operation being blocked2");
  };
*/

  const dbPromise = idb && idb.open(databaseName,1,(db)=>{
    try {
      db && db.createObjectStore(storeName, {
        keyPath: 'nId'
      })
    }catch(ex){
       console.log(" Error creating /opening:",ex);
    }
  });
  if(dbPromise){
    idbFunctions.set = function (key,val) {
      try {
        return dbPromise && dbPromise.then(db => {
          const tx = db && db.transaction && db.transaction(storeName, 'readwrite');
          tx && tx.objectStore(storeName).put({nId: key, val: val});
          return tx && tx.complete;
        });
      } catch (ex) {
        console.log(" Error accessing data store",ex);
      }
    }
    var stringified = JSON.stringify(insertValue);
    idbFunctions.set(insertValue.storyId || insertValue.nId,stringified).then((resp)=>{
      //console.log(" Resp after writing to db:",resp);
    }).catch((err)=>{
      console.log(" Error writing to db:",err);
    })
  }
}

function fetchRetry(url, delay, limit, fetchOptions = {}) {
  return new Promise((resolve,reject) => {
    function success(response) {
      resolve(response);
    }
    function failure(error){
      limit--;
      if(limit){
        setTimeout(fetchUrl,delay)
      }
      else {
        // this time it failed for real
        reject(error);
      }
    }
    function finalHandler(finalError){
      throw finalError;
    }
    function fetchUrl() {
      return fetch(url,fetchOptions)
        .then(success)
        .catch(failure)
        .catch(finalHandler);
    }
    fetchUrl();
  });
}

// Analytics related events

function fetchCommonParams(idb, callback) {
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
    }).catch((er)=>{
      console.log(" Error accessing db for user details:",er);
      return callback(null, generic);
    })
  })
}

function logNotificationDeliveredEvent(payload){
  if(payload) {
    let message_v3 = payload && self.decodeURIComponent(payload.message_v3);
    try {
      message_v3 = message_v3 && JSON.parse(message_v3);
    } catch (err) {
      console.log("Parse error");
    }

    let notId = message_v3 && message_v3.baseInfo.id,
      deeplinkUrl = message_v3 && message_v3.deeplinkUrl,
      itemId =  extractIdFromUrl(deeplinkUrl),
      notification_type = payload.type,
      date = Math.round((new Date()).getTime() / 1000);
    self.fetchCommonParams(idb,function (err,properties) {
      if (properties) {
        properties.notification_id = notId;
        properties.item_id = itemId;
        properties.notification_type = deeplinkUrl.includes("-newsid-")
          ? "TYPE_OPEN_NEWSITEM"
          : "";
        properties.notification_delivery_mechanism = "PUSH";
        properties.pv_event = "false";
        properties.app_id = "DH_PWA";
        properties.app_family_id = "DH";

        let eventObj = {
          event_section: "pwa_notification",
          event_name: "notification_delivered",
          epoch_time: date,
          // app_id : "DH_PWA",
          // app_family_id: "DH",
          client_id: properties && properties.client_id,
        };

        delete properties.client_id;
        eventObj.properties = properties;
        fireToInstrument(eventObj);
      }
    })
  }
}

function logNotificationOpenEvent(notificationOpenPayload){
  if(notificationOpenPayload) {
    console.log("SW", notificationOpenPayload);
    let notId = notificationOpenPayload.data.notId,
      deeplinkUrl = notificationOpenPayload.data.targetUrl,
      itemId =  extractIdFromUrl(deeplinkUrl),
      date = Math.round((new Date()).getTime() / 1000);
    self.fetchCommonParams(idb,function (err,properties) {
      if (properties) {
        properties.notification_id = notId;
        properties.itemId = itemId;
        properties.notification_delivery_mechanism = "PUSH";
        properties.pv_event = "false";
        properties.app_id = "DH_PWA";
        properties.app_family_id = "DH";
        properties.notification_type = deeplinkUrl.includes("-newsid-")
          ? "TYPE_OPEN_NEWSITEM"
          : "";
        properties.notification_layout= "NOTIFICATION_TYPE_SMALL";
        properties.notification_action= "click";

        let eventObj = {
          event_section: "pwa_notification",
          event_name: "notification_action",
          epoch_time: date,
          client_id: properties && properties.client_id,
        };

        delete properties.client_id;
        eventObj.properties = properties;
        fireToInstrument(eventObj);
      }
    })
  }
}

function fireToInstrument(data) {
  fetchRetry(apiBasePattern + 'sendInstrumentation?mode=pwa',300,4, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({eventArray: [data]})
  }).then(function(response){
    if(!response.ok){
      return "ERROR";
    }
    return response;
  })
    .then(function(response){
     // console.log(response);
    })
    .catch(function(error){
      console.log(error);
    });
}

function sendGAAnalyticsEvent(category, action, label) {
  var trackingId = 'UA-64780041-3';//'UA-112546024-1';//'UA-64780041-3'
  self.fetchCommonParams(idb,function (err,properties) {
    var payloadData = {
      v:1,
      t: 'event',
      ec: category,
      ea: action,
      el: label,
      cid: properties && properties.client_id,
      tid: trackingId,
      cd5:'PWA'
    };

    var payloadString = Object.keys(payloadData)
      .filter(function(analyticsKey) {
        return payloadData[analyticsKey];
      }).map(function(analyticsKey) {
        return analyticsKey + '=' + encodeURIComponent(payloadData[analyticsKey]);
      }).join('&');

    fetchRetry('https://www.google-analytics.com/collect',delayInRetry,noOfRetry, {
      method: 'post',
      body: payloadString
    }).then(function(response){
        if(!response.ok){
          throw new Error('failed!');
        }
        return response;
      })
      .then(function(response){
        //console.log("response is:",response);
      })
      .catch(function(error){
        //console.log("error is:",error);
      });

    return;
  })
}

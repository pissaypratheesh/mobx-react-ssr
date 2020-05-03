/**
* Copyright 2016 Google Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

(function(global) {
  global.userData = {};
  idb && idb.open('personalization', 1).then(function (db) {
    db.transaction(["signature"], "readonly").objectStore("signature")
      .getAll().then(function (request) {
      request.map((obj)=>{
        global.userData[obj.id] = obj.val;
      })
    }).catch((er)=>{
      console.log("Error accessing db for user details:",er);
    })
  }).catch((ee)=>{
    console.log("Error accessing db:",ee);
  })
  global.getDataPumpedReqConfig = function(req){
    idb && idb.open('personalization', 1).then(function (db) {
      db.transaction(["signature"], "readonly").objectStore("signature")
        .getAll().then(function (request) {
        request.map((obj)=>{
          global.userData[obj.id] = obj.val;
        })
      }).catch((er)=>{
        console.log("Error accessing db for user details:",er);
      })
    }).catch((ee)=>{
      console.log("Error accessing db:",ee);
    })

    var url = req.url;
    var query = url.split('?');
    var qParams = query[1] ? ("&"+query[1]) : '';
    var myHeaders = new Headers();
    qParams = ('?mode=pwa' + qParams);
    for (var key in global.userData) {
      if (global.userData.hasOwnProperty(key)) {
        myHeaders.append(key, global.userData[key]);
      }
    }
    var config = { method: 'GET',
      headers: myHeaders,
      mode: 'cors',
      cache: 'default'
    };
    return {
      config: config,
      qParams: qParams,
      url: query[0]
    }
  }

  'use strict';
  global.toolbox.router.get('/',function (req, val, option) {

    var url = req.url;
    if(url.includes("mode=wap")) {
      return toolbox.networkFirst(new Request(url), val, option);
    }
    var reqConfig = global.getDataPumpedReqConfig(req);
    return toolbox.networkFirst(new Request("/news/india" + reqConfig.qParams, reqConfig.config), val, option);
  });

  global.toolbox.router.get('/news',function (req, val, option) {
    var reqConfig = global.getDataPumpedReqConfig(req);
    return toolbox.networkFirst(new Request("/news/india" + reqConfig.qParams, reqConfig.config), val, option);
  });

  global.toolbox.router.get('/api/v100/*', global.toolbox.networkFirst, {
    cache: {
      name: 'dhapis',
      maxEntries: 100,
      maxAgeSeconds: 604800 //1 week: 60 * 60 * 24 * 7
    }
  });

  global.toolbox.router.get('/assets/*', global.toolbox.cacheFirst, {
    cache: {
      name: 'dhassets',
      maxEntries: 50,
      maxAgeSeconds: 604800 //1 week: 60 * 60 * 24 * 7
    }
  });

/*

  global.toolbox.router.get('/navipage/*', global.toolbox.cacheFirst, {
    cache: {
      name: 'dhassets',
      maxEntries: 50,
      maxAgeSeconds: 604800 //1 week: 60 * 60 * 24 * 7
    }
  });
*/

  global.toolbox.router.get('/build/*', global.toolbox.networkFirst, {
    cache: {
      name: 'dhchunks',
      maxEntries: 70,
      maxAgeSeconds: 86400 //7 day: 60 * 60 * 24 * 7
    }
  });


  global.toolbox.router.get('/buildLite/*', global.toolbox.networkFirst, {
    cache: {
      name: 'dhchunks',
      maxEntries: 70,
      maxAgeSeconds: 86400 //7 day: 60 * 60 * 24 * 7
    }
  });


  global.toolbox.router.get('/bundle.js', global.toolbox.networkFirst, {
    cache: {
      name: 'dhapis',
      maxEntries: 70,
      maxAgeSeconds: 86400 //1 day: 60 * 60 * 24 * 1
    }
  });

  global.toolbox.router.get('/det_bundle.js', global.toolbox.fastest, {
    cache: {
      name: 'dhapis',
      maxEntries: 70,
      maxAgeSeconds: 86400 //1 day: 60 * 60 * 24 * 1
    }
  });

  global.toolbox.router.get('/swHelper.js',function (req, val, option) {
    var reqConfig = global.getDataPumpedReqConfig(req);
    return toolbox.networkFirst(new Request("/swHelper.js" + reqConfig.qParams, reqConfig.config), val, option);
  });

  // We want no more than 100 images in the cache. We check using a cache first strategy
  global.toolbox.router.get(/\.(?:png|svg|ttf|gif|jpg|webp)$/, global.toolbox.cacheFirst, {
    cache: {
      name: 'dhimagecaches',
      maxEntries: 40,
      maxAgeSeconds: 10*86400*1000
    }
  });

  // global.toolbox.router.get('*',function (req, val, option) { 
  //   var newUrl = req.url;
  //   if(!newUrl.includes("mode=pwa") && !newUrl.includes("mode=wap")) {
  //     newUrl = (newUrl.indexOf("?") !== -1) ? (newUrl + "&mode=pwa") : (newUrl + "?mode=pwa");
  //   }
  //   let requestOptions = {};
  //   if(newUrl.includes("mode=wap")){
  //     requestOptions.redirect = 'follow';
  //     requestOptions.followRedirect = true;
  //     requestOptions.followAllRedirects = true;
  //     req.redirect = 'follow';
  //   }
  //   req.redirect = 'follow'; //Hacky way doing this to solve the problem of tampered details url with not meddling with the mode=wap/pwa logic

  //   var reqConfig = global.getDataPumpedReqConfig(req);
  //   return toolbox.networkFirst(new Request(reqConfig.url + reqConfig.qParams, reqConfig.config), val, option);
  // });

  global.toolbox.router.default = null;


})(self);

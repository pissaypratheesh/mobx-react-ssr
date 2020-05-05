/**
 * Created by pratheesh on 12/6/17.
 */
const isBrowser = typeof window !== 'undefined'

import {apiBasePattern} from "@config/constants"
var _ = require('underscore');
var cookies = require('js-cookie');
var appendQuery = require('append-query')
const queryString = require('query-string');
_.mixin(require('@utils/mixins'));

const URLParamsExtractor =  {

  article(params ,cb){
    let url = params.details ? [] : [
        {url: "https://api-news.dailyhunt.in/api/v100/constants", method: "get", params},
      ],
      updateFunction = "updateDetailsById";
      return cb({
        url,
        updateFunction
      })
    },

}


export default URLParamsExtractor;

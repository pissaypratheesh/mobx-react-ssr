// API
import pumpData from "./pumpData";
import routeComponentMap from '../../../config/routeComponentMap'
var _ = require('underscore')

export default function(app) {

  _.forEach(routeComponentMap,(val,path)=>{
      app.get(path,(req, res, next) => {
          req.pattern = path;
          next();
      },pumpData)
  } );
}

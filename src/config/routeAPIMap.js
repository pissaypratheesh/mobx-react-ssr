/**
 * Created by pratheesh on 8/6/17.
 */
import URLParamsExtractor from './URLParamsExtractor';

//Why this file: List of parallel calls to be made before rendering a route url
export default function(params, pattern, cb) {
  switch (pattern){
    case  "/article" :
      return URLParamsExtractor['article'](params, function (urlObj) {
        cb({
          urlList: urlObj.url,
          updateFunction: urlObj.updateFunction,
          waterfall: urlObj.waterfall
        })
      });
      break;
  }
}



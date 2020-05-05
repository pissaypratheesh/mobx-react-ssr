/**
 * Created by pratheesh on 8/6/17.
 */
import URLParamsExtractor from './URLParamsExtractor';
const isBrowser = typeof window !== 'undefined'
//Why this file: List of parallel calls to be made before rendering a route url
export default function(params, pattern, cb) {
  switch (isBrowser ? pattern.url : pattern){
    case  "/home/article" :
      return URLParamsExtractor['article'](params, function (urlObj) {
        cb({
          urlList: urlObj.url,
          updateFunction: urlObj.updateFunction,
          waterfall: urlObj.waterfall
        })
      });
      break;

    case "/home":
    default:
      console.log("must come heree-->",params,pattern)
      return cb({
          urlList: [],
          updateFunction: "updateDetailsById",
          waterfall: []
        })
      break;
  }
}



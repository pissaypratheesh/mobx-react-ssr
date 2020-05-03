// API
const path = require('path');
import {assetsExpiry,bundleExpiry} from "../../../src/config/constants";

const servers = [{id: 1, name: 'a'}, {id: 2, name: 'b'}, {id: 3, name: 'c'}];

export default function(app) {


  app.get("/swhelper.js", function(req, res) {
    let pathToFile =  path.join( __dirname, '../../../src/swHelper.js');
    res.setHeader('Cache-Control', 'public, max-age=' + bundleExpiry);
    return res.sendFile(pathToFile);
  });

  app.get("/sw.js", function(req, res) {
    res.set({
      "Content-Type": "application/javascript",
      "Cache-Control": "private, no-cache, must-revalidate, max-age=0",
      "Service-Worker-Allowed": "/",
      Expires: "-1",
      Pragma: "no-cache"
    });
    return res.sendFile(path.join(__dirname + "../../../../src/sw.js"));
  });



  app.get('/api/stats', (req, res) => {
    setTimeout(() => {
      res.json({
        // error: 'server error message',
        status: 'online',
        servers
      });
    }, 3000);
  });

  app.post('/api/servers', (req, res) => {
    if (!req.body.name) {
      return res.json({
        error: 'cannot add server with empty name'
      });
    }
    return setTimeout(() => {
      servers.push({
        id: servers[servers.length - 1].id + 1,
        name: req.body.name
      });
      res.json({
        success: true
      });
    }, 3000);
  });
}

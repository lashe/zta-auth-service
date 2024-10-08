let jwt = require("jsonwebtoken");
const config = require("../../config/jwt");
const { jsonFailed } = require("../../utils");
const blacklistedTokens = new Set();

let middleware = {
  auth:(req, res, next) => {
  //Do your session checking...
  // check for token present in request body or header
  var tok =
    req.headers["access-token"] ||
    req.body["access-token"] ||
    req.headers.authorization ||
    req.header.Authorization;
  if (!tok) return jsonFailed(res, {}, "Access Denied, No token provided.", 403);
  else if (req.headers["access-token"]) {
    var token = tok.split(" ")[1];
  } else if (req.headers.authorization) {
    var token = tok.split(" ")[1];
  } else if (req.headers.Authorization) {
    var token = tok.split(" ")[1];
  } else {
    var token = tok;
  }
  if (!token) return jsonFailed(res, {}, "Access Denied, No token provided.", 403);

    if (blacklistedTokens.has(token)) {
      return jsonFailed(res, {},"Access Denied, No token provided.", 401);
  }

  // verify token
  jwt.verify(token, config.jwt_secret, (err, decoded) => {
    if (err) {
      return jsonFailed(res, {}, "Token Expired.", 403);
    }
    req.user = decoded;
    
    // handover to the next function
    next();
  });
},

unAuth: (req, res, next) => {
  // check for token present in request body or header
  var tok =
    req.headers["access-token"] ||
    req.body["access-token"] ||
    req.headers.authorization ||
    req.header.Authorization;
  if (!tok) return jsonFailed(res, {}, "Access Denied, No token provided.", 403);
  else if (req.headers["access-token"]) {
    var token = tok.split(" ")[1];
  } else if (req.headers.authorization) {
    var token = tok.split(" ")[1];
  } else if (req.headers.Authorization) {
    var token = tok.split(" ")[1];
  } else {
    var token = tok;
  }
  if (!token) return jsonFailed(res, {}, "Access Denied, No token provided.", 403);

  // blacklist token and clear session to prevent re-entry attack
  blacklistedTokens.add(token);
    req.session.destroy((err) => {
      if (err) {
        return jsonFailed(res, {}, "Unable to log out", 500);
      }
      // handover to the next function
      next();
  });
}

};
module.exports = middleware;

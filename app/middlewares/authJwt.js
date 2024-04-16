const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({
          message: "Token expired!",
          expired: true
        });
      } else {
        return res.status(401).send({
          message: "Unauthorized!",
          expired: false
        });
      }
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();

    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const roles = await Role.find({ _id: { $in: user.roles } }).exec();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Admin Role!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const isModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();

    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const roles = await Role.find({ _id: { $in: user.roles } }).exec();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Moderator Role!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};


const authJwt = {
  verifyToken,
  isAdmin,
  isModerator
};
module.exports = authJwt;
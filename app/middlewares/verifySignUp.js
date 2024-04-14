const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Username
    // const usernameUser = await User.findOne({ username: req.body.username });

    // if (usernameUser) {
    //   console.log("Failed! Username is already in use!");
    //   return res.status(400).send({ message: "Failed! Username is already in use!" });
    // }

    // Email
    const emailUser = await User.findOne({ email: req.body.email });

    if (emailUser) {
      console.log("Failed! Email is already in use!");
      // console.log(res.socket.rawHeaders.every(), res.url, res.method, res.body);
      // for(let i=0; i<=res.socket.rowHeaders.length; i++){
      //   console.log(res.socket.rowHeaders[i]);
      // }
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};


checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
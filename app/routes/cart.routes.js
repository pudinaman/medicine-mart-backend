const express = require("express");
const cartController = require("../controllers/cart.controller");
const authJwt = require("../middlewares/authJwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://wayumart-9e794.web.app");

    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

//Admin Routes
app.get('/getAllCarts', [authJwt.verifyToken, authJwt.isAdmin], cartController.getAllCarts);

//User Routes
app.put('/cart', authJwt.verifyToken, cartController.updateCart);

app.get('/cart/:userId', authJwt.verifyToken, cartController.getCart);
app.post('/addCart', authJwt.verifyToken, cartController.addToCart);
app.delete('/removeFromCart/:userId', authJwt.verifyToken, cartController.removeFromCart);
app.delete('/cart/:userId', cartController.deleteCart);

};

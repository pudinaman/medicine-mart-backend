const productController = require("../controllers/product.controller");
const authJwt = require("../middlewares/authJwt");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin","http://localhost:3000");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
 
//Admin Routes
// app.post('/products', [authJwt.verifyToken, authJwt.isAdmin], productController.createProduct);
app.put('/products', productController.createProduct);

app.get('/products/popularProducts', productController.getProductsByMaxTotalOrders);

app.get('/products',  productController.getAllProducts);
app.get('/products/:id',  productController.getProductById);
app.patch('/products/:id', authJwt.verifyToken, productController.updateProduct);
app.delete('/products/:id', authJwt.verifyToken, productController.deleteProduct);

app.get('/products/similar/:category',  productController.getSimilarProducts);

app.post('/products/:id/reviews', productController.postReview);
app.get('/products/:id/reviews', productController.getReviews);


};
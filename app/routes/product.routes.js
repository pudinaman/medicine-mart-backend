const productController = require("../controllers/product.controller");
const authJwt = require("../middlewares/authJwt");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
 
//Admin Routes
app.post('/products', [authJwt.verifyToken, authJwt.isAdmin], productController.createProduct);

app.get('/products', authJwt.verifyToken, productController.getAllProducts);
app.get('/products/:id', authJwt.verifyToken, productController.getProductById);
app.patch('/products/:id', authJwt.verifyToken, productController.updateProduct);
app.delete('/products/:id', authJwt.verifyToken, productController.deleteProduct);
 
};
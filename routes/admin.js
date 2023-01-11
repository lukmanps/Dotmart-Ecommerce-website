var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const adminHelper = require('../helpers/admin-helper');
const session = require('express-session');
const { category } = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
                destination: (req, file, cb)=>{
                    cb(null, './public/db/product-images');
                },
                
                filename: (req, file, cb)=>{
                    console.log(file);
                    const uniqueFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
                    cb(null, uniqueFileName);
                }

                // Math.round(Math.random() * 1E9
});
const upload = multer({storage: storage});


const verifyLogin = (req, res, next)=>{
    if(req.session.loggedInad){
      next();
    }else{
      res.redirect('/admin/login');
    }
    }

/* GET home page. */
router.get('/', adminController.adminPage);

router.get('/dashboard', adminController.dashboard);

router.get('/products', adminController.productView);

router.get('/login', adminController.loginPage);

router.post('/login', adminController.loginPost);

router.get('/logout', adminController.logout);

router.get('/view-users', adminController.viewUsers);

router.get('/block-user/:id', adminController.blockUser);

router.get('/unblock-user/:id', adminController.unblockUser);

router.get('/delete-user/:id', adminController.deleteUser);

router.get('/category', adminController.category);

router.post('/add-category', adminController.categoryPost);

router.get('/delete-category/:id', adminController.deleteCategory);

// router.get('/edit-user/:id', adminController.editUser);

// router.post('/edit-user/:id', adminController.editUserPost);

router.get('/add-products', adminController.addProduct); //Add Products Page

router.post('/add-products', upload.array('productImage', 4), adminController.addProductPost); //Added Product

router.get('/products-list', adminController.productsList);

router.get('/unlist-product/:id', adminController.unlistProduct);

router.get('/listBack-product/:id', adminController.listBackProduct);

router.get('/edit-product/:id', adminController.editProduct); //Edit Product Page

router.post('/edited-product/:id', adminController.editProductPost);

router.get('/delete-product/:id', adminController.deleteProduct);

router.get('/order-management', verifyLogin, adminController.orderManagement);

router.get('/view-order/:id', adminController.viewOrder);

router.post('/view-order/:id', adminController.editOrderStatus);

module.exports = router;

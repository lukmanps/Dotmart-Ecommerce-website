var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');
const {storage} = require('../model/multer');
const {bannerStorage} = require('../model/multer');
const {verifyAdmin} = require('../controllers/authentication');
const upload = multer({storage});
const bannerUpload = multer({bannerStorage});

/* GET home page. */
router.get('/', verifyAdmin, adminController.adminPage);

router.get('/dashboard', verifyAdmin, adminController.dashboard);

router.get('/products', verifyAdmin, adminController.productView);

router.get('/login', adminController.loginPage);

router.post('/login', adminController.loginPost);

router.get('/logout', adminController.logout);

//USER MANAGEMENT

router.get('/view-users', verifyAdmin, adminController.viewUsers);

router.get('/block-user/:id', verifyAdmin, adminController.blockUser);

router.get('/unblock-user/:id', verifyAdmin, adminController.unblockUser);

router.get('/delete-user/:id',verifyAdmin,  adminController.deleteUser);

//CATEGORY MANAGEMENT

router.get('/category', verifyAdmin, adminController.category);

router.post('/add-category', verifyAdmin, adminController.categoryPost);

router.get('/delete-category/:id', verifyAdmin, adminController.deleteCategory);

//PRODUCT MANAGEMENT

router.get('/add-products', verifyAdmin, adminController.addProduct); //Add Products Page

router.post('/add-products', upload.array('productImage', 4), adminController.addProductPost); //Added Product

router.get('/products-list', verifyAdmin, adminController.productsList);

router.get('/unlist-product/:id', verifyAdmin, adminController.unlistProduct);

router.get('/listBack-product/:id',verifyAdmin, adminController.listBackProduct);

router.get('/edit-product/:id', verifyAdmin, adminController.editProduct); //Edit Product Page

router.post('/edited-product/:id', verifyAdmin, upload.fields([{name: 'productImage0', maxCount: 1},
                                                   {name: 'productImage1', maxCount: 1},
                                                   {name: 'productImage2', maxCount: 1},
                                                   {name: 'productImage3', maxCount: 1}]),
                                                   adminController.editProductPost);

router.get('/delete-product/:id', verifyAdmin, adminController.deleteProduct);

//ORDER MANAGEMENT

router.get('/order-management', verifyAdmin, adminController.orderManagement);

router.get('/view-order/:id', verifyAdmin, adminController.viewOrder);

router.post('/update-order-status', verifyAdmin, adminController.updateOrderStatus);


//COUPON MANAGEMENT
router.route('/add-coupon')
      .get(verifyAdmin, adminController.addCouponPage)
      .post(verifyAdmin, adminController.addCouponPost);

router.get('/view-coupon', verifyAdmin, adminController.couponViewPage); //Coupon 

router.post('/remove-coupon', verifyAdmin, adminController.removeCoupon);


//BANNER MANAGEMENT
router.get('/add-banner', verifyAdmin, adminController.addBannerPage);

router.post('/add-banner', bannerUpload.single('bannerImage'),  adminController.addBannerPost);

router.get('/banner-list', verifyAdmin, adminController.bannerViewPage);

router.post('/remove-banner', verifyAdmin, adminController.deleteBanner);

router.get('/report', verifyAdmin, adminController.reportPage);

module.exports = router;

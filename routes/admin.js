var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
                destination: (req, file, cb)=>{
                    cb(null, './public/db/product-images');
                },
                
                filename: (req, file, cb)=>{
                    console.log(file);
                    let uniqueFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
                    cb(null, uniqueFileName);
                }

                // Math.round(Math.random() * 1E9
});

const bannerStorage = multer.diskStorage({
                      destination: (req, file, cb)=>{
                        cb(null, './public/db/banner-images');
                      },

                      filename: (req, file, cb)=>{
                        console.log(file);
                        let uniqueFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
                        cb(null, uniqueFileName); 
                      }
});
const upload = multer({storage: storage});
const bannerUpload = multer({storage: bannerStorage});



const verifyLogin = (req, res, next)=>{
    if(req.session.loggedInad){
      next();
    }else{
      res.redirect('/admin/login');
    }
    }

/* GET home page. */
router.get('/', adminController.adminPage);

router.get('/dashboard', verifyLogin, adminController.dashboard);

router.get('/products', verifyLogin, adminController.productView);

router.get('/login', adminController.loginPage);

router.post('/login', adminController.loginPost);

router.get('/logout', adminController.logout);

router.get('/view-users', verifyLogin, adminController.viewUsers);

router.get('/block-user/:id', verifyLogin, adminController.blockUser);

router.get('/unblock-user/:id', verifyLogin, adminController.unblockUser);

router.get('/delete-user/:id',verifyLogin,  adminController.deleteUser);

router.get('/category', verifyLogin, adminController.category);

router.post('/add-category', adminController.categoryPost);

router.get('/delete-category/:id', verifyLogin, adminController.deleteCategory);

// router.get('/edit-user/:id', adminController.editUser);

// router.post('/edit-user/:id', adminController.editUserPost);

router.get('/add-products', verifyLogin, adminController.addProduct); //Add Products Page

router.post('/add-products', upload.array('productImage', 4), adminController.addProductPost); //Added Product

router.get('/products-list', verifyLogin, adminController.productsList);

router.get('/unlist-product/:id', verifyLogin, adminController.unlistProduct);

router.get('/listBack-product/:id',verifyLogin, adminController.listBackProduct);

router.get('/edit-product/:id', verifyLogin, adminController.editProduct); //Edit Product Page

router.post('/edited-product/:id', upload.fields([{name: 'productImage0', maxCount: 1},
                                                  {name: 'productImage1', maxCount: 1},
                                                  {name: 'productImage2', maxCount: 1},
                                                  {name: 'productImage3', maxCount: 1}]),
                                                   adminController.editProductPost);

router.get('/delete-product/:id', verifyLogin, adminController.deleteProduct);

router.get('/order-management', verifyLogin, adminController.orderManagement);

router.get('/view-order/:id', verifyLogin, adminController.viewOrder);

router.post('/update-order-status', adminController.updateOrderStatus);


//COUPON
router.route('/add-coupon')
      .get(verifyLogin, adminController.addCouponPage)
      .post(adminController.addCouponPost);

router.get('/view-coupon', verifyLogin, adminController.couponViewPage); //Coupon 

router.post('/remove-coupon', adminController.removeCoupon);


//BANNER
router.get('/add-banner', verifyLogin, adminController.addBannerPage);

router.post('/add-banner', bannerUpload.single('bannerImage'),  adminController.addBannerPost);

router.get('/banner-list', verifyLogin, adminController.bannerViewPage);

router.post('/remove-banner', adminController.deleteBanner);

router.get('/report', verifyLogin, adminController.reportPage);

module.exports = router;

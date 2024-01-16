const userHelper = require('../model/helpers/user-helper');
const adminHelper = require('../model/helpers/admin-helper');
const paypal = require('paypal-rest-sdk');
require('dotenv').config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_SECRET_ID
});


module.exports = {


  //HOME PAGE
  homePage: async function (req, res, next) {
    try {
      const user = req.session.user;
      const pageCount = req.query.page || 1;
      const pageNum = parseInt(pageCount);
      const pages = [];
      const limit = 10;
      const products = await adminHelper.getAllProducts();
      const mensProducts = await userHelper.getMensProducts();
      const womenProducts = await userHelper.getWomenProducts();
      const accessories = await userHelper.getAccessories();
      const banners = await adminHelper.getAllBanners();

      for (let i = 1; i <= Math.ceil(products.length / limit); i++) {
        pages.push(i);
      }

      if (user) {
        let cartCount = await userHelper.getCartCount(user._id);
        req.session.cartCount = cartCount;
        console.log(cartCount, 'cartcountin index page');
        //If User is Present
        userHelper.productsViewLimit(pageNum, limit).then((products) => {
          res.render('index', { user, products, cartCount, banners, pages, mensProducts, womenProducts, accessories, home: true });
        }).catch((err)=>{
          res.render('error', {message: err});
        })
      } else {
        //If User is not present
        userHelper.productsViewLimit(pageNum, limit).then((products) => {
          res.render('index', { products, pages, banners, mensProducts, womenProducts, accessories, home: true });
        }).catch((err)=>{
          res.render('error', {message: err});
        })
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },


  //LOGIN
  loginPage: function (req, res) {
    try {
      if (req.session.loggedIn) {
        res.redirect('/');
      } else {
        res.render('user/login');
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  loginPost: function (req, res) {
    try {
      userHelper.doLogin(req.body).then((response) => {
        if (response.blocked == true) {
          res.render('user/login', { blocked: true });
        } else if (response.status) {
          req.session.loggedIn = true;
          req.session.user = response.validUser;
          res.redirect('/');
        } else {
          res.render('user/login', { loginErr: true });
        }
      }).catch((err)=>{
        res.render('error', {message: err});
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },


  //OTP LOGIN
  otpLogin: function (req, res) {
      if (req.session.loggedIn) {
        res.redirect('/');
      } else {
        res.render('user/otp-login');
      }
    } ,

  verifyMobnoPost: function (req, res) {

    userHelper.doVerifyMob(req.body.loginMobno).then((response) => {
      const mobNo = req.body.loginMobno;

      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.validUser;
        client.verify.v2.services(TWILIO_SERVICE_SID)
          .verifications
          .create({
            to: `+91${mobNo}`,
            channel: "sms",
          }).then(verification => console.log(verification.status));
        // => console.log(data, 'Data After'));
        res.render('user/verify-otp', { mobNo });

      } else {
        res.render('user/otp-login', { otpErr: true });
      }

    }).catch((err) => {
      res.render('error', { message: err })
    })

  },

  verifyOtpPost: (req, res) => {
    try {
      const user = req.session.user;
      const otp = req.body.loginotp;
      const mobNo = req.body.mobNo;
      console.log(otp, 'OTP');
      client.verify.v2.services(process.env.SERVICE_SID)
        .verificationChecks
        .create({
          to: `+91${mobNo}`,
          code: otp,
        }).then((data) => {
          console.log(data, "data in postOTP Verification");
          if (data.status) {
            if (user) {
              res.redirect('/');
            }
          } else {
            res.render('user/verify-otp', { otpErr: true });
          }
        }).catch((err)=>{
          res.render('error', {message: err});
        });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },


  //SIGN UP
  signupPage: function (req, res) {
    try {
      if (req.session.loggedIn) {
        res.redirect('/');
      }
      else {
        res.render('user/signup');
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  validateMobile: (req, res) => {
    console.log(req.body);
    let mobileNo = req.body.mobileNo;
    console.log(mobileNo,)

    userHelper.doVerifyMob(mobileNo).then((response) => {
      if (response.status === false) {
        client.verify.v2.services(process.env.SERVICE_SID)
          .verifications
          .create({
            to: `+91${mobileNo}`,
            channel: "sms",
          }).then(verification => console.log(verification.status), res.json({ otpSend: true }))
          .catch((err)=>{
            res.render('error', {message: err});
          });
      } else {
        res.json({ otpSend: false });
      }
    }).catch((err) => {
      res.json(err);
    })
  },

  validateOTP: (otp, mobNo) => {
    console.log(otp, 'OTP in validate OTP');
    console.log(mobNo, 'Mobile number for validation');
    client.verify.v2.services(process.env.SERVICE_SID)
      .verificationChecks
      .create({
        to: `+91${mobNo}`,
        code: otp,
      }).then((data) => {
        console.log(data, "data in postOTP Verification");
        if (data.status) {
          response.status = true;
          res.json(response)
        } else {
          response.status = false;
          res.json(response);
        }
      }).catch((err) => {
        res.render('error', { message: err });
      });

  },

  signupPost: (req, res) => {
    try {
      userHelper.doSignup(req.body).then((userData) => {
        let oldUser = userData.status;

        if (oldUser) {
          res.render('user/signup', { oldUser: true })
        } else {
          res.render('user/signup', { registered: true });
        }
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },


  //LOGOUT
  logout: function (req, res) {
    req.session.loggedIn = false;
    req.session.user = null;
    //  req.session.destroy();
    res.redirect('/');
  },

  //SHOP PAGE
  shopPage: async (req, res) => {
    try {
      const user = req.session.user;
      const pageCount = req.query.page || 1;
      const pageNum = parseInt(pageCount);
      const pages = [];
      const limit = 8;
      const products = await adminHelper.getAllProducts();

      for (let i = 1; i <= Math.ceil(products.length / limit); i++) {
        pages.push(i);
      }
      const cartCount = await userHelper.getCartCount(req.session.user._id);;
      userHelper.productsViewLimit(pageNum, limit).then((products) => {
        res.render('user/shop', { user, products, pages, cartCount });
      }).catch((err)=>{
        res.render('error', {message: err});
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  mensPage: async (req, res) => {
    try {
      userHelper.getMensProducts().then(async(response) => {
        const user = req.session.user;
        const mensProducts = response;
        const cartCount = await userHelper.getCartCount(req.session.user._id);
        res.render('user/men', { user, cartCount, mensProducts })
      }).catch((err)=>{
        res.render('error', {message: err});
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  womenPage: (req, res) => {
    try {
      userHelper.getWomenProducts().then(async(response) => {
        const user = req.session.user;
        const womenProducts = response;
        const cartCount = await userHelper.getCartCount(req.session.user._id);
        res.render('user/women', { user, cartCount, womenProducts });
      }).catch((err)=>{
        res.render('error', {message: err});
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  accessoriesPage: (req, res) => {
    try {
      userHelper.getAccessories().then(async(response) => {
        const user = req.session.user;
        const accessories = response;
        const cartCount = await userHelper.getCartCount(req.session.user._id);
        res.render('user/accessories', { user, cartCount, accessories });
      }).catch((err)=>{
        res.render('error', {message: err});
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },


  //PRODUCT VIEW
  productView: async (req, res) => {
    try {
      console.log(req.params.id, "product id in productview");
      const user = req.session.user;
      const products = await userHelper.getProductDetails(req.params.id);
      console.log(products);
      if (user) {
        const cartCount = await userHelper.getCartCount(user._id);
        res.render('user/product-view', { user, products, cartCount });
      } else {
        res.render('user/product-view', { products });
      }

    } catch (error) {
      res.render('error', { message: error });
    }
  },


  //CART PAGE
  cartPage: async (req, res) => {
    try {
      const user = req.session.user;
      const products = await userHelper.getCartProducts(req.session.user._id);
      const totalPrice = await userHelper.getTotalAmount(req.session.user._id);
      const cartCount = await userHelper.getCartCount(req.session.user._id);
      console.log(products, 'Cart Products');
      if (!products || products.length === 0) {
        res.render('user/cart', { user, cartCount, cartEmpty: true });
      } else {
        res.render('user/cart', { user, cartCount, products, totalPrice });
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  changeQuantity: (req, res) => {
    userHelper.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelper.getTotalAmount(req.body.user);
      console.log(response, "Response In change Quantity");
      res.json(response);
    })
  },

  addToCart: async (req, res) => {
    const user = req.session.user;
    if (user) {
      userHelper.addToCart(req.params.id, user._id).then(async (response) => {
        let cartCount = await userHelper.getCartCount(req.session.user._id);
        console.log(cartCount, 'Cart COunt in when products added');
        response.status = true;
        response.cartCount = cartCount;
        res.json(response);
      });
    } else {
      let response = {};
      response.status = false;
      res.json(response);
    }
  },

  removeCartPost: (req, res) => {
    userHelper.removeCartProduct(req.body).then((response) => {
      res.json(response);
    })
  },

  //***** WISHLIST ******
  addToWishlist: (req, res) => {
    console.log('Wishlist button clicked');
    const user = req.session.user;
    if (user) {
      userHelper.addToWishlist(req.params.id, user._id).then(async (response) => {
        let cartCount = await userHelper.getCartCount(req.session.user._id);
        response.cartCount = cartCount;
        res.json(response);
      })
    } else {
      let response = {}
      response.user = false;
      res.json(response);
    }
    // try{}catch(error){}
  },

  wishlistPage: async (req, res) => {
    try {
      const user = req.session.user;
      const products = await userHelper.getWishlistProducts(user._id);
      const cartCount = await userHelper.getCartCount(req.session.user._id);;
      console.log(products);
      if (products.length === 0) {
        res.render('user/wishlist', { user, cartCount, wishlistEmpty: true });
      } else {
        res.render('user/wishlist', { user, cartCount, products });
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  removeWishlistProduct: (req, res) => {
    console.log(req.body, 'details in remove wishlistproduct ');
    userHelper.removeWishlistProduct(req.body).then((response) => {
      res.json(response);
    })
  },



  //***** CHECKOUT PAGE *****
  checkout: async (req, res) => {
    console.log('Checkout page reached');
    try {
      const user = req.session.user;
      const cartCount = await userHelper.getCartCount(req.session.user._id);;
      const total = await userHelper.getTotalAmount(user._id);
      const products = await userHelper.getCartProducts(user._id)
      const address = await userHelper.selectDefaultAddress(user._id);
      const getUser = await userHelper.getUser(user._id);
      const wallet = getUser.wallet;

      console.log(address, 'address in checkout page');
      const totalUSD = total / 81;

      console.log(user._id, cartCount, total, address, 'Address in checkout page');


      console.log(products, "cart Products in checkout");
      if (!products) {
        res.redirect('/cart');
      } else {
        res.render('user/checkout', { user, total, products, address, cartCount, wallet });
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  placeOrder: async (req, res) => {
    try {
      console.log(req.body, 'Checkout Details');
      const user = await userHelper.getUser(req.session.user._id);
      const address = await userHelper.selectDefaultAddress(user._id);
      const total = parseInt(req.body.totalAmount);
      const products = await userHelper.getCartProducts(user._id);

      if (!req.body.paymentMethod) {
        res.render('user/checkout', { user, products, total, address, paymentErr: true });
      } else if (req.body.paymentMethod === 'wallet') {
        let wallet = user.wallet;
        if (wallet < total) {
          res.render('user/checkout', { user, products, total, address, walletErr: true });
        }else{
          userHelper.placeOrder(req.body, products, total, user).then((response) => {
            if (response.status) {
              res.render('user/order-success', { user });
            } else {
              res.render('user/checkout', { user, total, products, address, paymentErr: true });
            }
          })
        }
      } else if (req.body.paymentMethod === 'Paypal') {
        let totalAmount = total / 81;
        let totalUSD = Math.round(totalAmount);

        let create_payment_json = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": "http://dotmart.online/order-success",
            "cancel_url": "http://dotmart.online/failed"
          },
          "transactions": [{
            "item_list": {
              "items": [{
                "name": "item",
                "sku": "item",
                "price": totalUSD,
                "currency": "USD",
                "quantity": 1
              }]
            },
            "amount": {
              "currency": "USD",
              "total": totalUSD
            },
            "description": "This is the payment description."
          }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
          console.log('Online Payment API Called');
          if (error) {
            throw error;
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === 'approval_url') {
                res.redirect(payment.links[i].href);
              }
            }
            userHelper.placeOrder(req.body, products, total, user).then((response) => {
              if (response.status) {
                res.render('user/order-success', { user });
              } else {
                res.render('user/checkout', { user, total, products, address, paymentErr: true });
              }
            })
            console.log("Create Payment Response");
          }
        });
        

      } else {

        userHelper.placeOrder(req.body, products, total, user).then((response) => {
          if (response.status) {
            res.render('user/order-success', { user });
          } else {
            res.render('user/checkout', { user, total, products, address, paymentErr: true });
          }
        })
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },


  paypalSucces: (req, res) => {
    try {
      console.log(req.query, 'Query in paypal success');
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      let orderID = req.session.orderID;
      user = req.session.user

      const execute_payment_json = {

        "payer_id": payerId,
        "transactions": [{
          "amount": {
            "currency": "USD",
            "total": req.session.total
          }
        }]
      };

      // Obtains the transaction details from paypal
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
        if (error) {
          throw error;
        } else {

          userHelper.paymentStatusChange(orderID, user._id).then((response) => {
            res.render('user/order-success', { user, orderID, cartCount: 0 })
            req.session.orderID = null
          })


        }
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  orderSuccess: async(req, res) => {
    try {
      const cartCount = await userHelper.getCartCount(req.session.user._id);
      res.render('user/order-success', { user: req.session.user, cartCount });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },


  //***** ORDERS PAGE ******
  ordersPage: async (req, res) => {
    try {
      const date = new Date().toLocaleDateString('en-US');
      const user = req.session.user;
      const cartCount = await userHelper.getCartCount(req.session.user._id);;
      const orders = await userHelper.getUserOrders(req.session.user._id);
    
      res.render('user/orders', { user, orders, cartCount })
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  viewOrder: async (req, res) => {
    try {
      const user = req.session.user;
      const products = await userHelper.getOrderProducts(req.params.id);
      const cartCount = await userHelper.getCartCount(req.session.user._id);
      console.log(products, 'Order Details');
      let orderDetails = products[0];
      if (orderDetails.status === 'Delivered') {
        res.render('user/view-order-products', { user, products, cartCount, orderDetails, delivered: true });
      } else {
        res.render('user/view-order-products', { user, products, orderDetails });
      }

    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  returnOrder: (req, res) => {
    try {
      console.log(req.body.orderId, 'OrderID to change status');
      let userId = req.session.user._id;
      userHelper.returnOrder(req.body.orderId, userId).then((response) => {
        res.json(response);
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  cancelOrder: (req, res) => {
    try {
      userHelper.cancelOrder(req.body.orderId).then((response) => {
        res.json(response)
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  //USER PROFILE
  changePassword: (req, res) => {
    try {
      if (req.session.loggedIn) {
        res.redirect('/');
      }
      else {
        res.render('user/forgot-password');
      }
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  verifyForgotPwdMob: function (req, res) {
    userHelper.doVerifyMob(req.body.loginMobno).then((response) => {
      const mobNo = req.body.loginMobno;
      console.log(mobNo);

      if (response.status) {
        console.log("Mobile Number Found");
        client.verify.v2.services(process.env.SERVICE_SID)
          .verifications
          .create({
            to: `+91${mobNo}`,
            channel: "sms",
          }).then(verification => console.log(verification.status), res.render('user/verify-changePwd-otp', { mobNo }));
        // => console.log(data, 'Data After'));
      } else {
        res.render('user/forgot-password', { otpErr: true });
      }
    }).catch((err) => {
      res.render('error', { message: err });
    })

  },

  verifyForgotPwdOtpPost: (req, res) => {
    try {
      const otp = req.body.loginotp;
      const mobNo = req.body.mobNo;
      console.log(otp);
      client.verify.v2.services(process.env.SERVICE_SID)
        .verificationChecks
        .create({
          to: `+91${mobNo}`,
          code: otp,
        }).then((data) => {
          console.log(data, "data in postOTP Verification");
        });
      res.render('user/change-password', { mobNo });
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  changePasswordPost: async (req, res) => {
    try {
      let mobNo = req.body.mobNo;
      console.log(req.body, 'Details in change password');
      await userHelper.changePassword(req.body).then((response) => {
        if (response.status) {
          res.render('user/change-password', { passwordChanged: true });
        } else {
          res.render('user/change-password', { mobNo, passwordChangeErr: true });
        }
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }


  },

  userProfile: async(req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await userHelper.getCartCount(req.session.user._id);;
      res.render('user/user-profile', { user, cartCount })
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  updateProfile: async(req, res) => {
    try {
      console.log(req.body, 'Details in update Profile');
      let user = req.session.user;
      let cartCount = await userHelper.getCartCount(req.session.user._id);;

      userHelper.updateProfile(user._id, req.body).then((response) => {
        if (response.status) {
          res.render('user/user-profile', { user, cartCount, updated: true });
        } else {
          res.render('user/user-profile', { user, cartCount, pwdErr: true });
        }
      }).catch((err) => {
        res.render('error', { message: err });
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }


  },


  //ADDRESS PAGE
  addressPage: async (req, res) => {
    try {
      const user = await userHelper.getUser(req.session.user._id);
      const address = user.address;
      const cartCount = await userHelper.getCartCount(req.session.user._id);;
      res.render('user/addresses', { user, address, cartCount });
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  addAddress: async(req, res) => {
    try {
      let user = req.session.user;
      const cartCount = await userHelper.getCartCount(req.session.user._id);;
      res.render('user/add-new-address', { user, cartCount });
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  addAddressPost: (req, res) => {
    try {
      console.log(req.body, "Details from add address");
      userHelper.addAddress(req.body, req.session.user).then((response) => {
        if (response.status) {

          res.redirect('/address');
        } else {
          res.redirect('/add-address');
        }
      }).catch((err) => {
        res.send(err);
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }

  },

  selectAddress: async (req, res) => {
    console.log(req.body, 'Select Address bUtton clicked');
    let addressId = req.body.addressId;
    let user = req.session.user;
    await userHelper.selectAddress(user._id, addressId).then((response) => {
      if (response) {
        console.log(response, 'Response in user controller when select address');
        res.json(response);
      } else {
        res.json({ status: false });
      }
    })

  },

  editAddress: async (req, res) => {
    try {
      console.log(req.params.id, "Address ID in edit address");
      let user = req.session.user;
      let cartCount = req.session.cartCount;
      await userHelper.getEditAddress(user._id, req.params.id).then((editAddress) => {
        console.log(editAddress, " address in response")
        res.render('user/edit-address', { user, cartCount, editAddress });
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  updateAddress: (req, res) => {
    console.log(req.body, 'Update Address');
    let user = req.session.user;
    let cartCount = req.session.cartCount;

    userHelper.updateAddress(user._id, req.body).then((response) => {
      if (response.status) {
        res.render('user/edit-address', { user, cartCount, updated: true });
      }
    }).catch(() => {
      res.render('error', { user, cartCount });
    });
  },


  //COUPONS PAGE
  allCoupons: async (req, res) => {
    try {
      const user = req.session.user;
      const coupons = await adminHelper.getAllCoupons();
      console.log(coupons, 'All COupons');
      res.render('user/all-coupons', { user, coupons });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  },

  applyCoupon: (req, res) => {
    let code = req.body.code.toUpperCase();
    let total = req.body.total;
    userHelper.applyCoupon(code, total).then((discount) => {
      if (discount) {
        console.log(discount, 'Response in UC applyCoupon');
        res.json(discount);
      } else {
        res.json({ status: false });
      }
    }).catch(() => {
      res.render('error');
    });
  },

  productSearch: async(req, res) => {
    try {
      let data = req.query.search;
      let user = req.session.user;
      let cartCount = await userHelper.getCartCount(req.session.user._id);;
      userHelper.searchProduct(data).then((searchResult) => {
        console.log(searchResult, 'Search Result Found!');
        res.render('user/search-product-list', { user, searchResult, cartCount })
      }).catch(() => {
        res.render('searchNotFound', { user, cartCount });
      })
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }




}
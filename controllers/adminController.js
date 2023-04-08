const adminHelper = require('../model/helpers/admin-helper');

module.exports = {

  adminPage: function (req, res, next) {
    try {
      if (req.session.loggedInad) {
        res.redirect('/admin/dashboard');
      }
      else {
        res.render('admin/admin-login', { layout: 'adminlayout', loginPage: true });
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  dashboard: async function (req, res) {
    try {
      const orders = await adminHelper.getAllOrders();
      const orderCount = orders.length;
      const products = await adminHelper.getAllProducts();
      const productCount = products.length;
      const totalRevenue = await adminHelper.getTotalRevenue();
      const users = await adminHelper.getAllUsers();
      const usersCount = users.length;
      const dashboardData = await adminHelper.adminSalesGraph();
      let codCount = dashboardData.codCount;
      let onlinePay = dashboardData.onlinePay;

      console.log(dashboardData, 'DashboardData');

      res.render('admin/dashboard', { layout: 'adminlayout', orderCount, productCount, totalRevenue, usersCount, dashboardData, codCount, onlinePay });
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  productView: function (req, res) {
    try {
      res.render('admin/product-view', { layout: 'adminlayout' });
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }

  },

  loginPage: function (req, res) {
    try {
      res.render('admin/admin-login', { layout: 'adminlayout', loginPage: true });
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  loginPost: function (req, res) {
    try {
      console.log(req.body);
      adminHelper.adminLogin(req.body).then((response) => {
        let adminIn = response.status;
        

        if (adminIn) {
          req.session.loggedInad = true;
          req.session.admin = response.validAdmin;
          res.redirect('/admin/dashboard');
        }
        else {
          res.render('admin/admin-login', { layout: 'adminlayout', loginPage: true, adLogErr: true });
          // res.redirect('/admin/login');
        }
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
    // {invalid:true,admin:true}
  },

  logout: function (req, res) {
    req.session.loggedInad = false;
    req.session.admin = null;
    //  req.session.destroy();
    res.redirect('/admin');
  },

  viewUsers: function (req, res) {
    try {
      if (req.session.loggedInad) {
        adminHelper.getAllUsers().then((users) => {
          res.render('admin/view-users', { layout: 'adminlayout', users });
        })

      }
      else {
        res.redirect('/admin');
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  category: function (req, res) {
    try {
      if (req.session.loggedInad) {
        // adminHelper.getAllCategories().then((users) => {


        // })
        adminHelper.getCategory().then((category) => {
          res.render('admin/category', { layout: 'adminlayout', category });
        })

      }
      else {
        res.redirect('/admin');
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  categoryPost: (req, res) => {
    try {
      adminHelper.addCategory(req.body).then((category) => {
        console.log(req.body);
        let oldCategory = category.status
        if (oldCategory) {
          res.render('admin/category', { layout: 'adminlayout' });

        } else {
          res.redirect('/admin/category');
        }
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  deleteCategory: (req, res) => {
    try {
      if (req.session.loggedInad) {
        let catId = req.params.id
        console.log(catId);
        adminHelper.deleteCategory(catId).then((response) => {

          res.redirect('/admin/category');

        })
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  deleteUser: (req, res) => {
    try {
      if (req.session.loggedInad) {
        let userid = req.params.id
        console.log(userid);
        adminHelper.deleteuser(userid).then((response) => {

          res.redirect('/admin/view-users');

        })
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  blockUser: (req, res) => {
    try {
      if (req.session.loggedInad) {
        let userId = req.params.id;
        console.log(userId);
        adminHelper.blockUser(userId).then((response) => {
          res.redirect('/admin/view-users');
        })
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }

  },

  unblockUser: (req, res) => {
    try {
      if (req.session.loggedInad) {
        let userId = req.params.id;
        console.log(userId);
        adminHelper.unblockUser(userId).then((response) => {
          res.redirect('/admin/view-users');
        })
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  editUser: async (req, res, next) => {
    try {
      let users = await userHelper.getUserdetails(req.params.id)
      console.log(users);
      res.render('admin/edit-user', { users, admin: true, adminin: true })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  editUserPost: (req, res) => {
    try {
      userHelper.updateUser(req.params.id, req.body).then((data) => {
        res.redirect('/admin/view-users')
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  addProduct: (req, res) => {
    try {
      if (req.session.loggedInad) {
        res.render('admin/add-products', { layout: 'adminlayout' });
      } else {
        res.redirect('/admin');
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  addProductPost: (req, res) => {
      console.log(req.body, 'Add products content');
      console.log(req.files, 'added files');
      const files = req.files;
      const filename = files.map((file) => {
        return file.filename;
      });

      const product = req.body;
      product.productImage = filename;
      product.status = true;

      console.log(product.productImage);
      adminHelper.addProduct(req.body).then((product) => {
        console.log(product);
        let proImage = product.productImage;
        console.log(proImage);
        res.render('admin/add-products', { layout: 'adminlayout', productUploaded: true });

        // let oldProduct = response.status;
        // if (oldProduct) {
        //   res.render('admin/add-products', { layout: 'adminlayout', productproductFound: true });
        // } else {
        //   res.render('admin/add-products', { layout: 'adminlayout', productUploaded: true });
        // }
      })
  },

  productsList: (req, res) => {
    try {
      adminHelper.getAllProducts().then((products) => {
        // console.log('dsb.fkjhgj/ldfshglkdsnhklgbsndlgks',products);
        if (req.session.loggedInad) {
          res.render('admin/products-list', { layout: 'adminlayout', products });
        } else {
          res.redirect('/admin');
        }
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  unlistProduct: async (req, res) => {
    try {
      if (req.session.loggedInad) {
        let productId = req.params.id;
        console.log(productId);
        adminHelper.unlistProduct(productId).then((response) => {
          res.redirect('/admin/products-list');

        })
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  listBackProduct: async (req, res) => {
    try {
      if (req.session.loggedInad) {
        let productId = req.params.id;
        console.log(productId);
        adminHelper.listBackProduct(productId).then((response) => {
          res.redirect('/admin/products-list');
        })
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  editProduct: async (req, res) => {
    try {
      let product = await adminHelper.getProductDetails(req.params.id);
      console.log(req.params.id);
      if (req.session.loggedInad) {
        res.render('admin/edit-product', { layout: 'adminlayout', product });
      } else {
        res.redirect('/admin');
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  editProductPost: (req, res) => {
    try {
      console.log(req.body, 'COntents in edit product');
      console.log(req.files, 'Image files content in product');
      let image = req.files;
      adminHelper.updateProduct(req.params.id, req.body, image).then(() => {
        res.render('admin/edit-product', { layout: 'adminlayout' });
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }

  },

  deleteProduct: (req, res) => {
    try {
      if (req.session.loggedInad) {
        let proId = req.params.id
        console.log(proId);
        adminHelper.deleteProduct(proId).then((response) => {

          res.redirect('/admin/products-list');

        })
      }
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  orderManagement: async (req, res) => {
    try {
      const pageCount = req.query.page || 1;
      const pageNum = parseInt(pageCount);
      const pages = [];
      const limit = 10;
      let orders = await adminHelper.getAllOrders();
      
      for(let i = 1; i<= Math.ceil(orders.length / limit) ; i++){
        pages.push(i);
      }

      adminHelper.orderPagenation(pageNum, limit).then((orders)=>{
        console.log(orders);
        
        res.render('admin/order-management', { layout: 'adminlayout', orders, pages });
      })
      
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  viewOrder: (req, res) => {
    try {
      adminHelper.getOrderDetails(req.params.id).then((order) => {
        console.log(order[0].status, "Ordre status");
        if (order[0].status === 'Payment Pending') {
          res.render('admin/view-order', { layout: 'adminlayout', order, placed: true });
        } else if (order[0].status === 'Shipped') {
          res.render('admin/view-order', { layout: 'adminlayout', order, shipped: true });
        } else if (order[0].status === 'Cancelled'){
          res.render('admin/view-order', { layout: 'adminlayout', order, cancelled: true });
        }else {
          res.render('admin/view-order', { layout: 'adminlayout', order, delivered: true });
        }

      });
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      console.log(req.body, 'request body in change status');
      adminHelper.updateOrderStatus(req.body.orderId, req.body.status).then((response)=>{
        if(response.status){
          res.json(response);
        }else{
          res.json(response);
        }
      });
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  addCouponPage: (req, res) => {
    try {
      res.render('admin/add-coupon', { layout: 'adminlayout' })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  addCouponPost: (req, res) => {
    console.log(req.body, 'Request Body in coupon managesmentj')
    try {
      adminHelper.addCoupon(req.body).then((response) => {
        console.log(response);
        if (response.status) {
          res.json(response);
        } else {
          res.json(response);
        }
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  couponViewPage: (req, res) => {
    try {
      adminHelper.getAllCoupons().then((coupons) => {
        console.log(coupons);
        res.render('admin/coupon-list', { layout: 'adminlayout', coupons });
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  removeCoupon: (req, res) => {
    console.log(req.body.id, 'Coupon ID');
    try {
      adminHelper.removeCoupon(req.body.id).then(async (response) => {
        if (response.status) {
          res.json(response);
        }
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  addBannerPage: (req, res) => {
    try {
      res.render('admin/add-banner', { layout: 'adminlayout' });
    } catch (error) {

    }
  },

  addBannerPost: (req, res) => {
    console.log(req.file.filename);
    try {
      const file = req.file.filename;
      const banner = req.body;
      banner.bannerImage = file;
      banner.status = true;

      adminHelper.addBanner(banner).then((response) => {
          if (response.status) {
            res.render('admin/add-banner', { layout: 'adminlayout', bannerUpload: true });
            
          } else {
            res.render('admin/add-banner', { layout: 'adminlayout', bannerUploaded: true });
          }
        });
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  bannerViewPage: async (req, res) => {
    try {
      let banners = await adminHelper.getAllBanners();
      res.render('admin/banner-list', { layout: 'adminlayout', banners });
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  deleteBanner: (req, res) => {
    try {
      console.log(req.body, 'Banner Details')
      const bannerId = req.body.id;
      adminHelper.deleteBanner(bannerId).then((response)=>{
        response.status = true;
        res.json(response);
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  },

  reportPage: async (req, res) => {
    try {
      let totalRevenue = await adminHelper.getTotalRevenue();
      adminHelper.reportList().then((orders) => {
        orders.revenue = totalRevenue;
        res.render('admin/report', { layout: 'adminlayout', orders });
      })
    } catch (error) {
      res.render('error', { layout: 'adminlayout', message: error.message });
    }
  }

}
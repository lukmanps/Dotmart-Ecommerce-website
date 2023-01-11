const express = require('express');
const adminHelper = require('../helpers/admin-helper');
const router = express.Router();
const session = require('express-session');

module.exports = {
  adminPage: function (req, res, next) {
    // res.render('admin/admin-login', { layout: 'adminlayout', loginPage: true });
    if (req.session.loggedInad) {
      res.redirect('/admin/dashboard');
    }
    else {
      res.render('admin/admin-login', { layout: 'adminlayout', loginPage: true });
    }
  },

  dashboard: function (req, res) {
    if (req.session.loggedInad) {
      res.render('admin/dashboard', { layout: 'adminlayout' });
    } else {
      res.redirect('/admin/login');
    }
  },

  productView: function (req, res) {
    res.render('admin/product-view', { layout: 'adminlayout' });
  },

  loginPage: function (req, res) {
    res.render('admin/admin-login', { layout: 'adminlayout', loginPage: true });
  },

  loginPost: function (req, res) {
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
    // {invalid:true,admin:true}
  },

  logout: function (req, res) {
    req.session.loggedInad = false;
    req.session.admin = null;
    //  req.session.destroy();
    res.redirect('/admin');
  },

  viewUsers: function (req, res) {
    if (req.session.loggedInad) {
      adminHelper.getAllUsers().then((users) => {

        res.render('admin/view-users', { layout: 'adminlayout', users });
      })

    }
    else {
      res.redirect('/admin');
    }
  },

  category: function (req, res) {
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
  },

  categoryPost: (req, res) => {
    adminHelper.addCategory(req.body).then((category) => {
      console.log(req.body);
      let oldCategory = category.status
      if (oldCategory) {
        res.render('admin/category', { layout: 'adminlayout' });

      } else {
        res.redirect('/admin/category');
      }
    })
  },

  deleteCategory: (req, res) => {
    if (req.session.loggedInad) {
      let catId = req.params.id
      console.log(catId);
      adminHelper.deleteCategory(catId).then((response) => {

        res.redirect('/admin/category');

      })
    }
  },

  deleteUser: (req, res) => {
    if (req.session.loggedInad) {
      let userid = req.params.id
      console.log(userid);
      adminHelper.deleteuser(userid).then((response) => {

        res.redirect('/admin/view-users');

      })
    }
  },

  blockUser: (req, res) => {
    if (req.session.loggedInad) {
      let userId = req.params.id;
      console.log(userId);
      adminHelper.blockUser(userId).then((response) => {
        res.redirect('/admin/view-users');
      })
    }
  },

  unblockUser: (req, res) => {
    if (req.session.loggedInad) {
      let userId = req.params.id;
      console.log(userId);
      adminHelper.unblockUser(userId).then((response) => {
        res.redirect('/admin/view-users');
      })
    }
  },

  editUser: async (req, res, next) => {
    let users = await userHelper.getUserdetails(req.params.id)
    console.log(users);
    res.render('admin/edit-user', { users, admin: true, adminin: true })
  },

  editUserPost: (req, res) => {
    userHelper.updateUser(req.params.id, req.body).then((data) => {
      res.redirect('/admin/view-users')
    })
  },

  addProduct: (req, res) => {
    if (req.session.loggedInad) {
      res.render('admin/add-products', { layout: 'adminlayout' });
    } else {
      res.redirect('/admin');
    }
  },

  addProductPost: (req, res) => {
    
    // console.log(req.body);
    console.log(req.files.fileName);
    const files = req.files;
    const filename = files.map((file) => {
      return file.filename;
    });

    const product = req.body;
    product.productImage = filename;
    product.status = 'Listed';

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
    adminHelper.getAllProducts().then((products) => {
      // console.log('dsb.fkjhgj/ldfshglkdsnhklgbsndlgks',products);
      if (req.session.loggedInad) {
        res.render('admin/products-list', { layout: 'adminlayout', products });
      } else {
        res.redirect('/admin');
      }
    })

  },

  unlistProduct: async(req, res)=>{
    if (req.session.loggedInad) {
      let products = await adminHelper.getAllProducts();
      let productId = req.params.id;
      console.log(productId);
      adminHelper.unlistProduct(productId).then((response) => {
        res.render('admin/products-list', {layout: 'adminlayout', products, unlisted: true});
      })
    }
  },

  listBackProduct:(req, res)=>{
    if (req.session.loggedInad) {
      let products = await adminHelper.getAllProducts();
      let productId = req.params.id;
      console.log(productId);
      adminHelper.listBackProduct(productId).then((response) => {
        res.render('admin/products-list', {layout: 'adminlayout', products, listBack: true});
      })
    }
  }, 

  editProduct: async (req, res) => {
    let product = await adminHelper.getProductDetails(req.params.id);
    console.log(req.params.id);
    if (req.session.loggedInad) {
      res.render('admin/edit-product', { layout: 'adminlayout', product });
    } else {
      res.redirect('/admin');
    }
  },

  editProductPost: (req, res) => {
    adminHelper.updateProduct(req.params.id, req.body).then(() => {
      console.log(req.body, 'Edited Product Body');
      res.render('admin/edit-product', {layout: 'adminlayout'});
    })


  },

  deleteProduct: (req, res) => {
    if (req.session.loggedInad) {
      let proId = req.params.id
      console.log(proId);
      adminHelper.deleteProduct(proId).then((response) => {

        res.redirect('/admin/products-list');

      })
    }
  },

  orderManagement: async(req, res)=>{
    let orders = await adminHelper.getAllOrders();
    console.log(orders, ' -ORDERS TO DISPLAY IN ADMIN')
    res.render('admin/order-management', {layout: 'adminlayout', orders});
  },

  viewOrder: async(req, res)=>{
    let order = await adminHelper.getOrderDetails(req.params.id);
    console.log(order, ' -ORDER VIEW');
    res.render('admin/view-order', {layout: 'adminlayout', order})
  },

  editOrderStatus: async(req, res)=>{
    console.log(req.params.id, ' ORDER ID IN asdflkjsadifsadjhkasfd');
    let orders = await adminHelper.getAllOrders();
    adminHelper.updateOrderStatus(req.params.id, req.body);
    res.render('admin/order-management', {layout: 'adminlayout', orders});
  }

}
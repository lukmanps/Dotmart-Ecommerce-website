
const db = require('../connection');
const collection = require('../collections');
const objectId = require('mongodb').ObjectId

module.exports = {

    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let validAdmin = await db.get().collection(collection.ADMINCOLLECTION).findOne({ adminEmail: adminData.adLogEmail, adminPassword: adminData.adLogPassword });
                if (validAdmin) {
                    console.log("login success")
                    response.validAdmin = validAdmin;
                    response.status = true;
                    resolve(response);

                }
                else {
                    console.log("login failed");
                    response.status = false;
                    resolve(response);
                }
            } catch {
                reject()
            }
        })
    },


    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.get().collection(collection.USERCOLLECTION).find().toArray()
                resolve(users)
            } catch { reject() }
        })
    },

    deleteuser: (userid) => {
        return new Promise(async (resolve, reject) => {
            console.log(userid)
            await db.get().collection(collection.USERCOLLECTION).deleteOne({ _id: objectId(userid) }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            await db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(userId) },
                { $set: { status: false } }).then((response) => {
                    console.log(response, 'Response in block user');
                    resolve();
                });
        })
    },

    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            await db.get().collection(collection.USERCOLLECTION).updateOne({ _id: objectId(userId) },
                { $set: { status: true } }).then((response) => {
                    console.log(response);
                    resolve();
                });
        })
    },

    addCategory: (category) => {
        return new Promise(async (resolve, reject) => {
            try{
                let oldCategory = {}
                let validCategory = await db.get().collection(collection.CATEGORYCOLLECTION).findOne({ catName: category.catName })
    
                if (validCategory) {
                    oldCategory.status = true
                    resolve(oldCategory);
                }
                else {
                    db.get().collection(collection.CATEGORYCOLLECTION).insertOne(category);
                    resolve({ status: false })
                }
            }catch{reject()}
        })
    },

    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let category = await db.get().collection(collection.CATEGORYCOLLECTION).find().toArray()
                resolve(category);
            } catch {
                reject()
            }
        })
    },

    deleteCategory: (catid) => {
        return new Promise(async (resolve, reject) => {
            console.log(catid)
            await db.get().collection(collection.CATEGORYCOLLECTION).deleteOne({ _id: objectId(catid) }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },

    addProduct: (product) => {
        return new Promise(async (resolve, reject) => {
            // console.log(product);
            let response = {};
            db.get().collection(collection.PRODUCTCOLLECTION).insertOne(product).then((product) => {
                resolve(product);
            });
            // response.status = false;
            // resolve(response);
            // let response = {};
            // let validProduct = await db.get().collection(collection.PRODUCTCOLLECTION).findOne({productID: product.productID});
            // if(validProduct){
            //     console.log(validProduct);
            //     response.status = true;
            //     resolve(response);
            // }else{
            //     db.get().collection(collection.PRODUCTCOLLECTION).insertOne(product);
            //     response.status = false;
            //     resolve(response);
            // }

        });
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            console.log('All products');
            console.log(db.get());
            let products = await db.get().collection(collection.PRODUCTCOLLECTION).find().toArray();
            resolve(products);

        })
    },

    unlistProduct: (productId) => {
        return new Promise((resolve, reject) => {
            let response = {};
            db.get().collection(collection.PRODUCTCOLLECTION).updateOne({ _id: objectId(productId) },
                {
                    $set: { status: false }
                }).then((response) => {
                    resolve();
                })

        })
    },

    listBackProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTCOLLECTION).updateOne({ _id: objectId(productId) },
                {
                    $set: { status: true }
                }).then((response) => {
                    console.log(response);
                    resolve();
                })
        })
    },

    getProductDetails: (proId) => {
        console.log(proId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTCOLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product);
            })
        })
    },

    updateProduct: (proId, proDetails, image) => {
        console.log(proDetails);
        return new Promise(async (resolve, reject) => {

            let product = await db.get().collection(collection.PRODUCTCOLLECTION).findOne({ _id: objectId(proId) });
            if (image.productImage0) {
                product.productImage[0] = image.productImage0[0].filename;
            }
            if (image.productImage1) {
                product.productImage[1] = image.productImage1[0].filename;
            }
            if (image.productImage2) {
                product.productImage[2] = image.productImage2[0].filename;
            }
            if (image.productImage3) {
                product.productImage[3] = image.productImage3[0].filename;
            }
            db.get().collection(collection.PRODUCTCOLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    productBrand: proDetails.productBrand,
                    productTitle: proDetails.productTitle,
                    productID: proDetails.productID,
                    productColor: proDetails.productColor,
                    productSize: proDetails.productSize,
                    productDescription: proDetails.productDescription,
                    productPrice: proDetails.productPrice,
                    productImage: product.productImage
                }
            }).then((response) => {
                resolve();
            }).catch(() => {
                reject();
            });
        })
    },

    deleteProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            console.log(proId)
            await db.get().collection(collection.PRODUCTCOLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDERCOLLECTION).find().sort({ 'date': -1 }).toArray();
            resolve(orders);
        })
    },

    orderPagenation: (pageNum, limit) => {
        let skipNum = parseInt((pageNum - 1) * limit);
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDERCOLLECTION).find().sort({ 'date': -1 }).skip(skipNum).limit(limit).toArray();
            resolve(orders);
        })
    },

    getOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        orderID: '$orderID',
                        item: '$products.item',
                        quantity: '$products.quantity',
                        deliveryDetails: '$deliveryDetails',
                        paymentMethod: '$paymentMethod',
                        totalAmount: '$totalAmount',
                        status: '$status',
                        date: '$date'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTCOLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        orderID: 1,
                        item: 1,
                        quantity: 1,
                        deliveryDetails: 1,
                        paymentMethod: 1,
                        totalAmount: 1,
                        status: 1,
                        date: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }
                }


            ]).toArray();
            resolve(orderItems);
        })
    },

    updateOrderStatus: (orderId, orderStatus) => {
        console.log(orderStatus, ' ORDER STATUS');

        return new Promise((resolve, reject) => {

            db.get().collection(collection.ORDERCOLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: orderStatus
                }
            }).then((response) => {
                response.status = true;
                resolve(response);
            }).catch((response) => {
                response.status = false;
                reject(response);
            })
        })
    },

    addCoupon: (coupon) => {
        console.log(coupon, 'coupon details in admin Helper');
        return new Promise(async (resolve, reject) => {
            coupon.couponCode = coupon.couponCode.toUpperCase();
            coupon.expiryDate = new Date(coupon.expiryDate);
            coupon.couponDiscount = parseInt(coupon.couponDiscount);
            coupon.maxDiscount = parseInt(coupon.maxDiscount);
            let validCoupon = await db.get().collection(collection.COUPONCOLLECTION).findOne({ couponCode: coupon.couponCode });
            console.log(validCoupon, 'VALID COUPON');
            if (validCoupon === null) {
                db.get().collection(collection.COUPONCOLLECTION).insertOne(coupon).then((response) => {
                    response.status = true;
                    resolve(response);
                })
            } else {
                response.status = false;
                resolve(response);
            }
        })
    },

    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPONCOLLECTION).find().toArray();
            resolve(coupons);
        })
    },

    removeCoupon: (couponId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.COUPONCOLLECTION).deleteOne({ _id: objectId(couponId) }).then((response) => {
                console.log(response, "Response when removing coupon");
                response.status = true;
                resolve(response);
            })
        })
    },

    getTotalRevenue: () => {
        return new Promise(async (resolve, reject) => {
            let revenue = await db.get().collection(collection.ORDERCOLLECTION).aggregate([
                {
                    $match: {
                        status: 'Delivered'
                    }
                },
                {
                    $project: {
                        totalAmount: 1,
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$totalAmount' }
                    }
                }
            ]).toArray();
            console.log(revenue, 'Revenue in Get Revenue');
            if (revenue.length !== 0) {
                resolve(revenue[0].totalAmount);
            } else {
                resolve(0);
            }
        })
    },


    addBanner: (banner) => {
        console.log(banner, 'Banner details in helper');
        return new Promise(async (resolve, reject) => {
            try {
                let validBanner = await db.get().collection(collection.BANNER_COLLECTION).findOne({ bannerTitle: banner.bannerTitle });
                if (validBanner === null) {
                    db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((response) => {
                        console.log(response.insertedId, 'Response When Banner added to DB');
                        response.status = true;
                        resolve(response);
                    }).catch(() => {
                        reject();
                    })
                } else {
                    response.status = false;
                    resolve(response);
                }
            } catch {
                reject()
            }

        })
    },

    getAllBanners: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).find().toArray().then((response) => {
                resolve(response);
            })
        })
    },

    deleteBanner: (bannerId) => {
        console.log(bannerId, 'Banner ID in adminHelper');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(bannerId) }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },

    reportList: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDERCOLLECTION)
                .find({ status: 'Delivered' })
                .sort({ 'date': -1 })
                .toArray().then((response) => {
                    resolve(response)
                })
        })

    },

    adminSalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let Data = {};
            Data.codCount = await db
                .get()
                .collection(collection.ORDERCOLLECTION)
                .find({ paymentmethod: "COD" })
                .count();
            Data.onlinePay = await db
                .get()
                .collection(collection.ORDERCOLLECTION)
                .find({ paymentmethod: "Paypal" })
                .count();
            Data.PlacedCount = await db
                .get()
                .collection(collection.ORDERCOLLECTION)
                .find({ status: "Placed" })
                .count();
            Data.PendingCount = await db
                .get()
                .collection(collection.ORDERCOLLECTION)
                .find({ status: "Payment Pending" })
                .count();
            Data.DeliveredCount = await db
                .get()
                .collection(collection.ORDERCOLLECTION)
                .find({ status: "Delivered" })
                .count();

            Data.CanceledCount = await db
                .get()
                .collection(collection.ORDERCOLLECTION)
                .find({ status: "Cancelled" })
                .count();
            Data.ProductsCount = await db
                .get()
                .collection(collection.PRODUCTCOLLECTION)
                .find({})
                .count();
            Data.CategoryCount = await db
                .get()
                .collection(collection.CATEGORYCOLLECTION)
                .find({})
                .count();
            Data.TotalDeliveredPrice = await db
                .get()
                .collection(collection.ORDERCOLLECTION)
                .aggregate([
                    { $match: { status: "Delivered" } },
                    { $group: { _id: null, TotalRevenue: { $sum: "$totalAmount" } } },
                ])
                .toArray();

            resolve(Data);
        });
    },

    productData: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = {};
                data.menCount = await db.get().collection(collection.PRODUCTCOLLECTION).find({ productCategory: "men" }).count();
                data.womenCount = await db.get().collection(collection.PRODUCTCOLLECTION).find({ productCategory: "women" }).count();
                data.accessoriesCount = await db.get().collection(collection.PRODUCTCOLLECTION).find({ productCategory: "accessories" }).count();
                console.log(data, 'data in admin helper');
                resolve(data);
            } catch {
                reject();
            }
        })
    }





}
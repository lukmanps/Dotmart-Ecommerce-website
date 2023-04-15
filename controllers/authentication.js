const userHelper = require("../model/helpers/user-helper");

module.exports = {
    verifyUser: async (req, res, next) => {
        if (req.session.loggedIn) {
            let user = await userHelper.getUser(req.session.user._id);
            if (user.status) {
                console.log(true, 'USer STauts flasdkrekjkfksdjf')
                next();
            } else {
                req.session.loggedIn = false;
                req.session.user = null;
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    },
    
    verifyAdmin: (req, res, next) => {
        try {
            if (req.session.loggedInad) {
                next();
            } else {
                res.redirect('/admin/login');
            }
        } catch (err) { }
        
    } 


}

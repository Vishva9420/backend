// // const mongoose = require('mongoose');

// // const gsignUpSchema= new mongoose.Schema({
// //     data:{
    
// //         type: String
// //     },
    
// // })

// // const guser = mongoose.model('gsignUp', gsignUpSchema);
// // module.exports= {guser}



// // const mongoose = require('mongoose');

// // const gsignUpSchema= new mongoose.Schema({
// //     g_id:{
// //         type: String,
        
// //     },
// //     g_name:{
// //         type: String,
        
// //     },
// //     g_email:{
// //         type: String,
        
// //     },

    
// // })

// // const guser = mongoose.model('gsignUp', gsignUpSchema);
// // module.exports= {guser}







// const mongoose = require('mongoose');
// const _ = require('lodash')
// const jwt = require('jsonwebtoken')
// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const jwtSeceret = 'fdnadnajdnkwdnskmcssad123AA'
// const gsignUpSchema = new mongoose.Schema({
//     g_id:{
//         type: String,
        
//     },
//     g_name:{
//         type: String,
        
//     },
//     g_email:{
//         type: String,
        
//     },
//     g_authToken:{
//         type: String,
        
//     },
//     sessions:[{
//         token:{
//             type: String,
//             required: true
//         },
//         expiresAt:{
//             type: Number,
//             required: true
//         }
//     }]
// })

// gsignUpSchema.methods.toJSON = function () {
//     const user = this;
//     const userObject = user.toObject();

//     // return the document except the password and sessions (these shouldn't be made available)
//     return _.omit(userObject, ['g_id', 'sessions']);
// }

// gsignUpSchema.methods.generateAccessAuthToken = function () {
//     const user = this;
//     return new Promise((resolve, reject) => {
//         // Create the JSON Web Token and return that
//         jwt.sign({ _id: user._id.toHexString() }, jwtSeceret, { expiresIn: "15m" }, (err, token) => {
//             if (!err) {
//                 resolve(token);
//             } else {
//                 // there is an error
//                 reject();
//             }
//         })
//     })
// }

// gsignUpSchema.methods.generateRefreshAuthToken = function () {
//     // This method simply generates a 64byte hex string - it doesn't save it to the database. saveSessionToDatabase() does that.
//     return new Promise((resolve, reject) => {
//         crypto.randomBytes(64, (err, buf) => {
//             if (!err) {
//                 // no error
//                 let token = buf.toString('hex');

//                 return resolve(token);
//             }
//         })
//     })
// }

// gsignUpSchema.methods.createSession = function () {
//     let user = this;
//     console.log('>>>>>>>>>>>>>>>>>>>>>try')
//     return user.generateRefreshAuthToken().then((refreshToken) => {
//         return saveSessionToDatabase(user, refreshToken);
//     }).then((refreshToken) => {
//         // saved to database successfully
//         // now return the refresh token
//         console.log('<><><><><><><><><>')
//         return refreshToken;
//     }).catch((e) => {
//         return Promise.reject('Failed to save session to database.\n' + e);
//     })
// }



// /* MODEL METHODS (static methods) */

// gsignUpSchema.statics.getJWTSecret = () => {
//     return jwtSeceret;
// }



// gsignUpSchema.statics.findByIdAndToken = function (_id, token) {
//     // finds user by id and token
//     // used in auth middleware (verifySession)

//     const User = this;
//     console.log(User)
//     return User.findOne({
//         _id,
//         'sessions.token': token
//     });
// }


// gsignUpSchema.statics.findByCredentials = function (email , g_id) {
//     let User = this;
//     return User.findOne({ email }).then((user) => {
//         if (!user) return Promise.reject();

//         return new Promise((resolve, reject) => {
//             bcrypt.compare(g_id, user.g_id, (err, res) => {
//                 if (res) {
//                     resolve(user);
//                 }
//                 else {
//                     reject();
//                 }
//             })
//         })
//     })
// }

// gsignUpSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
//     let secondsSinceEpoch = Date.now() / 1000;
//     if (expiresAt > secondsSinceEpoch) {
//         // hasn't expired
//         return false;
//     } else {
        
//         return true;
//     }
// }


// /* MIDDLEWARE */
// // Before a user document is saved, this code runs
// gsignUpSchema.pre('save', function (next) {
//     let user = this;
//     let costFactor = 10;

//     if (user.isModified('g_id')) {gsignUpSchema
//         // Generate salt and hash password
//         bcrypt.genSalt(costFactor, (err, salt) => {
//             bcrypt.hash(user.g_id, salt, (err, hash) => {
//                 user.g_id = hash;
//                 next();
//             })
//         })
//     } else {
//         next();
//     }
// });


// /* HELPER METHODS */
// let saveSessionToDatabase = (user, refreshToken) => {
//     // Save session to database
//     return new Promise((resolve, reject) => {
//         let expiresAt = generateRefreshTokenExpiryTime();

//         user.sessions.push({ 'token': refreshToken, expiresAt });

//         user.save().then(() => {
//             // saved session successfully
//             return resolve(refreshToken);
//         }).catch((e) => {
//             reject(e);
//         });
//     })
// }

// let generateRefreshTokenExpiryTime = () => {
//     let daysUntilExpire = "10";
//     let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
//     return ((Date.now() / 1000) + secondsUntilExpire);
// }

// const guser = mongoose.model('guser', gsignUpSchema );

// module.exports = { guser }






const mongoose = require('mongoose');
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwtSeceret = 'fdnadnajdnkwdnskmcssad123AA'
const UserSchema = new mongoose.Schema({
    g_id:{
                type: String,
                
            },
            g_name:{
                type: String,
                
            },
            g_email:{
                type: String,
                
            },
            g_authToken:{
                type: String,
                
            },
            sessions:[{
                token:{
                    type: String,
                    required: true
                },
                expiresAt:{
                    type: Number,
                    required: true
                }
            }]
        })


UserSchema.methods.toJSON = function () {

    console.log('in methods')

    const user = this;
    const userObject = user.toObject();

    // return the document except the password and sessions (these shouldn't be made available)
    return _.omit(userObject, ['g_id', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function () {
    
    const user = this;
    console.log(user)
    return new Promise((resolve, reject) => {
        // Create the JSON Web Token and return that
        jwt.sign({ _id: user._id.toHexString() }, jwtSeceret, { expiresIn: "15m" }, (err, token) => {
            if (!err) {
                resolve(token);
            } else {
                // there is an error
                reject();
            }
        })
    })
}

UserSchema.methods.generateRefreshAuthToken = function () {
    // This method simply generates a 64byte hex string - it doesn't save it to the database. saveSessionToDatabase() does that.
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                // no error
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    })
}



// gsignUpSchema.methods.generateAccessAuthToken = function () {
//     const user = this;
//     return new Promise((resolve, reject) => {
//         // Create the JSON Web Token and return that
//         jwt.sign({ _id: user._id.toHexString() }, jwtSeceret, { expiresIn: "15m" }, (err, token) => {
//             if (!err) {
//                 resolve(token);
//             } else {
//                 // there is an error
//                 reject();
//             }
//         })
//     })
// }

UserSchema.methods.createSession = function () {
    let user = this;
    console.log('>>>>>>>>>>>>>>>>>>>>>try')
    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        // saved to database successfully
        // now return the refresh token
        console.log('<><><><><><><><><>')
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.\n' + e);
    })
}



/* MODEL METHODS (static methods) */

UserSchema.statics.getJWTSecret = () => {
    return jwtSeceret;
}



UserSchema.statics.findByIdAndToken = function (_id, token) {
    // finds user by id and token
    // used in auth middleware (verifySession)

    const User = this;
    console.log(User)
    return guser.findOne({
        _id,
        'sessions.token': token
    });
}


UserSchema.statics.findByCredentials = function (g_email, g_id) {
    let guser = this;
    return guser.findOne({ g_email }).then((guser) => {
        if (!guser) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(g_id, user.g_id, (err, res) => {
                if (res) {
                    resolve(user);
                }
                else {
                    reject();
                }
            })
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        // hasn't expired
        return false;
    } else {
        // has expired
        return true;
    }
}


/* MIDDLEWARE */
// Before a user document is saved, this code runs
UserSchema.pre('save', function (next) {
    let user = this;
    let costFactor = 10;

    if (user.isModified('g_id')) {
        // if the password field has been edited/changed then run this code.

        // Generate salt and hash password
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.g_id, salt, (err, hash) => {
                user.g_id = hash;
                next();
            })
        })
    } else {
        next();
    }
});


/* HELPER METHODS */
let saveSessionToDatabase = (user, refreshToken) => {
    // Save session to database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt });

        user.save().then(() => {
            // saved session successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const guser = mongoose.model('guser', UserSchema);

module.exports = { guser }
























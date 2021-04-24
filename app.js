const express = require('express');
const mongoose = require('mongoose');
const { VideoUpload, User, guser, comments, history } = require('./db/models');
const EventEmitter = require('events');
const event = new EventEmitter();
const bcrypt = require('bcryptjs');

const app = require('express')();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200", "192.168.4.182:3000", "192.168.4.182:4200");
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});

const http = require('http').Server(app);
// TODO: Temporary
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:4200', "192.168.4.182:4200"]
    }
});
const cors = require('cors');
const whitelist = ['http://localhost:4200', "192.168.4.182:4200", "http://localhost:3000"];
const corsOptions = {
    credentials: true, // This is important.
    origin: (origin, callback) => {
        if (whitelist.includes(origin))
            return callback(null, true)

        callback(new Error('Not allowed by CORS'));
    }
}
//app.use(cors(corsOptions));
var flag = 0

var shell = require('shelljs');


http.listen(3000, () => {
    console.log('listening on *:3000');
});
// event.emit('AddnewComment',{message:'sasdasdawdw'})
// io.on('connection', socket => {
//     console.log('socket connected')
//     event.on('AddnewComment', (savedList)=>{
//         socket.emit('test', savedList)
//     })

// })
var liveCount = 0;

var $ipsConnected = [];
let x = true;



io.on('connection', (socket) => {

    var $ipAddress = socket.handshake.address;
    // console.log(`new Connection id: ${socket.id}`);
    if (!$ipsConnected.hasOwnProperty($ipAddress)) {

        $ipsConnected[$ipAddress] = 1;

        liveCount++;
        // console.log(liveCount);
        sendData(socket);
        // socket.emit('counter', { liveCount: liveCount });
        // socket.emit("spam", "hello world");
        socket.on("spam", (data) => {

            console.log("spam video view ...........", data)
            socket.broadcast.emit("spam", data);
        })

    }
    socket.on('room_join_request', payload => {
        socket.join(payload.roomName, err => {
            if (!err) {
                io.in(payload.roomName).clients((err, clients) => {
                    if (!err) {
                        io.in(payload.roomName).emit('room_users', clients)
                    }
                });
            }
        })
    })

    socket.on('offer_signal', payload => {
        io.to(payload.calleeId).emit('offer', { signalData: payload.signalData, callerId: payload.callerId });
    });

    socket.on('answer_signal', payload => {
        io.to(payload.callerId).emit('answer', { signalData: payload.signalData, calleeId: socket.id });
    });




    // console.log("client is connected");

    /* Disconnect socket */

    socket.on('disconnect', function () {

        if ($ipsConnected.hasOwnProperty($ipAddress)) {

            delete $ipsConnected[$ipAddress];

            liveCount--;

            socket.emit('counter', { liveCount: liveCount });

        }

    });



});

function sendData(socket) {

    socket.emit('data1', liveCount);
    //console.log(`data is ${liveCount}`);
    setTimeout(() => {
        sendData(socket);
    }, 1000);
}

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/finalProject',
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connected'))

const bodyParser = require('body-parser');

const { JsonWebTokenError } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Console } = require('console');




app.use(express.static('./images'));

let authAdmin = (req, res, next) => {
    permitId = "605c33a8285f0914898612b2"
    let token = req.header('x-access-token');
    if (flag === 1) {

        jwt.verify(token, guser.getJWTSecret(),
            (err, decoded) => {
                if (err) {
                    res.status(401).send(err);
                } else {
                    if(decoded._id === permitId){
                    req.user_id = decoded._id
                    next()
                    }
                   
                }
            })
    }

    if (flag == 0) {
        jwt.verify(token, User.getJWTSecret(),
            (err, decoded) => {
                if (err) {
                    res.status(401).send(err);
                } else {
                    if(decoded._id === permitId){
                        req.user_id = decoded._id
                        next()
                        }
                   
                }
            })
    }
}

let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');
    if (flag === 1) {

        jwt.verify(token, guser.getJWTSecret(),
            (err, decoded) => {
                if (err) {
                    res.status(401).send(err);
                } else {
                    
                    req.user_id = decoded._id

                    next()
                }
            })
    }

    if (flag == 0) {
        
        jwt.verify(token, User.getJWTSecret(),
            (err, decoded) => {
                if (err) {
                    res.status(401).send(err);
                } else {
                    req.user_id = decoded._id
                    next()
                }
            })
    }

}


function ffm(fileName) {
    fileName = "./images/" + fileName
    shell.exec('./images/create-vod-hls.sh ' + fileName)
}


let verifySession = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');
    let _id = req.header('_id');
    let isSessionValid = false;




    // if (flag == 1) {
    //     guser.findByIdAndToken(_id, refreshToken).then((user) => {

    //         if (!user) {
    //             return Promise.reject({ "error": "User Not found " })

    //         }
    //         req.user_id = user._id;
    //         req.userObject = user;
    //         req.refreshToken = refreshToken;

    //         user.sessions.forEach((session) => {
    //             if (session.token === refreshToken) {
    //                 if (guser.hasRefreshTokenExpired(session.expiresAt) === false) {
    //                     isSessionValid = true;
    //                 }
    //             }
    //         })


    //         if (isSessionValid) {
    //             next();
    //         } else {
    //             return Promise.reject({
    //                 'error': 'Session Invalid'
    //             })

    //         }
    //     }).catch((e) => {
    //         res.status(401).send(e)
    //     })
    // }

    // if (flag == 0) {
    //     //console.log(refreshToken)
    //     User.findByIdAndToken(_id, refreshToken).then((user) => {

    //         if (!user) {
    //             return Promise.reject({ "error": "User Not found " })

    //         }
    //         req.user_id = user._id;
    //         req.userObject = user;
    //         req.refreshToken = refreshToken;

    //         user.sessions.forEach((session) => {
    //             if (session.token === refreshToken) {
    //                 if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
    //                     isSessionValid = true;
    //                 }
    //             }
    //         })


    //         if (isSessionValid) {
    //             pusher.trigger("my-channel", "my-event", {
    //                 message: "hello world"
    //             });
    //             next();
    //         } else {
    //             return Promise.reject({
    //                 'error': 'Session Invalid'
    //             })

    //         }
    //     }).catch((e) => {
    //         res.status(401).send(e)
    //     })
    // }
}


app.use(bodyParser.json());





//Route Handelers
app.get('/', (req, res) => {
    res.send('app started');
})
//vishva
app.post('/view-video/:videoId', (req, res) => {


    let comment = req.body.comment;
    let vid = req.body.id;
    let clike = req.body.like;
    let cdislike = req.body.dislike;
    let doLike = req.body.canLike;
    let doUnlike = req.body.canDislike;
    let uid = req.body.userId;
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa', req.body.canDislike);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa',vid);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa',clike);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa',cdislike);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa',doLike);
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa',doUnlike);




    let newComment = new comments({
        comments: comment,
        videoId: vid,
        like: clike,
        dislike: cdislike,
        canLike: doLike,
        canDislike: doUnlike,
        userId: uid

    })
    newComment.save().then((savedList) => {
        event.emit('AddnewComment', savedList)
        console.log(savedList);
        res.send(savedList);
    })



});
let date_ob = new Date();
//vishva
app.post('/dashboard/:uid', (req, res) => {
    console.log('dashboard post request called')
    console.log('history data',req.body);
    console.log(date_ob);





    let newhistory = new history({
        uid: req.body.uid,
        vid: req.body.vid,
        title: req.body.title,
        genere: req.body.genere,
        timestamp: date_ob


    })
    newhistory.save().then((savedList) => {

        console.log(savedList);
        res.send(savedList);
    })



});
//vishva
app.get('/view-video/:videoId', authenticate, (req, res) => {
    // console.log('<<<<<<<>>>>>>>>>>>', req.params.videoId)

    // console.log('vishva', req.header('user-id'))
    // console.log('vishva', req.header('x-access-token'));
    vid = req.params.videoId;


    VideoUpload.find({
        _id: req.params.videoId
    }).then((video) => {
        // console.log(video)
        comments.find({
            videoId: req.params.videoId
        }).then((comment) => {
            // console.log(comment)

            res.json({ video, comment });
        }).catch((e) => { console.log(e) })

        //res.json({ video });
    }).catch((e) => { console.log(e) })
});



////admin get video

app.get('/admin/dashboard/:id',authAdmin, (req, res) => {
    console.log('admin dashboard', req.params.id)

    VideoUpload.find({
        _id: req.params.id
    }).then((videos) => {
        console.log('****');
        res.send(videos);
    }).catch((e) => { console.log(e) })
});

app.get('/admin/dashboard', authAdmin,(req, res) => {
    var genre = [];
    var span = [];
    var Topviews = [];

    VideoUpload.aggregate(
        [
            {
                $group: {
                    _id: '$genere', count: { $sum: 1 }

                },

            }
        ],

        function (err, result) {
            if (err) {
                res.send(err);
            } else {
            }
        }
    ).then((data) => {
        genre.push(data);

        VideoUpload.find().then((data) => {
            span = data


        }).then((data) => {


            VideoUpload.find().sort({ "views": -1 }).then((data) => {
                for (i = 0; i < 10; i++) {
                    Topviews.push(data[i])
                }
                // console.log("<><><><><><>SGHDUSGDUGSUDGYSGD", Topviews)
                res.send({ genre, span, Topviews })
            })

        }).catch((e) => {
            res.status(500).send("error")
        })

    })
    //res.send({genre});


});



app.delete('/admin/dashboard/:id',authAdmin, (req, res) => {
    //  console.log('admin delete called',req.params.id)
    // res.send({"status":req.body.id})

    VideoUpload.findByIdAndDelete(req.params.id, function (err) {
        if (err) console.log(err);
        console.log("Successful deletion");
    });
    comments.deleteMany({ videoId: req.params.id }, function (err) {
        console.log("Successful deletion");
    }).then((data) => {
        console.log(data)
    });
})


//v
app.get('/your-videos/:uid', (req, res) => {
    console.log('pid', req.body)




    VideoUpload.find({
        uid: req.params.uid

    }).then((video) => {
        console.log('v', video)


        return res.json(video);
    }).catch((e) => { console.log(e) })
});
app.delete('/your-videos/:id', (req, res) => {
console.log("asssssssssssssssssssssssssssssssss",req.params.id);
    VideoUpload.findByIdAndDelete(req.params.id, function (err) {
        if (err) console.log(err);
        console.log("Successful deletion");
    });
    comments.deleteMany({ videoId: req.params.id }, function (err) {
        console.log("Successful deletion");
    }).then((data) => {
        console.log(data)
    });
})


//v..........>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// app.get('/dashboard/:uid', authenticate, (req, res) => {
//     console.log('in dashboard');
//     var Topviews = [];
//     var sort = [];
//     var sub=[];
//     let temp
//     var flag = 0;
//     var tdata,max

//     console.log('subscribed videos');

//     VideoUpload.find().then((data) => {
//           console.log(data)
//         return res.json(data)
//     }).catch((e) => {
//         res.status(500).send("error")
//     })

//     // User.findOne({
//     //     _id: req.params.uid

//     // }).then((data) => {
//     //     if (data) {

//     //         let tempIds
//     //         temp = data.subscribedTo
//     //         temp.filter(() => {
//     //             tempIds
//     //         })
//     //     }
//     // }).then(() => {
//     //     let finalVideos = [];
//     //     VideoUpload.find().then((data) => {

//     //         tdata = data

//     //         temp.filter((ids) => {
//     //             data.filter((single) => {

//     //                 if (single.uid == ids.userId) {

//     //                     sub.push(single);
//     //                     return data;
//     //                 }

//     //             })
//     //         })
//     //         sort.push(sub)

//     //     }).then((data) => {


//     //         VideoUpload.find().sort({"views":-1}).then((data)=>{
//     //             for(i=0;i<10;i++){
//     //                 Topviews.push(data[i])
//     //             }

//     //             sort.push(Topviews)
//     //         })

//     //             var tarray = [];
//     //             for(i=0;i<temp.length;i++){
//     //                 tarray.push(temp[i]['userId']) 
//     //             }

//     //             VideoUpload.find( { uid: { $nin: tarray } } ).then((data)=>{

//     //             sort.push(data)

//     //             history.aggregate(
//     //                 [
//     //                     {$group : { _id : '$genere', count : {$sum : 1} 

//     //                 },

//     //                 }
//     //                 ],

//     //                 function(err, result) {
//     //                   if (err) {
//     //                     res.send(err);
//     //                   } else {
//     //                   }
//     //                 }
//     //               ).then((result)=>{

//     //                   function getMax(arr, count) {
//     //                     var max;
//     //                     for (var i=0 ; i<arr.length ; i++) {
//     //                         if (max == null || parseInt(arr[i][count]) > parseInt(max[count]))
//     //                             max = arr[i];
//     //                     }
//     //                     return max;
//     //                 }

//     //                  max = getMax(result, "count");




//     //               }).then((output)=>{

//     //                   VideoUpload.find( { genere: { $in: max._id } } ).then((data)=>{
//     //                     //console.log('videos having j2 genere',data.length)
//     //                     //console.log('before pushing data in sort',sort)
//     //                     sort.push(data)
//     //                     //console.log('after pushing data in sort',sort)
//     //                   }).then(()=>{
//     //                     //console.log('sort',sort)
//     //                     return res.json(sort)

//     //                 })

//     //               });

//     //             })

//     //     })

//     // }).catch((e) => {
//     //     res.status(500).send("error")
//     // })



//     //console.log('************************', temp)

// })

//v>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


//v
//view history 

app.get('/view-history/:uid', (req, res) => {
    console.log('user id-------------->',req.params.uid);
    console.log('view history get called ', req.body);
    history.find({'uid': req.params.uid}).then((data) => {
        console.log('***********************',data)
        return res.json(data)
    }).catch((e) => {
        res.status(500).send("error")
    })
});


//v
app.get('/view-profile/:uid', (req, res) => {

    console.log('view profile get called ');



    User.findOne({
        _id: req.params.uid
    }).then((data) => {
        console.log(data)
        return res.json(data)
    }).catch((e) => {
        res.status(500).send("error")
    })

});


//v
var viewsc;

app.patch('/dashboard/:uid', (req, res) => {

    console.log('dashboard patch called ');
    console.log('body=========', req.body)




    VideoUpload.findOne({
        _id: req.body.id

    }).then((data) => {
        if (data) {
            console.log(data)
            viewsc = data.views;
            return true;
        }

        return false;
    })

        .then((updateViews) => {
            console.log('update views', updateViews)

            if (updateViews) {
                VideoUpload.findOneAndUpdate({
                    _id: req.body.id

                }, {

                    $set: {
                        views: viewsc + 1
                    }
                }
                ).then(() => {
                    console.log('body', req.body)
                    res.send({ message: 'Updated successfully.' })
                })
            }
            else {
                res.send({ 'message': 'there is some problem in updating data  ' });
            }
        })

});




//v>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var d1, d2, d3;
var l1, l2, l3;
var canLikec, candisLikec

candisLikec = 0;

app.patch('/view-video/:videoId', (req, res) => {
    // let like = req.body.flag;
    // console.log('flag--------->',like)
    console.log('in patch');
    //  console.log(req.body.id)
    //  console.log(req.body.like)
    //  console.log(req.body.map)
    // console.log(req.body.canLike)



    console.log('subcribe--->', req.body)




    //-----------------subscribe ----------------------------------------


    var suid;

    if (req.body.map == 'subscribe') {


        VideoUpload.findOne({
            _id: req.body.videoId

        }).then((data) => {
            if (data) {
                console.log('subscribe in then', data)
                console.log('user id', data.uid)
                suid = data.uid;
                // replyc[0] = 'uid',
                // replyc[1] = 'reply'
                // console.log(replyc[0]);
                // console.log(replyc[1]);
                return true;
            }

            return false;
        })

            .then((updateUser) => {
                console.log('update comments', updateUser)

                if (updateUser) {
                    User.findOneAndUpdate({
                        _id: req.body.userId

                    }, {

                        $push: {


                            subscribedTo: [


                                {
                                    userId: suid,

                                },



                            ]


                        }


                    }
                    ).then(() => {
                        console.log('body', req.body)
                        res.send({ message: 'Updated successfully.' })
                    })
                }


                else {
                    res.send({ 'message': 'there is some problem in updating data  ' });
                }
            })


    }






















    //-----------------end of subscribe ------------------------------------



    if (req.body.map == 'reply') {
        console.log('hello')

        comments.findOne({
            _id: req.body.cid
        }).then((replyc) => {
            console.log('reply in then', replyc)
            replyc[0] = 'uid',
                replyc[1] = 'reply'
            console.log(replyc[0]);
            console.log(replyc[1]);
            return true;
        }


        )
    }





    /////////////----------------------Reply-------------------------------

    if (req.body.map == 'reply') {


        comments.findOne({
            _id: req.body.cid

        }).then((replyc) => {
            if (replyc) {
                console.log('reply in then', replyc)
                replyc[0] = 'uid',
                    replyc[1] = 'reply'
                console.log(replyc[0]);
                console.log(replyc[1]);
                return true;
            }

            return false;
        }).then((updateComments) => {
            console.log('update comments', updateComments)

            if (updateComments) {
                comments.findOneAndUpdate({
                    _id: req.body.cid

                }, {

                    $push: {


                        cReply: [


                            {
                                userId: req.body.uid,
                                reply: req.body.reply
                            },

                        ]

                    }

                }
                ).then(() => {
                    console.log('body', req.body)
                    res.send({ message: 'Updated successfully.' })
                })
            }


            else {
                res.send({ 'message': 'there is some problem in updating data  ' });
            }
        })


    }


    if (req.body.map == 'spam') {


        VideoUpload.findOne({
            _id: req.body.id

        }).then((spam) => {
            if (spam) {
                console.log('spam', spam)
                d3 = spam._id;
                l3 = spam.spamCount;
                return true;
            }

            return false;
        }).then((updateVideos) => {
            if (updateVideos) {
                VideoUpload.findOneAndUpdate({
                    _id: d3

                }, {

                    $set: {
                        spamCount: l3 + 1,
                    }
                    //  $set: { $inc:{like:req.body.flag}}

                }
                ).then(() => {
                    console.log('body', req.body)
                    res.send({ message: 'Updated successfully.' })
                })
            }
            else {
                res.send({ 'message': 'error ' });
            }
        })


    }

    if (req.body.map == 'like') {
        comments.findOne({
            _id: req.body.id

        }).then((likel) => {
            if (likel) {
                console.log('likel', likel)
                d1 = likel._id;
                l1 = likel.like;
                canLikec = likel.canLike
                return true;
            }

            return false;
        }).then((updateComments) => {
            // console.log('update comments', updateComments)
            if (canLikec == 0) {
                if (updateComments) {
                    comments.findOneAndUpdate({
                        _id: d1

                    }, {

                        $set: {
                            like: l1 + 1,
                            canLike: 1
                        }
                        //  $set: { $inc:{like:req.body.flag}}

                    }
                    ).then(() => {
                        console.log('body', req.body)
                        res.send({ message: 'Updated successfully.' })
                    })
                }

            }
            else {
                res.send({ 'message': 'you can not like again ' });
            }
        })


    }

    if (req.body.map == 'dislike') {


        comments.findOne({
            _id: req.body.id

        }).then((dislikel) => {
            if (dislikel) {
                console.log('dislikel', dislikel)
                d2 = dislikel._id;
                l2 = dislikel.like;
                candisLikec = dislikel.canLike
                console.log('dislike-------------->', candisLikec)
                return true;
            }

            return false;
        }).then((updateComments) => {
            // console.log('update comments', updateComments)
            if (candisLikec == 0) {
                if (updateComments) {
                    comments.findOneAndUpdate({
                        _id: d1

                    }, {
                        $set: {
                            dislike: l2 + 1,
                            candisLikec: 1
                        }
                    }
                    ).then(() => {
                        console.log('body', req.body)
                        res.send({ message: 'Updated successfully.' })
                    })
                }
            }
            else {
                res.send({ 'message': 'you can not dislike again ' });
            }
        })
    }

});


//v>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


app.post('/user-profile', authenticate, require('./storage'), (req, res) => {
    // console.log(req.file.filename)
    // const videoPath = 'http://localhost:3000/' + req.file.filename; // Note: set path dynamically
    const m3u8 = 'http://localhost:3000/' + req.file.filename.split('.').slice(0, -1).join('.') + "/playlist.m3u8";
    console.log("m3u8:", m3u8)

    let newTask = new VideoUpload({
        url: m3u8,
        title: req.body.title,
        genere: req.body.genere,
        description: req.body.description,
        uid: req.body.uid,
        spamCount: 0,
        views: 0


    });
    newTask.save().then(() => {
        res.json({
            newTask: {
                ...newTask._doc
            },
        })
    })
    ffm(req.file.filename)


});

//v
var otp, email;

app.post('/forgot-password', (req, res) => {
    console.log('forgot password called');
    email = req.body.email;
    console.log(req.body.email);
    otp = Math.floor(Math.random() * Math.floor(10000000));
    console.log(otp)
    //sending mail
    ///////////////////////////////////




    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vishva.thakkar@volansys.com',
            pass: 'Vishva@033'
        }
    });

    var mailOptions = {
        from: 'vishvathakkar1@gmail.com',
        to: email,
        subject: 'Sending Email using Node.js',
        text: 'email from watchista Your OTP is' + otp
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });



    ////////////////////////////

    User.findOne({
        email: req.body.email

    }).then((data) => {
        //console.log(data)
        return res.send({ message: 'otp send successfully.' })
    }).catch((e) => {
        res.status(500).send("error")
    })


})

//v
app.post('/verify-otp', (req, res) => {
    console.log('verify otp');
    console.log(req.body);

    console.log('genereted', otp);

    if (req.body.otp == otp) {
        res.send({ message: "otp matched" })

    }
    else {
        res.send({ message: "something went wrong!" })
    }
});


//v

var pswd, hashGenrated;
app.patch('/change-password', (req, res) => {
    console.log('change password');
    console.log(req.body);
    console.log(email)
    console.log(req.body.pswd)
    pswd = req.body.pswd;
    let costFactor = 10;
    bcrypt.genSalt(costFactor, (err, salt) => {
        bcrypt.hash(pswd, salt, (err, hash) => {
            hashGenrated = hash;
            console.log('hash', hash);

            User.findOne({
                email: email

            }).then((updatepwd) => {
                console.log('update pwd', updatepwd)

                if (updatepwd) {
                    User.findOneAndUpdate({
                        email: email



                    }, {

                        $set: {



                            password: hashGenrated
                        }


                    }
                    ).then(() => {
                        console.log('body', req.body)
                        res.send({ message: 'Updated successfully.' })
                    })
                }


                else {
                    res.send({ 'message': 'there is some problem in updating data  ' });
                }
            })


        })
    })

});

//v>>>>>>>>>>>
app.patch('/view-profile/:uid', (req, res) => {
    console.log('view profile patch called');

    console.log('patch body', req.body)
    console.log(req.params.id)

    User.findOne({
        _id: req.body.userId

    })

        .then((updateData) => {
            console.log('update data', updateData)

            if (updateData) {
                User.findOneAndUpdate({
                    _id: req.body.userId

                }, {

                    $set: {
                        uname: req.body.uname,
                        email: req.body.email,
                        aboutme: req.body.aboutme
                    }
                }
                ).then(() => {
                    console.log('body', req.body)
                    res.send({ message: 'Updated successfully.' })
                })
            }
            else {
                res.send({ 'message': 'there is some problem in updating data  ' });
            }
        })
});

//v>>>>>>>>>>


app.get('/dashboard/:uid', authenticate, (req, res) => {
    console.log('in dashboard');
    var Topviews = [];
    var sort = [];
    var sub = [];
    let temp
    var flag = 0;
    var tdata, max

    console.log('subscribed videos');


    User.findOne({
        _id: req.params.uid

    }).then((data) => {
        if (data) {

            let tempIds
            temp = data.subscribedTo
            temp.filter(() => {
                tempIds
            })
        }
    }).then(() => {
        let finalVideos = [];
        VideoUpload.find().then((data) => {

            tdata = data

            temp.filter((ids) => {
                data.filter((single) => {

                    if (single.uid == ids.userId) {

                        sub.push(single);
                        return data;
                    }

                })
            })
            sort.push(sub)

        }).then((data) => {


            VideoUpload.find().sort({ "views": -1 }).then((data) => {
                for (i = 0; i < 10; i++) {
                    Topviews.push(data[i])
                }

                sort.push(Topviews)
            })

            var tarray = [];
            for (i = 0; i < temp.length; i++) {
                tarray.push(temp[i]['userId'])
            }

            VideoUpload.find({ uid: { $nin: tarray } }).then((data) => {

                sort.push(data)

                history.aggregate(
                    [
                        {
                            $group: {
                                _id: '$genere', count: { $sum: 1 }

                            },

                        }
                    ],

                    function (err, result) {
                        if (err) {
                            res.send(err);
                        } else {
                        }
                    }
                )
                    .then((result) => {

                        function getMax(arr, count) {
                            var max;
                            for (var i = 0; i < arr.length; i++) {
                                if (max == null || parseInt(arr[i][count]) > parseInt(max[count]))
                                    max = arr[i];
                            }
                            return max;
                        }

                        max = getMax(result, "count");




                    }).then((output) => {

                        VideoUpload.find({ genere: { $in: max._id } }).then((data) => {
                            //console.log('videos having j2 genere',data.length)
                            //console.log('before pushing data in sort',sort)
                            sort.push(data)
                            //console.log('after pushing data in sort',sort)
                        }).then(() => {
                            //console.log('sort',sort)
                            return res.json(sort)

                        })

                    });

            })

        })

    }).catch((e) => {
        res.status(500).send("error")
    })
})

app.post('/login-page', (req, res) => {
    // We want to create a new list and return the new list document back to the user (which includes the id)
    // The list information (fields) will be passed in via the JSON request body

    flag = 1
    let g_id = req.body.g_id;
    let g_name = req.body.g_name;
    let g_email = req.body.g_email;
    let g_authToken = req.body.g_authToken;
    let body = req.body;
    //console.log('Body print:::::', body)
    let newUser = new guser(body)

    // console.log('pata data', g_id, g_name, g_email)
    newUser.save().then(() => {
        // console.log('>>>>>>>>>>>>>>>>>>>>>>.saved ')

        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user
        //  console.log('<<<<<<<<<<<<<<<<after session')
        return newUser.generateAccessAuthToken().then((accessToken) => {
            // console.log('acess token', accessToken);
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })

});




// -----------signup with auth------------------


app.post('/table-list', (req, res) => {
    // User sign up
    let body = req.body;
    console.log('body', body)

    let userName = req.body.uname;
    console.log(typeof (userName));

    let firstetter = userName.slice(0, 1)
    var imagePath = '';



    imagePath = 'http://localhost:3000/alphabat/' + firstetter + '.png';



    let newUser = new User({
        uname: req.body.uname,
        email: req.body.email,
        password: req.body.password,
        aboutme: req.body.aboutme,
        photoUrl: imagePath,

    });

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.get('/users/me/access-token', verifySession, (req, res) => {
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken })
    }).catch((e) => {
        res.status(400).send(e);
    })
})



module.exports = { http };

//app.listen(3000, ()=> console.log('Up and running'))
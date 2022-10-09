var axios = require('axios');
var FCM = require('fcm-node');
var serverKey = process.env.FIREBASE_SERVER_KEY; //put your server key here
var fcm = new FCM(serverKey);

const showResponse = (status, message, data = null, other = null, code = null) => {
    let response = {}
    response.status = status
    response.message = message
    if (data !== null) {
        response.data = data
    }
    if (other !== null) {
        response.other = other
    }
    if (code !== null) {
        response.code = code
    }
    return response;
}

const showOutput = (res, response, code) => {
    delete response.code;
    res.status(code).json(response);
}

const randomStr = (len, arr) => {
    var digits = arr;
    let OTP = '';
    for (let i = 0; i < len; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    if (OTP.length < len || OTP.length > len) {
        randomStr(len, arr);
    }
    return (OTP);
}

const showConsole = (content) => {
    // console.log(content);
}

const validateParams = (request, feilds) => {
    var postKeys = [];
    var missingFeilds = [];
    for (var key in request.body) {
        postKeys.push(key);
    }
    for (var i = 0; i < feilds.length; i++) {
        if (postKeys.indexOf(feilds[i]) >= 0) {
            if (request.body[feilds[i]] == "")
                missingFeilds.push(feilds[i]);
        } else {
            missingFeilds.push(feilds[i]);
        }
    }
    if (missingFeilds.length > 0) {
        let response = showResponse(false, `Following fields are required : ${missingFeilds}`)
        return response;
    }
    let response = showResponse(true, ``)
    return response;
}

const validateParamsArray = (data, feilds) => {
    var postKeys = [];
    var missingFeilds = [];
    for (var key in data) {
        postKeys.push(key);
    }
    for (var i = 0; i < feilds.length; i++) {
        if (postKeys.indexOf(feilds[i]) >= 0) {
            if (data[feilds[i]] == "")
                missingFeilds.push(feilds[i]);
        } else {
            missingFeilds.push(feilds[i]);
        }
    }
    if (missingFeilds.length > 0) {
        let response = showResponse(false, `Following fields are required : ${missingFeilds}`)
        return response;
    }
    let response = showResponse(true, ``)
    return response;
}

const sendSMS = (mobile, message) => {
    return new Promise((resolve, reject) => {
        var config = {
            method: 'get',
            url: 'https://sms.sslwireless.com/pushapi/dynamic/server.php?user=' + process.env.SMS_USER + '&pass=' +
                process.env.SMS_PASS + '&sms=' + message + '&sid=' + process.env.SMS_SENDER_ID + '&msisdn=' + mobile + '&csmsid=123456789',
            headers: {}
        };
        axios(config)
            .then((response) => {
                // console.log("in then",response)
                return resolve(true);
            })
            .catch((error) => {
                // console.log("in error",error)
                return resolve(false);
            });
    });
}

const sendCurlNotification = (title, body, notif_data, tokens) => {
    var data = JSON.stringify({
        "notification": {
            "title": title,
            "body": body,
        },
        "data": notif_data,
        "to": tokens
    });
    var config = {
        method: 'post',
        url: process.env.FIREBASE_URL,
        headers: {
            'Authorization': 'key=' + process.env.FIREBASE_SERVER_KEY,
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            // console.log(error);
        });
}

const dynamicSort = (property) => {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    }
}

const arraySort = (arr) => {
    arr.sort((a, b) => (a.index > b.index) ? 1 : (a.index === b.index) ? ((a.index > b.index) ? 1 : -1) : -1)
    return (arr);
}

const validateEmail = (email) => {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
        return true
    }
    return false
}

const validatePassword = (password) => {
    var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (password.match(passw)) {
        return true;
    }
    return false;
}

const groupArray = (array, key) => {
    let group = array.reduce((r, a) => {
        r[a[key]] = [...r[a[key]] || [], a];
        return r;
    }, {});
    return [group]
}

const sendFcmNotification = (to, data, show) => {
    return new Promise((resolve, reject) => {
        data  = {...data, show: show?show:false}
        var message = { 
            to: to,
            priority: 'high', 
            notification: data,
            data
        };
        fcm.send(message, (err, response) => {
            if (err) {
                console.log(err)
                resolve(err)
            }
            resolve(JSON.parse(response))
        });
    })
}

const sendFcmNotificationMultiple = (to, data, show) => {
    return new Promise((resolve, reject) => {
        data  = {...data, show: show?show:false}
        var message = { 
            registration_ids: to,
            priority: 'high', 
            notification: data,
            data
        };
        fcm.send(message, (err, response) => {
            if (err) {
                console.log(err)
                resolve(err)
            }
            resolve(JSON.parse(response))
        });
    })
}

const capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const getDistanceFromLatLonInKm = (lat1,lon1,lat2,lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}
  
const deg2rad = (deg) => {
    return deg * (Math.PI/180)
}

module.exports = {
    showResponse,
    showOutput,
    randomStr,
    validateParams,
    validateParamsArray,
    showConsole,
    sendSMS,
    sendCurlNotification,
    dynamicSort,
    validateEmail,
    validatePassword,
    arraySort,
    groupArray,
    sendFcmNotification,
    sendFcmNotificationMultiple,
    capitalize,
    getDistanceFromLatLonInKm
}
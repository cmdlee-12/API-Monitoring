import '../lib/collections.js'
import {
  SSR,
  Template
} from 'meteor/meteorhacks:ssr';

var moment = Npm.require('moment');
var slackBot = Npm.require('slack-bot')(Meteor.settings.private.webhookUrl);

function postToSlack(message) {
  // console.log(message);
  Meteor._sleepForMs(4000); //I put a delay, just so that the React Head Tags get loaded, OpenGraph, Twitter, meta, etc.
  slackBot.send({
    username: 'new-updates',
    text: message,
    unfurl_links: true,
    unfurl_media: true,
  }, function (err, res) {
    if (err) {
      throw err;
    }
    // console.log(res);
  });
}

Meteor.users.allow({
  insert: function (userId, doc) {
    return userId;
  },

  update: function (userId, doc, fields, modifier) {
    return doc.fields === fields;

  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.userId === userId;
  }
})

Meteor.startup(() => {

  // code to run on server at startup
  process.env.MAIL_URL = "smtp://apikey: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:465"; //only change 'yourApiKey' and the port(if required)

  FutureTasks.find().forEach(function (task) {
    Meteor.call("addStatusCheck", task.apiId, task.frequency, task.createdBy);
  });
  individualGraphsTasks.find().forEach(function (task) {
    var now = new Date();
    Date.daysBetween = function (date1, date2) {
      //Get 1 day in milliseconds
      var one_day = 1000 * 60 * 60 * 24;

      // Convert both dates to milliseconds
      var date1_ms = date1.getTime();
      var date2_ms = date2.getTime();

      // Calculate the difference in milliseconds
      var difference_ms = date2_ms - date1_ms;

      // Convert back to days and return
      return Math.round(difference_ms / one_day);
    }
    var daysDifference = (Date.daysBetween(now, task.lastReset));
    if (daysDifference < 0) {
      var statusRecord = [];
      var lastReset = new Date();
      individualGraphsTasks.update({
        createdBy: task.createdBy
      }, {
        $set: {
          lastReset: lastReset
        }
      });
      apiAddress.update({
        createdBy: task.createdBy
      }, {
        $set: {
          statusRecord: statusRecord
        }
      }, {
        multi: true
      });
      Meteor.call("resetIndividualGraphs", task.createdBy);
    } else {
      Meteor.call("resetIndividualGraphs", task.createdBy);
    }

  });

  overallGraphsTasks.find().forEach(function (task) {
    Meteor.call("overallErrorChecker", task.createdBy);
  });

  SyncedCron.start();
});

Meteor.methods({
  'getLastRun': function (id, url) {
    var apiAddress1 = apiAddress.find({
      propertyID: id
    }).fetch();

    var final = [];
    for (var i = 0; i < apiAddress1.length; i++) {
      final.push({
        updatedTime: apiAddress1[i].updatedTime
      })
    }

    Properties.update({
      _id: id
    }, {
      $set: {
        lastRun: final[0].updatedTime
      }
    })
  },
  'getStatus': function (id) {
    var apiAddress1 = apiAddress.find({
      propertyID: id
    }).fetch();
    var final = [];
    for (var x = 0; x < apiAddress1.length; x++) {
      final.push({
        responseTime: apiAddress1[x].responseTime
      })
    }
    if (final[0].responseTime == "FAIL") {
      Properties.update({
        _id: id
      }, {
        $set: {
          status: "Down"
        }
      })
    } else {
      Properties.update({
        _id: id
      }, {
        $set: {
          status: "Up"
        }
      })
    }

  },
  'getPageSpeed': function (id, response) {
    if (response == "Site Not Found") {
      Properties.update({
        _id: id
      }, {
        $set: {
          pageSpeed: response
        }
      })
    } else {
      Properties.update({
        _id: id
      }, {
        $set: {
          pageSpeed: response + "%"
        }
      })
    }
  },
  'getUpDownTime': function (id) {
    var downTime = [];

    var apiAddress1 = apiAddress.find({
      propertyID: id
    }).fetch();

    for (var i = 0; i < apiAddress1.length; i++) {
      for (var j = 0; j < apiAddress1[i].statusRecord.length; j++) {
        if (apiAddress1[i].statusRecord[j].responseTime == 0) {
          downTime.push(apiAddress1[i].statusRecord[j].time);
        }
      }
    }

    if (downTime.length == 0) {
      Properties.update({
        _id: id
      }, {
        $set: {
          uptime: 100,
          downtime: 0
        }
      })
    } else {

      var diff = new Date("1970-1-1 " + downTime[downTime.length - 1]) - new Date("1970-1-1 " + downTime[0]);
      var seconds = Math.floor(diff / 1000);
      var minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;
      var hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      var finalDowntime = ((((minutes * 60) + seconds) / 86400) * 100).toFixed(2);
      var finalUptime = (100 - finalDowntime).toFixed(2);

      Properties.update({
        _id: id
      }, {
        $set: {
          uptime: finalUptime,
          downtime: finalDowntime
        }
      })
    }
  },
  'updateProperty': function (id, name, url, isStarred) {
    Properties.update({
      _id: id
    }, {
      $set: {
        propertyName: name,
        propertyURL: url,
        isStarred: isStarred
      }
    })
  },
  'addProperties': function (name, url, isStarred) {
    var currentUser = Meteor.userId();
    Properties.insert({
      createdBy: currentUser,
      propertyName: name,
      propertyURL: url,
      isStarred: isStarred
    });
  },
  'updateApi': function (name, address, getOrPost, usageOrStatus, authentication, frequency, propertyID, isProperty) {
    console.dir(address);
    console.dir(authentication);
    var currentUser = Meteor.userId();
    var username = Meteor.users.findOne({
      _id: currentUser
    }).username;

    var propertyName = [];
    var property = Properties.find({
      _id: propertyID
    }).fetch();

    for (var i = 0; i < property.length; i++) {
      propertyName.push({
        name: property[i].propertyName,
        url: property[i].propertyURL
      })
    }

    if (apiAddress.find({
        createdBy: currentUser,
        apiAddress: address
      }).count() > 0) {
      return "You have used this API url for a different API already";
    } else {
      addingApiSearch.insert({
        createdBy: currentUser
      });

      if (getOrPost === "GET") {
        try {
          var res = [];
          var responseTime;
          if (authentication) {
            var start = new Date();
            res = HTTP.get(address, {
              auth: authentication
            });
            responseTime = new Date() - start;
            var postingTime = moment(start).format("MMM Do YYYY, h:mm:ss a");
            try {
              apiAddress.insert({
                createdByName: username,
                createdBy: currentUser,
                apiName: name,
                apiAddress: address,
                authentication: authentication,
                getOrPost: getOrPost,
                usageOrStatus: usageOrStatus,
                response: res.data,
                updatedTime: postingTime,
                headers: res.headers,
                status: "pass",
                frequency: frequency,
                responseTime: responseTime,
                propertyID: propertyID,
                propertyName: propertyName[0].name,
                propertyURL: propertyName[0].url,
                isProperty: isProperty
              });

            } catch (err) {
              apiAddress.insert({
                createdByName: username,
                createdBy: currentUser,
                apiName: name,
                apiAddress: address,
                authentication: authentication,
                getOrPost: getOrPost,
                usageOrStatus: usageOrStatus,
                response: "Response was too long.",
                updatedTime: postingTime,
                headers: res.headers,
                status: "pass",
                frequency: frequency,
                responseTime: responseTime,
                propertyID: propertyID,
                propertyName: propertyName[0].name,
                propertyURL: propertyName[0].url,
                isProperty: isProperty
              });
            }
          } else {
            var start = new Date();
            res = HTTP.get(address);
            responseTime = new Date() - start;
            var postingTime = moment(start).format("MMM Do YYYY, h:mm:ss a");
            try {
              apiAddress.insert({
                createdByName: username,
                createdBy: currentUser,
                apiName: name,
                apiAddress: address,
                getOrPost: getOrPost,
                usageOrStatus: usageOrStatus,
                response: res.data,
                updatedTime: postingTime,
                headers: res.headers,
                status: "pass",
                frequency: frequency,
                responseTime: responseTime,
                propertyID: propertyID,
                propertyName: propertyName[0].name,
                isProperty: isProperty
              });

            } catch (err) {
              apiAddress.insert({
                createdByName: username,
                createdBy: currentUser,
                apiName: name,
                apiAddress: address,
                getOrPost: getOrPost,
                usageOrStatus: usageOrStatus,
                response: "Response was too long.",
                updatedTime: postingTime,
                headers: res.headers,
                status: "pass",
                frequency: frequency,
                responseTime: responseTime,
                propertyID: propertyID,
                propertyName: propertyName[0].name,
                isProperty: isProperty
              });
            }
          }
          if (apiAddress.find({
              createdBy: currentUser
            }).count() === 1) {
            var start = new Date();
            if (apiErrors.find({
                createdBy: currentUser
              }).count === 0) {
              apiErrors.insert({
                createdBy: currentUser
              });
            }
            Meteor.call("overallErrorChecker", currentUser);
            Meteor.call("resetIndividualGraphs", currentUser);
            individualGraphsTasks.remove({
              createdBy: currentUser
            });
            individualGraphsTasks.insert({
              createdBy: currentUser,
              lastReset: start
            });
            overallGraphsTasks.remove({
              createdBy: currentUser
            });
            overallGraphsTasks.insert({
              createdBy: currentUser
            });
          }
          //console.dir(res.statusCode); if you want to show the status code of the API call
        } catch (err) {
          addingApiSearch.remove({
            createdBy: currentUser
          });
          console.log("Error: ", err);

          return err.response.content;
        }
        addingApiSearch.remove({
          createdBy: currentUser
        });
        var apiId = apiAddress.findOne({
          createdBy: currentUser,
          apiName: name,
          apiAddress: address
        })._id;
        Meteor.call('apiRefresher', frequency, apiId);
        FutureTasks.insert({
          createdBy: currentUser,
          frequency: frequency,
          apiId: apiId
        });
      } else {
        var res = HTTP.post(address);
        apiAddress.insert({
          createdByName: username,
          createdBy: currentUser,
          apiName: name,
          apiAddress: address,
          getOrPost: getOrPost,
          usageOrStatus: usageOrStatus,
          path: path,
          response: res.data
        });
      }
    }

  },
  'updatePropertyAPI': function (id, name) {
    apiAddress.update({
      _id: id
    }, {
      $set: {
        apiName: name,
      }
    })
  },
  'getLastRunAPI': function (id) {
    var apiAddress1 = apiAddress.find({
      _id: id
    }).fetch();
    var final = [];
    for (var i = 0; i < apiAddress1.length; i++) {
      final.push({
        updatedTime: apiAddress1[i].updatedTime
      })
    }
    apiAddress.update({
      _id: id
    }, {
      $set: {
        updatedTime: final[0].updatedTime
      }
    })
  },
  'updateProfile': function (user_id, title, firstName, lastName, email, phone, country) {
    var user_title_name = title+" "+firstName+" "+lastName;
    Meteor.users.update({
      _id: user_id
    }, {
      $set: {
        username: user_title_name,
        "profile.title":title,
        "profile.firstName":firstName,
        "profile.lastName":lastName,
        "profile.phone": phone,
        "profile.country":country,
        "emails.0.address": email
      }
    });
  },
  'checkPassword': function (id, oldPassword){
    Accounts._checkPassword(id, oldPassword);
  },
  'removeApi': function (id) {
    apiAddress.remove({
      _id: id
    });
    FutureTasks.remove({
      apiId: id
    });
    SyncedCron.remove(id);

  },
  'resetIndividualGraphs': function (currentUser) {
    SyncedCron.add({
      name: "resettingIndividualGraphs",
      schedule: function (parser) {
        return parser.text('every 24 hours');
      },
      job: function () {
        var statusRecord = [];
        var lastReset = new Date();
        individualGraphsTasks.update({
          createdBy: currentUser
        }, {
          $set: {
            lastReset: lastReset
          }
        });
        apiAddress.update({
          createdBy: currentUser
        }, {
          $set: {
            statusRecord: statusRecord
          }
        }, {
          multi: true
        });
        return "resettingIndividualGraphs";
      }
    });
  },

  'overallErrorChecker': function (currentUser) {
    SyncedCron.add({
      name: "errorChecker",
      schedule: function (parser) {
        return parser.text('every 1 hour');
      },
      job: function () {
        var errors = apiAddress.find({
          createdBy: currentUser,
          status: "fail"
        }).fetch();
        var totalErrors = apiAddress.find({
          createdBy: currentUser,
          status: "fail"
        }).count();
        var errorTime = new Date();
        errorTime = moment(errorTime).format("MMM Do YYYY, h:mm:ss a");
        if (totalErrors > 0) {
          var error = [];
          for (var i = 0; i < errors.length; i++) {
            error.push({
              apiName: errors[i].apiName,
              totalErrors: totalErrors,
              errorTime: errorTime
            });
          }
          apiErrors.update({
            createdBy: currentUser
          }, {
            $addToSet: {
              errors: error
            }
          });
          apiErrors.update({
            createdBy: currentUser
          }, {
            $set: {
              totalErrors: totalErrors
            }
          });
        } else {
          var error = {
            apiName: "No errors",
            totalErrors: 0,
            errorTime: errorTime
          }
          apiErrors.update({
            createdBy: currentUser
          }, {
            $addToSet: {
              errors: error
            }
          });
          apiErrors.update({
            createdBy: currentUser
          }, {
            $set: {
              totalErrors: 0
            }
          });
        }

        FutureTasks.remove(id);
        SyncedCron.remove(id);
        return "errorChecker";
      }
    });

  },

  'changeFreqency': function (frequency, id) {
    console.dir("Changing frequncy");
    console.log("Changing frequncy");
    var currentUser = Meteor.userId();
    SyncedCron.remove(id);
    apiAddress.update({
      _id: id,
      createdBy: currentUser
    }, {
      $set: {
        frequency: frequency
      }
    });
    Meteor.call("apiRefresher", frequency, id);
    FutureTasks.update({
      createdBy: currentUser,
      apiId: id
    }, {
      $set: {
        frequency: frequency
      }
    });
  },
  'changeFreqencyProperty': function (frequency, id) {
    console.dir("Changing frequncy");
    console.log("Changing frequncy");
    var currentUser = Meteor.userId();
    SyncedCron.remove(id);
    apiAddress.update({
      propertyID: id,
      createdBy: currentUser
    }, {
      $set: {
        frequency: frequency
      }
    });
    Meteor.call("apiRefresher", frequency, id);
    FutureTasks.update({
      createdBy: currentUser,
      apiId: id
    }, {
      $set: {
        frequency: frequency
      }
    });
  },
  'apiRefresher': function (frequency, apiId) {
    console.dir("Adding api for status checks");
    var currentUser = Meteor.userId();
    var username = ((Meteor.user()).username);
    var email = (Meteor.user().emails[0].address);
    Meteor.call("addStatusCheck", apiId, frequency, currentUser);

  },

  'addStatusCheck': function (apiId, frequency, currentUser) {
    console.dir(frequency);
    SyncedCron.add({
      name: apiId,
      schedule: function (parser) {
        return parser.text(frequency);
      },
      job: function () {
        Meteor.call("checkStatus", apiId, currentUser);
        // FutureTasks.remove(id);
        // SyncedCron.remove(id);
        return apiId;
      }
    });
  },

  'checkStatus': function (apiId, currentUser) {
    console.dir("checking status");
    var api = apiAddress.findOne({
      _id: apiId,
      createdBy: currentUser
    });
    var address = api.apiAddress;
    var authentication;
    if (api.authentication) {
      authentication = api.authentication;
    } else {
      authentication = '';
    }
    var getOrPost = api.getOrPost
    if (getOrPost === "GET") {
      var postingTime1 = new Date();
      postingTime = moment(postingTime1).format("MMM Do YYYY, h:mm:ss a");
      postingHour = moment(postingTime1).format("h:mm:ss a");
      try {
        var res = [];
        var responseTime;
        if (authentication) {
          var start = new Date();
          res = HTTP.get(address, {
            auth: authentication
          });
          responseTime = new Date() - start;
        } else {
          var start = new Date();
          res = HTTP.get(address);
          responseTime = new Date() - start;
        }
        //console.dir(res.statusCode); if you want to show the status code of the API call
        var statusRecord = {
          time: postingHour,
          responseTime: responseTime
        }
        try {
          console.dir(statusRecord);

          apiAddress.update({
            _id: apiId,
            createdBy: currentUser
          }, {
            $set: {
              response: res.data,
              headers: res.headers,
              updatedTime: postingTime,
              responseTime: responseTime,
              status: "pass"
            }
          });
          apiAddress.update({
            _id: apiId,
            createdBy: currentUser
          }, {
            $push: {
              statusRecord: statusRecord
            }
          });
        } catch (err) {
          apiAddress.update({
            _id: apiId,
            createdBy: currentUser
          }, {
            $set: {
              response: "Response is too long.",
              headers: res.headers,
              responseTime: responseTime,
              status: "pass",
              updatedTime: postingTime
            }
          }, {
            $push: {
              statusRecord: statusRecord
            }
          });
          apiAddress.update({
            _id: apiId,
            createdBy: currentUser
          }, {
            $push: {
              statusRecord: statusRecord
            }
          });
        }
      } catch (err) {
        console.dir("Line 14: " + err);
        var statusRecord = {
          time: postingHour,
          responseTime: 0
        }
        apiAddress.update({
          _id: apiId,
          createdBy: currentUser
        }, {
          $set: {
            response: err,
            status: "fail",
            updatedTime: postingTime,
            responseTime: "FAIL"
          }
        });
        apiAddress.update({
          _id: apiId,
          createdBy: currentUser
        }, {
          $push: {
            statusRecord: statusRecord
          }
        });
        var error = apiAddress.findOne({
          _id: apiId,
          createdBy: currentUser
        }).apiName;
        var totalErrors = apiAddress.find({
          createdBy: currentUser,
          status: "fail"
        }).count();
        console.log();

        apiErrors.update({
          createdBy: currentUser
        }, {
          $addToSet: {
            errors: error
          }
        });
        apiErrors.update({
          createdBy: currentUser
        }, {
          $set: {
            totalErrors: totalErrors
          }
        });

        var userEmail = Meteor.users.findOne({
          _id: currentUser
        }).emails[0].address;

        Meteor.call("sendErrorEmail", error, userEmail);
        // Meteor.call("postToSlack", "The following API failed at " + postingTime + ": " + error);
      }
    } else {
      var res = HTTP.post(address);
      apiAddress.insert({
        createdBy: currentUser,
        apiName: name,
        apiAddress: address,
        getOrPost: getOrPost,
        usageOrStatus: usageOrStatus,
        path: path,
        response: res.data
      });
    }
  },
  "sendErrorEmail": function (api, userEmail) {

    SSR.compileTemplate('apiError', Assets.getText('api-error.html'));
    var emailData = {
      apis: api
    }
    Email.send({
      to: userEmail,
      from: "restestapp@gmail.com",
      subject: "RESTest - API Error",
      html: SSR.render('apiError', emailData),
    });
  }
});
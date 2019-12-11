Template.mainDashboard.onRendered(function () {
  sideBar();

  function sideBar() {
    $('.sidebar-toggle img').click(function () {
      $('.content-side__wrapper').toggle();
    })
  }

  Chart.pluginService.register({
    beforeDraw: function (chart) {
      if (chart.config.options.elements.center) {
        //Get ctx from string
        var ctx = chart.chart.ctx;
        //Get options from the center object in options
        var centerConfig = chart.config.options.elements.center;
        var fontStyle = centerConfig.fontStyle || 'Arial';
        var txt = centerConfig.text;
        var color = centerConfig.color || '#000';
        var sidePadding = centerConfig.sidePadding || 20;
        var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
        //Start with a base font of 30px
        ctx.font = "40px " + fontStyle;
        //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
        var stringWidth = ctx.measureText(txt).width;
        var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;
        // Find out how much the font can grow in width.
        var widthRatio = elementWidth / stringWidth;
        var newFontSize = Math.floor(30 * widthRatio);
        var elementHeight = (chart.innerRadius * 2);
        // Pick a new font size so it will not be larger than the height of label.
        var fontSizeToUse = Math.min(newFontSize, elementHeight);
        //Set font settings to draw it correctly.
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
        ctx.font = fontSizeToUse + "px " + fontStyle;
        ctx.fillStyle = color;
        //Draw text in center
        ctx.fillText(txt, centerX, centerY);
      }
    }
  });
  var PropertyUD = []
  var id = document.getElementsByClassName("updown-chart");
  for (var i = 0; i < id.length; i++) {
    var properties = Properties.find({
      _id: id[i].value
    }).fetch();
    for (var x = 0; x < properties.length; x++) {
      PropertyUD.push({
        uptime: properties[x].uptime,
        downtime: properties[x].downtime
      })
    }
    this.canvas = document.getElementById('upChart-' + id[i].value);
    this.ctx = this.canvas.getContext('2d');
    var myChart = new Chart(this.ctx, {
      type: 'doughnut',
      data: {
        labels: ["UP", "DOWN"],
        datasets: [{
          label: '',
          data: [PropertyUD[i].uptime, PropertyUD[i].downtime],
          backgroundColor: ['#0FE2FF', '#5E5EEC'],
        }]
      },
      options: {
        elements: {
          center: {
            text: [PropertyUD[i].uptime + "%"],
            color: '#000',
            fontStyle: 'Proxima Nova Rg',
            sidePadding: 20 //
          }
        },
        layout: {
          padding: {
            left: 13,
            right: 13,
            top: 13,
            bottom: 13
          }
        },
        cutoutPercentage: 70,
        legend: {
          display: false
        },
      }
    });
  }

});

Template.mainDashboard.events({
  "click #add": function (event, template) {
    var propertyID = event.target.value;
    var apiName = template.find('#formGroupExampleInput-' + propertyID).value;
    var apiAddress1 = template.find('#formGroupExampleInput2-' + propertyID).value;
    if (apiAddress.find({
        apiAddress: apiAddress1
      }).count() > 0) {
      toastr.error("You have used this API url for a different API already", "Duplicate URL");
    } else {
      var e = document.getElementById('getOrPost-' + propertyID);
      var getOrPost = e.options[e.selectedIndex].text;
      var a = document.getElementById('usageOrStatus-' + propertyID);
      var usageOrStatus = a.options[a.selectedIndex].text;
      var authentication = document.getElementById('authorization-' + propertyID).value;
      var b = document.getElementById('addingFrequency-' + propertyID);
      var frequency = b.options[b.selectedIndex].text;
      var isProperty = "0";
      Meteor.call("updateApi", apiName, apiAddress1, getOrPost, usageOrStatus, authentication, frequency, propertyID, isProperty, function (error, result) {
        if (apiName === "") {
          toastr.error("API Name field is required", 'Error');
        }
        if (apiAddress1 === "") {
          toastr.error("API Endpoint field is required", 'Error');
        }
        if (error) {
          toastr.error(JSON.stringify(result, null, "\t"), 'Error');
        } else {
          toastr.success("API successfully added!", "Sucess")
        }
      });
    }
  },
  "click #add-property": function (event, template) {
    var name = $('#propertyName').val();
    var url = $('#propertyURL').val();
    var isStarred = $('#propertyStarred').is(":checked");
    var urlPattern = new RegExp("^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$");
    var currentUser = Meteor.userId();

    if (name != "" && url != "") {
      if (urlPattern.test(url)) {
        if (Properties.find({
            createdBy: currentUser,
            propertyName: name
          }).count() > 0) {
          toastr.error("Property name already exists", "Duplicate Property");
        } else if (apiAddress.find({
            apiAddress: url
          }).count() > 0) {
          toastr.error("Property URL already exists", 'Duplicate URL');
        } else {
          Meteor.call("addProperties", name, url, isStarred, function (error, result) {
            if (error) {
              toastr.error("error", error);
            } else {
              toastr.success("You have successfully added a new client!", "Good job!");
              var name = $('#propertyName').val();
              var url = $('#propertyURL').val();
              var getOrPost = "GET";
              var usageOrStatus = "Status";
              var authentication = "";
              var frequency = "every 30 seconds";
              var isProperty = "1";

              var properties = Properties.find({
                propertyName: name
              }).fetch();
              var propertyID = [];
              for (var i = 0; i < properties.length; i++) {
                propertyID.push({
                  _id: properties[i]._id
                })
              }
              Meteor.call("updateApi", name, url, getOrPost, usageOrStatus, authentication, frequency, propertyID[0]._id, isProperty, function (error, result) {
                if (error) {
                  toastr.error(JSON.stringify(result, null, "\t"), '1Error');
                } else {
                  Meteor.call("getLastRun", propertyID[0]._id, function (error, result) {
                    if (error) {
                      toastr.error(JSON.stringify(error, null, "\t"), '2Error');
                    } else {
                      Meteor.call("getStatus", propertyID[0]._id, url, function (error, result) {
                        if (error) {
                          toastr.error(JSON.stringify(error, null, "\t"), '3Error');
                        } else {
                          loadClient(propertyID[0]._id, url);

                          function loadClient(propertyID, url) {
                            gapi.client.setApiKey("AIzaSyDuNP8vCo87mQ4RwWl0RVvN9mFXKSHmF48");
                            return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/pagespeedonline/v4/rest")
                              .then(function () {
                                  var propertyURL = url;
                                  var id = propertyID;
                                  return gapi.client.pagespeedonline.pagespeedapi.runpagespeed({
                                      "url": propertyURL,
                                      "filter_third_party_resources": true,
                                      "screenshot": true,
                                      "snapshots": true,
                                      "strategy": "desktop"
                                    })
                                    .then(function (response) {
                                        Meteor.call("getPageSpeed", id, response.result.ruleGroups.SPEED.score, function (error, result) {
                                          if (error) {
                                            toastr.error(JSON.stringify(error, null, "\t"), '4Error');
                                          } else {
                                            setTimeout(function () {
                                              Meteor.call("getUpDownTime", id, function (error, result) {
                                                if (error) {
                                                  toastr.error(JSON.stringify(error, null, "\t"), '5Error');
                                                }
                                                if (result) {
                                                  toastr.error(JSON.stringify(result, null, "\t"), '6Error');
                                                }
                                              });
                                            }, 30000);
                                          }
                                          if (result) {
                                            toastr.error(JSON.stringify(result, null, "\t"), '7Error');
                                          }
                                        });
                                      },
                                      function (err) {
                                        toastr.error("Execute error", err);
                                      });
                                },
                                function (err) {
                                  toastr.error("Error loading GAPI client for API" + err, "Page speed error");
                                });
                          }
                          gapi.load("client");
                        }
                        if (result) {
                          toastr.error(JSON.stringify(result, null, "\t"), '8Error');
                        }
                      });
                    }
                    if (result) {
                      toastr.error(JSON.stringify(result, null, "\t"), '9Error');
                    }
                  });
                }
                if (result) {
                  toastr.error(JSON.stringify(result, null, "\t"), '10Error');
                }
              });
              $('#propertyName').val("");
              $('#propertyURL').val("");
            }
          });


        }
      } else {
        toastr.error("Please enter a valid URL", "Invalid URL");
      }
    } else {
      toastr.error("Fill up the required fields", "Required Fields");
    }
  },
  "click #removeApi": function (event, template) {
    result = event.currentTarget.dataset.value;
    Meteor.call("removeApi", result, function (error, result) {
      if (error) {
        toastr.error("error", error);
      }
      if (result) {

      }
    });
  },
  "click #changeFreqency": function (event, template) {
    result = event.currentTarget.dataset.value;
    var b = document.getElementById("dashboardFrequency-" + result);
    var frequency = b.options[b.selectedIndex].text;
    Meteor.call("changeFreqency", frequency, result, function (error, result) {
      if (error) {
        toastr.error("error", error);
      }
      if (result) {

      }
    });
  },
  "click #frequencyButton": function (event, template) {
    result = event.currentTarget.dataset.value;
    var frequency = result.split(/,(.+)/)[0];
    var id = result.split(/,(.+)/)[1];
    Meteor.call("changeFreqency", frequency, id, function (error, result) {
      if (error) {
        toastr.error("error", error);
      }
      if (result) {

      }

    });
  },
  "click .closebtn": function (event) {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    $(".property-card").removeClass("toggleContainer");
  },
  "click .openNav": function (event, template) {
    var propertyID = event.currentTarget.dataset.postId;
    var container = document.getElementById("arrow-" + propertyID);

    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";

    container.classList.toggle("toggleContainer");

    $(event.currentTarget.tagName).not(event.currentTarget).removeClass("active");
    $(event.currentTarget.dataset.postId).addClass("active");

    if ($(".property-card.toggleContainer").length > 1) {
      $(event.currentTarget.tagName).not(event.currentTarget).removeClass("toggleContainer");
    } else if ($(".property-card.toggleContainer").length == 0) {
      document.getElementById("mySidenav").style.width = "0";
    }

    //set data target of edit btn
    $("#editPropertyDetails").attr("data-target", ".editProperty-" + propertyID)
    //set data target of add btn
    $("#addAPIProperty").attr("data-target", ".addApi-" + propertyID)
    // set api link
    $("#apiLink").attr("href", "apis/" + propertyID);
    // set run btn value
    $("#btn-property").val(propertyID);

    //set last run, performance values
    var userProperties = Properties.find({
      _id: propertyID
    }).fetch();
    var result = [];
    var final = [];
    for (var i = 0; i < userProperties.length; i++) {
      result.push({
        _id: userProperties[i]._id,
        propertyURL: userProperties[i].propertyURL,
        propertyName: userProperties[i].propertyName,
        isStarred: userProperties[i].isStarred
      })
      //set form values
      $("#propertyName-" + propertyID).val(result[i].propertyName);
      $("#propertyURL-" + propertyID).val(result[i].propertyURL);
      (result[i].isStarred == true) ? $("#propertyStarred-" + propertyID).attr('checked', true): $("#propertyStarred-" + propertyID).attr('checked', false);

      var apiAddress1 = apiAddress.find({
        propertyID: result[i]._id
      }).fetch();
      for (var i = 0; i < apiAddress1.length; i++) {
        try {
          final.push({
            updatedTime: apiAddress1[i].updatedTime
          })
          this.canvas = document.getElementById('statusChart');
          this.ctx = this.canvas.getContext('2d');
          var gradientStroke = this.ctx.createLinearGradient(500, 0, 100, 500);
          var gradientFill = this.ctx.createLinearGradient(500, 0, 100, 0);

          gradientFill.addColorStop(0, "rgba(94, 94, 236, 0.2)");
          gradientFill.addColorStop(1, "rgba(15, 226, 255, 0.2)");
          gradientStroke.addColorStop(0, "#5E5EEC");
          gradientStroke.addColorStop(1, "#0FE2FF");

          var days = [];
          var values = [];
          for (var j = 0; j < apiAddress1[i].statusRecord.length; j++) {
            days.push(apiAddress1[i].statusRecord[j].time);
            values.push(apiAddress1[i].statusRecord[j].responseTime);
          }
          var myChart = new Chart(this.ctx, {
            type: 'line',
            data: {
              labels: ['12:00:00 am', '2:00:00 am', '4:00:00 am', '6:00:00 am', '8:00:00 am', '10:00:00 am', '12:00:00 pm', '2:00:00 pm', '4:00:00 pm', '6:00:00 pm', '8:00:00 pm', '10:00:00 pm'],
              datasets: [{
                label: '',
                data: values,
                lineTension: 0.6,
                borderColor: gradientStroke,
                pointBorderColor: gradientStroke,
                pointBackgroundColor: gradientStroke,
                pointHoverBackgroundColor: gradientStroke,
                pointHoverBorderColor: gradientStroke,
                fill: true,
                backgroundColor: gradientFill,
                borderWidth: 2
              }]
            },
            options: {
              gridLines: {
                display: true

              },
              legend: {
                display: false
              },
              layout: {
                padding: {
                  right: 10
                }
              },
              scales: {
                responsive: true,
                xAxes: [{
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 5,
                    display: false
                  }
                }],
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    display: false
                  }
                }]
              },
            }
          });
        } catch (err) {}
      }
      $(".lastRun").html(final[0].updatedTime);
    }
  },
  "click #edit-property": function (event, template) {
    var propertyID = event.target.value;
    var name = $("#propertyName-" + propertyID).val();
    var url = $("#propertyURL-" + propertyID).val();
    var isStarred = $('#propertyStarred-' + propertyID).is(":checked");
    var b = document.getElementById('updatingFrequency-' + propertyID);
    var frequency = b.options[b.selectedIndex].text;
    Meteor.call("updateProperty", propertyID, name, url, isStarred, function (error, result) {
      if (error) {
        toastr.error(JSON.stringify(error, null, "\t"), 'Error');
      } else {
        Meteor.call("changeFreqencyProperty", frequency, propertyID, function (error, result) {
          if (error) {
            toastr.error("error", error);
          }
        });
        toastr.success("Successfully updated!");
      }
      if (result) {
        toastr.error(JSON.stringify(result, null, "\t"), 'Error');
      }
    });
  },
  "click #btn-property": function (event, template) {
    var propertyID = event.target.value;
    var userProperties = Properties.find({
      _id: propertyID
    }).fetch();
    var res = [];
    for (var i = 0; i < userProperties.length; i++) {
      res.push({
        url: userProperties[i].propertyURL
      })
    }

    Meteor.call("getLastRun", propertyID, function (error, result) {
      if (error) {
        toastr.error(JSON.stringify(error, null, "\t"), '2Error');
      } else {
        Meteor.call("getStatus", propertyID, function (error, result) {
          if (error) {
            toastr.error(JSON.stringify(error, null, "\t"), '3Error');
          } else {
            loadClient(propertyID, res[0].url);

            function loadClient(propertyID, url) {
              gapi.client.setApiKey("AIzaSyDuNP8vCo87mQ4RwWl0RVvN9mFXKSHmF48");
              return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/pagespeedonline/v4/rest")
                .then(function () {
                    var propertyURL = url;
                    var id = propertyID;
                    return gapi.client.pagespeedonline.pagespeedapi.runpagespeed({
                        "url": propertyURL,
                        "filter_third_party_resources": true,
                        "screenshot": true,
                        "snapshots": true,
                        "strategy": "desktop"
                      })
                      .then(function (response) {
                          if (response.result.responseCode == 404) {
                            toastr.error("404 Site Not Found");
                            Meteor.call("getPageSpeed", id, "Site Not Found", function (error, result) {
                              if (error) {
                                toastr.error(JSON.stringify(error, null, "\t"), '4Error');
                              } else {
                                setTimeout(function () {
                                  Meteor.call("getUpDownTime", id, function (error, result) {
                                    if (error) {
                                      toastr.error(JSON.stringify(error, null, "\t"), '5Error');
                                    }
                                    if (result) {
                                      toastr.error(JSON.stringify(result, null, "\t"), '6Error');
                                    }
                                  });
                                }, 30000);
                              }
                              if (result) {
                                toastr.error(JSON.stringify(result, null, "\t"), '7Error');
                              }
                            });
                          } else {
                            Meteor.call("getPageSpeed", id, response.result.ruleGroups.SPEED.score, function (error, result) {
                              if (error) {
                                toastr.error(JSON.stringify(error, null, "\t"), '4Error');
                              } else {
                                setTimeout(function () {
                                  Meteor.call("getUpDownTime", id, function (error, result) {
                                    if (error) {
                                      toastr.error(JSON.stringify(error, null, "\t"), '5Error');
                                    }
                                    if (result) {
                                      toastr.error(JSON.stringify(result, null, "\t"), '6Error');
                                    }
                                  });
                                }, 30000);
                              }
                              if (result) {
                                toastr.error(JSON.stringify(result, null, "\t"), '7Error');
                              }
                            });
                          }
                        },
                        function (err) {
                          toastr.error("Execute error", err);
                        });
                  },
                  function (err) {
                    toastr.error("Error loading GAPI client for API" + err, "Page speed error");
                  });
            }
            gapi.load("client");
          }
          if (result) {
            toastr.error(JSON.stringify(result, null, "\t"), '8Error');
          }
        });
      }
      if (result) {
        toastr.error(JSON.stringify(result, null, "\t"), '9Error');
      }
    });
  },
  'change .filters': function (e) {
    propIndex.getComponentMethods( /* optional name */ )
      .addProps('status', $(e.target).val());
  }
});

Template.mainDashboard.helpers({
  propIndex: () => propIndex,
  inputAttributes: () => {
    return {
      placeholder: 'Search'
    }
  },
  'properties': function () {
    var filteredStatus = Template.instance().selectedCategory.get();
    if (filteredStatus == undefined || filteredStatus == "all") {
      var userProperties = Properties.find({}).fetch();
      var result = [];
      for (var i = 0; i < userProperties.length; i++) {
        if (userProperties[i].updatedTime) {
          result.push({
            _id: userProperties[i]._id,
            createdBy: userProperties[i].createdBy,
            propertyName: userProperties[i].propertyName,
            propertyURL: userProperties[i].propertyURL,
            lastRun: userProperties[i].lastRun,
            status: userProperties[i].status,
            uptime: userProperties[i].uptime,
            downtime: userProperties[i].downtime,
            pageSpeed: userProperties[i].pageSpeed

          })
        } else {
          result.push({
            _id: userProperties[i]._id,
            createdBy: userProperties[i].createdBy,
            propertyName: userProperties[i].propertyName,
            propertyURL: userProperties[i].propertyURL,
            lastRun: userProperties[i].lastRun,
            status: userProperties[i].status,
            uptime: userProperties[i].uptime,
            downtime: userProperties[i].downtime,
            pageSpeed: userProperties[i].pageSpeed
          })
        }
      }
      return result;
    } else {
      var userProperties = Properties.find({
        status: filteredStatus
      }).fetch();
      var result = [];
      for (var i = 0; i < userProperties.length; i++) {
        if (userProperties[i].updatedTime) {
          result.push({
            _id: userProperties[i]._id,
            createdBy: userProperties[i].createdBy,
            propertyName: userProperties[i].propertyName,
            propertyURL: userProperties[i].propertyURL,
            lastRun: userProperties[i].lastRun,
            status: userProperties[i].status,
            uptime: userProperties[i].uptime,
            downtime: userProperties[i].downtime,
            pageSpeed: userProperties[i].pageSpeed

          })
        } else {
          result.push({
            _id: userProperties[i]._id,
            createdBy: userProperties[i].createdBy,
            propertyName: userProperties[i].propertyName,
            propertyURL: userProperties[i].propertyURL,
            lastRun: userProperties[i].lastRun,
            status: userProperties[i].status,
            uptime: userProperties[i].uptime,
            downtime: userProperties[i].downtime,
            pageSpeed: userProperties[i].pageSpeed
          })
        }
      }
      return result;

    }

  },
  apis: function () {
    var apiAddress1 = apiAddress.find({}).fetch();
    var final = [];
    for (var i = 0; i < apiAddress1.length; i++) {
      if (apiAddress1[i].updatedTime) {
        final.push({
          _id: apiAddress1[i]._id,
          createdByName: apiAddress1[i].createdByName,
          apiName: apiAddress1[i].apiName,
          apiAddress: apiAddress1[i].apiAddress,
          getOrPost: apiAddress1[i].getOrPost,
          usageOrStatus: apiAddress1[i].usageOrStatus,
          path: apiAddress1[i].path,
          response: (JSON.stringify(apiAddress1[i].response, null, 4)),
          header: (JSON.stringify(apiAddress1[i].headers, null, 4)),
          status: apiAddress1[i].status,
          frequency: apiAddress1[i].frequency,
          updatedTime: apiAddress1[i].updatedTime,
          responseTime: apiAddress1[i].responseTime,
          statusRecord: apiAddress1[i].statusRecord
        })
      } else {
        final.push({
          _id: apiAddress1[i]._id,
          createdByName: apiAddress1[i].createdByName,
          apiName: apiAddress1[i].apiName,
          apiAddress: apiAddress1[i].apiAddress,
          getOrPost: apiAddress1[i].getOrPost,
          usageOrStatus: apiAddress1[i].usageOrStatus,
          path: apiAddress1[i].path,
          response: (JSON.stringify(apiAddress1[i].response, null, 4)),
          header: (JSON.stringify(apiAddress1[i].headers, null, 4)),
          status: apiAddress1[i].status,
          frequency: apiAddress1[i].frequency,
          responseTime: apiAddress1[i].responseTime,
          statusRecord: apiAddress1[i].statusRecord
        })
      }

    }
    return final;
  },

  loading: function () {
    if (addingApiSearch.find({}).count() > 0) {
      return 1;
    } else {
      return 0;
    }
  },
  errors: function () {
    return apiErrors.findOne({}).errors;
  },
  todaysDate: function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;
    return today;
  }
});
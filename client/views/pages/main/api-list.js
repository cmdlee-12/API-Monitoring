Template.apiList.onCreated(function () {
  upDownTimeAPIChart = this.subscribe('upDownTimeApiChart');
});

/*global drawchart */
drawApichart = function (id, dataupTime, dataDown) {
  var data = {
    datasets: [{
        label: '',
        data: [dataupTime, dataDown],
        backgroundColor: ['#0FE2FF', '#5E5EEC']
      },

    ]
  };
  var apiCtx = document.getElementById("upChartApi-" + id);
  new Chart(apiCtx.getContext('2d'), {
    type: "doughnut",
    data: data,
    options: {
      elements: {
        center: {
          text: [dataupTime + '%'],
          color: '#000',
          fontStyle: 'Proxima Nova Rg',
          sidePadding: 20
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
      }
    }
  });
};

Template.apiList.onRendered(function () {
  Tracker.autorun(function () {
    //uptime Chart
    if (upDownTimeAPIChart.ready()) {
      var updownChartLength = $(".updown-chart-api").length;

      var chart = $(".updown-chart-api");
      for (var i = 0; i < updownChartLength; i++) {
        var apiValues = apiAddress.find({
          _id: chart[i].value
        });
        var dataupTime = [];
        var dataDown = [];
        apiValues.forEach(function (option) {

          dataupTime.push(option.uptime);
          dataDown.push(option.downtime)
        });
        drawApichart(chart[i].value, dataupTime, dataDown);
      }
    }

    //set chart's inner text
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

    //performance
    $(".btn-group > .btn").click(function () {
      $(this).addClass("active").siblings().removeClass("active");
      $(this).addClass("active");
    });
    var apiData = apiAddress.find({}).fetch();
    for (var i = 0; i < apiData.length; i++) {
      try {
        var ctx = document.getElementById("statusChart-" + apiData[i]._id).getContext('2d');
        var days = [];
        var values = [];
        for (var j = 0; j < apiData[i].statusRecord.length; j++) {
          days.push(apiData[i].statusRecord[j].time);
          values.push(apiData[i].statusRecord[j].responseTime);
        }
        var myChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: days,
            datasets: [{
              label: 'Response Time',
              data: values,
              backgroundColor: [
                'rgba(20, 250, 20, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(2, 110, 2,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        });
      } catch (err) {}
    }
  });

  //other functions
  sideBar();

  function sideBar() {
    $('.sidebar-toggle img').click(function () {
      $('.content-side__wrapper').toggle();
    })
  }
});

Template.apiList.events({
  "click #add": function (event, template) {
    var apiName = document.getElementById('formGroupExampleInput').value;
    var apiAddress1 = document.getElementById('formGroupExampleInput2').value;
    if (apiAddress.find({
        apiAddress: apiAddress1
      }).count() > 0) {
      toastr.error("You have used this API url for a different API already", "Duplicate URL");

    } else {
      var e = document.getElementById("getOrPost");
      var getOrPost = e.options[e.selectedIndex].text;
      var a = document.getElementById("usageOrStatus");
      var usageOrStatus = a.options[a.selectedIndex].text;
      var authentication = document.getElementById('authorization').value;
      var b = document.getElementById("addingFrequency");
      var frequency = b.options[b.selectedIndex].text;
      var propertyID = Router.current().params.id;
      var isProperty = "0";
      var userID = Meteor.userId();
      Meteor.call("updateApi", userID, apiName, apiAddress1, getOrPost, usageOrStatus, authentication, frequency, propertyID, isProperty, function (error, result) {
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

          //remove field's value
          $("#formGroupExampleInput").val("");
          $("#formGroupExampleInput2").val("");

          //add uptime
          var apiData = apiAddress.find({
            apiAddress: apiAddress1
          }).fetch();
          var final = [];
          for (var i = 0; i < apiData.length; i++) {

            if (apiData[i].updatedTime) {
              final.push({
                _id: apiData[i]._id
              })
            } else {
              final.push({
                _id: apiData[i]._id
              })
            }
          }
          setTimeout(function () {
            Meteor.call("getUpDownTimeAPI", final[0]._id, function (error, result) {
              if (error) {
                toastr.error(JSON.stringify(error, null, "\t"), '5Error');
              }
              if (result) {
                toastr.error(JSON.stringify(result, null, "\t"), '6Error');
              }
            });
          }, 30000);
        }
      });
    }
  },
  "click #edit-property": function (event, template) {
    var propertyID = event.target.value;
    var name = $("#propertyName-" + propertyID).val();
    var b = document.getElementById('updatingFrequency-' + propertyID);
    var frequency = b.options[b.selectedIndex].text;
    Meteor.call("updatePropertyAPI", propertyID, name, function (error, result) {
      if (error) {
        toastr.error(JSON.stringify(error, null, "\t"), 'Error');
      } else {
        Meteor.call("changeFreqency", frequency, propertyID, function (error, result) {
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
    Meteor.call("getLastRunAPI", propertyID, function (error, result) {
      if (error) {
        toastr.error("Last Run Error", error);
      } else {
        Meteor.call("getUpDownTimeAPI", propertyID, function (error, result) {
          if (error) {
            toastr.error("Uptime/Downtime Error", error);
          }
        });
      }
    });
  },
  "click #removeApi": function (event, template) {
    result = event.currentTarget.dataset.value;
    Meteor.call("removeApi", result, function (error, result) {
      if (error) {
        toastr.error("error", error);
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
      if (result) {}
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

    //add not-active (opacity) to property card that is inactive
    $(".property-card").not(event.currentTarget).addClass("not-active");
    $(event.currentTarget).removeClass("not-active");

    if ($(".property-card.toggleContainer").length > 1) {
      $(event.currentTarget.tagName).not(event.currentTarget).removeClass("toggleContainer");
    } else if ($(".property-card.toggleContainer").length == 0) {
      document.getElementById("mySidenav").style.width = "0";
      $(".property-card").removeClass("not-active");
    }

    //set data target of edit btn
    $("#editPropertyDetails").attr("data-target", ".editProperty-" + propertyID)

    // set run btn value
    $("#btn-property").val(propertyID);

    //set last run, performance values
    var apiAddress1 = apiAddress.find({
      _id: propertyID
    }).fetch();

    var final = [];
    for (var i = 0; i < apiAddress1.length; i++) {

      try {
        final.push({
          updatedTime: apiAddress1[i].updatedTime,
          propertyName: apiAddress1[i].propertyName,
          apiName: apiAddress1[i].apiName
        })
        //set sidenav name
        $("#apiContainerName").html(final[i].apiName);
        
        //set form values
        $("#propertyName-" + propertyID).val(final[i].propertyName);

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
  },
  "change .filters": function (e) {
    apiIndex.getComponentMethods()
      .addProps('status', $(e.target).val());
  }

});

Template.apiList.helpers({
  currentPropertyName: function () {
    var propertyID = Router.current().params.id;
    var properties = Properties.find({
      _id: propertyID
    }).fetch();
    var nameArr = [];
    for (var i = 0; i < properties.length; i++) {
      nameArr.push({
        propertyName: properties[i].propertyName
      })
    }
    return nameArr[0].propertyName;
  },
  currentPropertyID: function () {
    return Router.current().params.id;
  },
  apiIndex: function () {
    return apiIndex;
  },
  inputAttributes: () => {
    return {
      placeholder: 'Search'
    }
  },
  loading: function () {
    if (addingApiSearch.find({}).count() > 0) {
      return 1;
    } else {
      return 0;
    }
  },
  // errors: function () {
  //   return apiErrors.findOne({}).errors;
  // },
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
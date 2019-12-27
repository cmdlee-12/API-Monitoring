Template.report.onCreated(function () {

});

Template.report.onRendered(function () {

});

Template.report.events({
    'click #run-report': function (event, template) {

        var propertyAPIType = document.getElementById('reportType');
        var propertyAPITypeVal = propertyAPIType.options[propertyAPIType.selectedIndex].value;

        var reportType = document.getElementById('report');
        var reportTypeVal = reportType.options[reportType.selectedIndex].value;
        console.log(reportTypeVal)
        if (reportTypeVal == "checkHistory") {
            $(".uptime-show-wrapper").addClass("d-none");
            $(".uptime-show-wrapper").removeClass("d-block");

            if (propertyAPITypeVal == "api") {
                $(".cron-show-wrapper").removeClass("d-none");
                $(".cron-show-wrapper").addClass("d-block");

                var propertyAPI = document.getElementById('propertyApiNames');
                var propertyAPIVal = propertyAPI.options[propertyAPI.selectedIndex].value;
                $("tbody.cron-table-wrapper").html("");
                console.log(propertyAPIVal)
                Meteor.call("getCronHistory", propertyAPIVal, function (error, result) {
                    for (var i = 0; i < result.length; i++) {
                        $("tbody.cron-table-wrapper").append(
                            "<tr>" +
                            "<td>" + result[i].startedAt + "</td>" +
                            "<td>" + result[i].finishedAt + "</td>" +
                            "<td>" + result[i].result + "</td>" +
                            "</tr>"
                        );
                    }
                })
            } else if (propertyAPITypeVal == "property") {
                $(".cron-show-wrapper").removeClass("d-none");
                $(".cron-show-wrapper").addClass("d-block");

                var propertyAPI = document.getElementById('propertyApiNames');
                var propertyAPIVal = propertyAPI.options[propertyAPI.selectedIndex].value;
                $("tbody.cron-table-wrapper").html("");
                console.log(propertyAPIVal)
                Meteor.call("getPropertyCronHistory", propertyAPIVal, function (error, result) {
                    for (var i = 0; i < result.length; i++) {
                        $("tbody.cron-table-wrapper").append(
                            "<tr>" +
                            "<td>" + result[i].startedAt + "</td>" +
                            "<td>" + result[i].finishedAt + "</td>" +
                            "<td>" + result[i].result + "</td>" +
                            "<td>" + result[i].error + "</td>" +
                            "</tr>"
                        );
                    }
                })
            }
        } else if (reportTypeVal == "performance") {
            $(".cron-show-wrapper").addClass("d-none");
            $(".cron-show-wrapper").removeClass("d-block");
            
            $(".uptime-show-wrapper").addClass("d-none");
            $(".uptime-show-wrapper").removeClass("d-block");
        } else if (reportTypeVal == "uptimeHistory") {
            $(".cron-show-wrapper").addClass("d-none");
            $(".cron-show-wrapper").removeClass("d-block");

            if (propertyAPITypeVal == "api") {
                $(".uptime-show-wrapper").removeClass("d-none");
                $(".uptime-show-wrapper").addClass("d-block");

                var propertyAPI = document.getElementById('propertyApiNames');
                var propertyAPIVal = propertyAPI.options[propertyAPI.selectedIndex].value;
                console.log(propertyAPIVal)

                var api = apiAddress.find({
                    _id: propertyAPIVal
                }).fetch();
                var apiArr = [];
                for (var i = 0; i < api.length; i++) {
                    apiArr.push({
                        uptime: api[i].uptime,
                        downtime: api[i].downtime
                    });
                }
                var data = {
                    datasets: [{
                            data: [apiArr[0].uptime, apiArr[0].downtime],
                            backgroundColor: ['#0FE2FF', '#5E5EEC']
                    }],
                    labels: [
                        'Uptime',
                        'Downtime'
                    ]
                };
                var ctx = document.getElementById("uptimeDowntime");
                new Chart(ctx.getContext('2d'), {
                    type: "doughnut",
                    data: data,
                    options: {
                        elements: {
                            center: {
                                text: [apiArr[0].uptime],
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
                            display: true
                        }
                    }
                });
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

            } else if (propertyAPITypeVal == "property") {
                $(".uptime-show-wrapper").removeClass("d-none");
                $(".uptime-show-wrapper").addClass("d-block");

                var propertyAPI = document.getElementById('propertyApiNames');
                var propertyAPIVal = propertyAPI.options[propertyAPI.selectedIndex].value;

                console.log(propertyAPIVal)
                var properties = Properties.find({
                    _id: propertyAPIVal
                }).fetch();
                var propertiesArr = [];
                for (var x = 0; x < properties.length; x++) {
                    propertiesArr.push({
                        uptime: properties[x].uptime,
                        downtime: properties[x].downtime
                    });
                }
                var data = {
                    datasets: [{
                            data: [propertiesArr[0].uptime, propertiesArr[0].downtime],
                            backgroundColor: ['#0FE2FF', '#5E5EEC']
                    }],
                    labels: [
                        'Uptime',
                        'Downtime'
                    ]
                };
                var ctx = document.getElementById("uptimeDowntime");
                new Chart(ctx.getContext('2d'), {
                    type: "doughnut",
                    data: data,
                    options: {
                        elements: {
                            center: {
                                text: [propertiesArr[0].uptime],
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
                            display: true
                        }
                    }
                });
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
            }
        } else if (reportTypeVal == "alertHistory") {

        }
        
    },
    'change #reportType': function (event) {
        var reportVal = event.target.value;

        if (reportVal == "property") {
            var properties = Properties.find({}).fetch();
            var propertiesArr = [];
            $("#propertyApiNames").html("");
            for (var i = 0; i < properties.length; i++) {
                propertiesArr.push({
                    _id: properties[i]._id,
                    propertyName: properties[i].propertyName
                })
                $("#propertyApiNames").append("<option value='" + propertiesArr[i]._id + "'>" + propertiesArr[i].propertyName + "</option>")
            }
        } else {
            var api = apiAddress.find({}).fetch();
            var apiArr = [];
            $("#propertyApiNames").html("");
            for (var i = 0; i < api.length; i++) {
                apiArr.push({
                    _id: api[i]._id,
                    apiName: api[i].apiName,
                    isProperty: api[i].isProperty
                })
                if (apiArr[i].isProperty == "0") {
                    $("#propertyApiNames").append("<option value='" + apiArr[i]._id + "'>" + apiArr[i].apiName + "</option>")
                }
            }
        }
    }
});

Template.report.helpers({

});
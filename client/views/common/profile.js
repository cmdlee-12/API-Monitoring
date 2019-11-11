Template.profile.helpers({
   
});
Template.profile.events({

    'click #sidebarCollapse': function (event, template) {
        $('#sidebar').toggleClass('active');
        console.log("hello");
    },
    'click #save-changes': function (event, template) {
        var companyName = document.getElementById('username').value;
        var companyEmail = document.getElementById('email').value;
        var websiteURL = document.getElementById('url').value;
        var oldPassword = document.getElementById('old-password').value;
        var newPassword = document.getElementById('new-password').value;

        Meteor.call("updateProfile", companyName, companyEmail, websiteURL, newPassword, oldPassword, function (error, result) {
            if (error) {
                console.log("error", error);
            } else {
                Swal.fire(
                    'Good job!',
                    'You have successfully updated your profile!',
                    'success'
                )
            }
            if (result) {
                toastr.error(JSON.stringify(result, null, "\t"), 'Error');
            } else {
                Swal.fire(
                    'Good job!',
                    'You have successfully updated your profile!',
                    'success'
                )
            }
        });
    },
    'click #loadClient': function (event, template) {
        function loadClient() {
            gapi.client.setApiKey("AIzaSyDuNP8vCo87mQ4RwWl0RVvN9mFXKSHmF48");
            return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/pagespeedonline/v4/rest")
                .then(function () {
                        console.log("GAPI client loaded for API");
                        var url = "http://techstack-task-report.firebaseapp.com";
                        return gapi.client.pagespeedonline.pagespeedapi.runpagespeed({
                                "url": url,
                                "filter_third_party_resources": true,
                                "screenshot": true,
                                "snapshots": true,
                                "strategy": "desktop"
                            })
                            .then(function (response) {
                                    // Handle the results here (response.result has the parsed body).
                                    console.log("Response Score", response.result.ruleGroups.SPEED.score);
                                    console.log("Response", response.result.title);
                                    console.log("Response", response);
                                },
                                function (err) {
                                    console.error("Execute error", err);
                                });
                    },
                    function (err) {
                        console.error("Error loading GAPI client for API", err);
                    });
        }
        loadClient();
        gapi.load("client");
    }
});
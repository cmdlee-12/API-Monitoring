Template.profile.onRendered(function () {
    var currentUser = Meteor.userId();
    var userDetails = Meteor.users.find({
        _id: currentUser
    }).fetch();
    var result = [];
    for (var i = 0; i < userDetails.length; i++) {
        result.push({
            _id: userDetails[i]._id,
            email: userDetails[i].emails[0].address,
            phone: userDetails[i].profile.phone,
            country: userDetails[i].profile.country,
            firstName: userDetails[i].profile.firstName,
            lastName: userDetails[i].profile.lastName,
            title: userDetails[i].profile.title
        })
    }
    $("#title").val(result[0].title);
    $("#country").val(result[0].country);
});

Template.profile.events({
    'click #btn-profile-submit': function (event, template) {
        event.preventDefault();
        var user_id = event.target.value;
        var title = document.getElementById("title");
        var user_title = title.options[title.selectedIndex].text;
        var user_fname = $("#firstName").val();
        var user_lname = $("#lastName").val();
        var user_email = $("#email").val();
        var user_number = $("#number").val();
        var countryVal = document.getElementById('country');
        var country = countryVal.options[countryVal.selectedIndex].text;

        Meteor.call("updateProfile", user_id, user_title, user_fname, user_lname, user_email, user_number, country, function (error, result) {
            if (error) {
                toastr.error(JSON.stringify(error, null, "\t"), 'Error');
            } else {
                toastr.success("Profile successfully updated!", "Sucess")
            }
        });
    },
    'click #btn-password-submit': function (event) {
        var user_id = event.target.value;
        var currentPassword = $("#inputCurrentPassword").val();
        var newPassword = $("#inputNewPassword").val();
        var confirmNewPassword = $("#inputConfirmPassword").val();
        console.log(currentPassword + " " + newPassword + " " + confirmNewPassword);
        event.preventDefault();

        if (newPassword === confirmNewPassword) {
            Accounts.changePassword(currentPassword, newPassword, function (error) {
                if (error) {
                    toastr.error(JSON.stringify(error, null, "\t"), 'Error');
                } else {
                    toastr.success("Password successfully updated!", "Sucess")
                }
            });

            $("#inputCurrentPassword").val('');
            $("#inputNewPassword").val('');
            $("#inputConfirmPassword").val('');

        } else {
            toastr.error("New and confirm password didn't match.", "Error");
        }
    }
});

Template.profile.helpers({
    user: function () {
        var currentUser = Meteor.userId();
        var userDetails = Meteor.users.find({
            _id: currentUser
        }).fetch();
        var result = [];
        for (var i = 0; i < userDetails.length; i++) {
            result.push({
                _id: userDetails[i]._id,
                email: userDetails[i].emails[0].address,
                phone: userDetails[i].profile.phone,
                country: userDetails[i].profile.country,
                firstName: userDetails[i].profile.firstName,
                lastName: userDetails[i].profile.lastName,
                title: userDetails[i].profile.title
            })
        }
        return result;
    }
});
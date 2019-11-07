Template.profile.helpers({


});

Template.profile.events({

    'click #sidebarCollapse': function (event, template) {
        $('#sidebar').toggleClass('active');
        console.log("hello");
    },
    // 'click #sidebarCollapse' : function(){
    //     $('#sidebar').toggleClass('active');
    //     console.log("hello");
    // }

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

        

    }
});
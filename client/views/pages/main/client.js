Template.client.helpers({

    getClient: function () {
        var client = Meteor.users.find({}).fetch();
        var info = [];
        for (var x = 0; x < client.length; x++) {

            info.push({
                id: client[x]._id,
                name: client[x].username,
                email: client[x].emails[0].address,
                url: client[x].profile.url,
                role: client[x].profile.role
            });
        }
        return info;
    }
});

Template.client.events({
    "click #addCompany": function (event, template) {
        var companyName = document.getElementById('companyName').value;
        var companyEmail = document.getElementById('companyEmail').value;
        var companyRoleType = document.getElementById('companyRoleType').value;
        var websiteURL = document.getElementById('websiteURL').value;
        var defaultPw = "P@ssw0rd10";

        if (companyName.length > 0 && companyEmail.length > 0 && websiteURL.length > 0 && companyRoleType.length > 0) {
            if (!/^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/.test(companyName) &&
                (!/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g.test(websiteURL))) {
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: 'Invalid email address or url'
                })
            } else {
                Meteor.call("createUser", {
                    username: companyName,
                    password: defaultPw,
                    email: companyEmail,
                    login: false,
                    profile: {
                        role: companyRoleType,
                        url: websiteURL
                    }
                }, function (error, result) {
                    if (error) {
                        console.log("error", error);
                    } else {
                        Swal.fire(
                            'Good job!',
                            'You have successfully added a new client!',
                            'success'
                        )
                        setTimeout(function () {
                            document.location.reload(true)
                        }, 1500);
                    }
                    if (result) {
                        toastr.error(JSON.stringify(result, null, "\t"), 'Error');
                    } else {
                        Swal.fire(
                            'Good job!',
                            'You have successfully added a new client!',
                            'success'
                        )
                        setTimeout(function () {
                            document.location.reload(true)
                        }, 1500);
                    }
                });
            }
        } else {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Fill up the required fields'
            })
        }
    }
})
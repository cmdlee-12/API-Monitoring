 Template.client.onRendered(function () {

    sideBar();

    function sideBar() {
        $('.sidebar-toggle img').click(function () {
            $('.content-side__wrapper').toggle();
        })
    }

    var userDetails = Meteor.users.find({}).fetch();
    var result = [];
    for (var i = 0; i < userDetails.length; i++) {
      result.push({
          _id: userDetails[i]._id,
          title: userDetails[i].profile.title,
          firstName: userDetails[i].profile.firstName,
          lastName: userDetails[i].profile.lastName,
          email: userDetails[i].emails[0].address,
          phone: userDetails[i].profile.phone,
          username: userDetails[i].username,
          country: userDetails[i].profile.country,
          status: userDetails[i].profile.status,
          role: userDetails[i].profile.role
      })

      $("#title-"+userDetails[i]._id).val(userDetails[i].profile.title).change();
      $("#country-"+userDetails[i]._id).val(userDetails[i].profile.country).change();
      $("#status-"+userDetails[i]._id).val(userDetails[i].profile.status).change();
      $("#role-"+userDetails[i]._id).val(userDetails[i].profile.role).change();
    }
});

Template.client.events({
  'click #btn-profile-submit': function (events){
    var id = events.target.value;
    
    var title = document.getElementById('title-' + id);
    var titleValue = title.options[title.selectedIndex].value;
    var country = document.getElementById('country-' + id);
    var countryValue = country.options[country.selectedIndex].value;
    var role = document.getElementById('role-' + id);
    var roleValue = role.options[role.selectedIndex].value;
    var status = document.getElementById('status-' + id);
    var statusValue = status.options[status.selectedIndex].value;

    var firstName = $("#firstName-"+id).val();
    var lastName = $("#lastName-"+id).val();
    var username = $("#username-"+id).val();
    var email = $("#email-"+id).val();
    var number = $("#number-"+id).val();

    Meteor.call("updateClientDetails", id, titleValue, firstName, lastName, username, email, number, countryValue, roleValue, statusValue, function(error){
      if(error){
        toastr.error("Error", error);
      }else{
        toastr.success("User successfully updated!", "Sucess")
      }
    });
  },

  'click #add-user': function () {
    // code goes here
    event.preventDefault();
    var username = $('[name=name]').val();
    var email = $('[name=email]').val();
    var password = $('[name=password]').val();
    var role = "Client";
    var status = "active";
    
    Accounts.createUser({
      username: username,
      email: email,
      password: password,
      profile: {
        role: role,
        status: status
      }
    }, function (error) {
      if (error) {
        Swal.fire({
          type: 'error',
          title: 'Oops...',
          text: error.reason
        })
      }else {
        Swal.fire(
          'Good job!',
          'You have successfully added an account!',
          'success'
        )
      }
    });
  }
});

Template.client.helpers({
    apiIndex: () => apiIndex,
    inputAttributes: () => {
      return {
        placeholder: 'Search'
      }
    },
    'users': function (){
      var userDetails = Meteor.users.find({}).fetch();
      var result = [];
      for (var i = 0; i < userDetails.length; i++) {
        result.push({
            _id: userDetails[i]._id,
            title: userDetails[i].profile.title,
            firstName: userDetails[i].profile.firstName,
            lastName: userDetails[i].profile.lastName,
            email: userDetails[i].emails[0].address,
            phone: userDetails[i].profile.phone,
            username: userDetails[i].username,
            country: userDetails[i].profile.country,
            status: userDetails[i].profile.status,
            role: userDetails[i].profile.role
        })
      }
      return result;
    }
});

Template.login.events({
  'submit form': function (event) {
    event.preventDefault();
    var email = $('[name=email]').val();
    var password = $('[name=password]').val();

    var userDetails = Meteor.users.find({
      "emails.address": email
    }).fetch();
    var result = [];

    for (var i = 0; i < userDetails.length; i++) {
      result.push({
        _id: userDetails[i]._id,
        email: userDetails[i].emails[0].address,
        status: userDetails[i].profile.status,
      })
      console.log(result[i].status)

      
    }
    Meteor.loginWithPassword(email, password, function (error) {
      if (error) {
        Swal.fire({
          type: 'error',
          title: 'Oops...',
          text: error.reason
        })
      }else if (result[0].status == 'inactive'){
        Swal.fire({
          type: 'error',
          title: 'Oops...',
          text: 'Account Disabled'
        })
      } else {
        Router.go("/dashboard");
      }
    });
  }
});
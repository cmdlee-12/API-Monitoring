Template.register.events({
  'submit form': function () {
    // code goes here
    event.preventDefault();
    var username = $('[name=name]').val();
    var email = $('[name=email]').val();
    var password = $('[name=password]').val();
    var role = "Client";
    
    Accounts.createUser({
      username: username,
      email: email,
      password: password,
      profile: {
        role: role
        // captcha: captchaData
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
          'You have successfully registered your account!',
          'success'
        )
        setTimeout(function () {
          Router.go("/dashboard"); // Redirect user if registration succeeds
        }, 1500);
      }
    });
  }
});


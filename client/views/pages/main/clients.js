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

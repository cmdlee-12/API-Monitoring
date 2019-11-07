Meteor.publish("apiaddress", function () {

  if (Meteor.user().profile.role == 'Administrator') {

    return apiAddress.find({

    });

  } else {

    return apiAddress.find({
      createdBy: this.userId
    });
  }
});

Meteor.publish("addingapisearch", function () {

  return addingApiSearch.find({
    createdBy: this.userId
  });
});

Meteor.publish("apierrors", function () {

  return apiErrors.find({
    createdBy: this.userId
  });
});

Meteor.publish("clients", function () {

  return Clients.find({
    createdBy: this.userId
  });
});

Meteor.publish("users", function () {

  return Meteor.users.find({}, {
    fields: {
      username: 1,
      emails: 1,
      'profile.role': 1,
      'profile.url': 1
    }
  });
});

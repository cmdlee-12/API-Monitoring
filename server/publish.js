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
  
  return Meteor.users.find({});
  
});

Meteor.publish("properties", function () {

  if (Meteor.user().profile.role == 'Administrator') {

    return Properties.find({

    });

  } else {

    return Properties.find({
      createdBy: this.userId
    });
  }
});

Meteor.publish("upDownTimeChart", function () {
  return Properties.find({});
});

Meteor.publish("upDownTimeApiChart", function () {
  return apiAddress.find({});
});
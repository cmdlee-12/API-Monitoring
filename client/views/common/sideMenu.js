Template.sidemenu.helpers({
    'properties': function () {
        var userProperties = Properties.find({}).fetch();
        var result = [];
        for (var i = 0; i < userProperties.length; i++) {
            if (userProperties[i].updatedTime) {
                result.push({
                    _id: userProperties[i]._id,
                    propertyName: userProperties[i].propertyName

                })
            } else {
                result.push({
                    _id: userProperties[i]._id,
                    propertyName: userProperties[i].propertyName,
                })
            }
        }
        return result;
    }
});
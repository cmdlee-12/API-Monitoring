Template.report.onCreated(function () {
    
});

Template.report.onRendered(function () {
    selectPropertyName();

    function selectPropertyName (){
        var properties = Properties.find({}).fetch();
        var propertiesArr = [];

        for (var i = 0; i < properties.length; i++){
            propertiesArr.push({
                _id : properties[i]._id,
                propertyName: properties[i].propertyName
            })
            $("#propertyNames").append("<option value='"+propertiesArr[i]._id+"'>"+propertiesArr[i].propertyName+"</option>")
        }
    }
});

Template.report.events({
    'click #run-report': function (event, template) {
        console.log("run")
    }
});

Template.report.helpers({

});


// Used only on OffCanvas layout
Template.navigation.events({

    'click #sidebarCollapse' : function(event, template){
        $('#sidebar').toggleClass('active');
        console.log("hello");
    }
    // 'click #sidebarCollapse' : function(){
    //     $('#sidebar').toggleClass('active');
    //     console.log("hello");
    // }
});

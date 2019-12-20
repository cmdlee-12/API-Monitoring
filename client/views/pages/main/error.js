Template.error.onRendered(function () {

    sideBar();

    function sideBar() {
        $('.sidebar-toggle img').click(function () {
            $('.content-side__wrapper').toggle();
        })
    }
});

Template.error.events({

});

Template.error.helpers({

    'getResponse': function () {

        var res = document.getElementsByClassName('occur');
        var resLength = $('.occur').length;
        var counter = 0;
        for (var i = 0; i < resLength; i++) {
            var apiAddressl = apiAddress.find({
                _id: res[i].id
            }).fetch();
            counter += apiAddressl.length;
        }

        for (var a = 0; a < counter; a++) {
            for (var b = 0; b < apiAddressl[a].statusRecord.length; b++) {
                if (apiAddressl[a].statusRecord[b].responseTime == 0) {
                    return apiAddressl[a].statusRecord[b].responseTime;

                }
            }
        }
    },

    'returnTime': function () {
        var resLength = $(".occur").length;
        var res = $(".occur");
        console.log(resLength)

        var occurLength = $("table tbody .sample").length;
        console.log(occurLength);
        for (var i = 0; i < resLength; i++) {
            console.log(resLength)
            var apiAddressl = apiAddress.find({
                _id: res[i].id
            }).fetch();
            console.log(res[i].id);
            console.log(apiAddressl[i].statusRecord.length)
            for (var b = 0; b < apiAddressl[i].statusRecord.length; b++) {
                    if (apiAddressl[i].statusRecord[b].responseTime == 0) {
                        console.log(apiAddressl[i].statusRecord[b].time)
                        return apiAddressl[i].statusRecord[b].time;
                    }
            }
        }
    },
    // 'getResponse2': function () {

    //     var apiAddress1 = apiAddress.find({}).fetch();

    //     for (var a = 0; a < apiAddress1.length; a++) {
    //         for (var b = apiAddress1[a].statusRecord.length - 1; b >= 0; b--) {
    //             if (apiAddress1[a].statusRecord[b].responseTime != 0) {
    //                 return apiAddress1[a].statusRecord[b].responseTime;
    //             }
    //         }
    //     }

    // },


    // 'returnTime': function () {
    //     var res = document.getElementsByClassName('occur'); 
    //     var resLength = $('.occur').length;
    //     var counter = 0;
    //     for( var i = 0; i < resLength ; i++){
    //         var apiAddressl = apiAddress.find({_id : res[i].id}).fetch();
    //         counter += apiAddressl.length;



    //     }   
    //     console.log(counter);
    //     console.log(apiAddressl);

    //     for (var a = 0; a < apiAddressl.length; a++) {
    //         for (var b = 0; b < apiAddressl[a].statusRecord.length; b++) {
    //             if (apiAddressl[a].statusRecord[b].responseTime == 0) {
    //                 return apiAddressl[a].statusRecord[b].time;
    //             }
    //         }
    //     }



    // },

    // 'returnTime2': function () {
    //     var apiAddress1 = apiAddress.find({}).fetch();

    //     for (var a = 0; a < apiAddress1.length; a++) {
    //         for (var b = apiAddress1[a].statusRecord.length - 1; b >= 0; b--) {
    //             if (apiAddress1[a].statusRecord[b].responseTime == 0) {
    //                 return apiAddress1[a].statusRecord[b].time;
    //             }
    //         }
    //     }
    // },

    // 'getTimeDiff': function () {
    //     var apiAddress1 = apiAddress.find({}).fetch();
    //     var down;
    //     var up;

    //     for (var a = 0; a < apiAddress1.length; a++) {
    //         for (var b = 0; b < apiAddress1[a].statusRecord.length; b++) {
    //             if (apiAddress1[a].statusRecord[b].responseTime == 0) {
    //                 down = apiAddress1[a].statusRecord[b].time
    //             }
    //         }
    //     }

    //     for (var a = 0; a < apiAddress1.length; a++) {
    //         for (var b = apiAddress1[a].statusRecord.length - 1; b >= 0; b--) {
    //             if (apiAddress1[a].statusRecord[b].responseTime == 0) {
    //                 up = apiAddress1[a].statusRecord[b].time;
    //             }
    //         }
    //     }
    //     var diff = up - down;
    //     return diff;
    // },

    apiIndex: () => apiIndex,

    inputAttributes: () => {
        return {
            placeholder: 'Search'
        }
    }
});
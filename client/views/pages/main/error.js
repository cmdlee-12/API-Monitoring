Template.error.onRendered(function () {
    sideBar();

    function sideBar() {
        $('.sidebar-toggle img').click(function () {
            $('.content-side__wrapper').toggle();
        })
    }

});

Template.error.events({
    'change .filters': function (e) {
        apiIndex.getComponentMethods( /* optional name */ )
            .addProps('status', $(e.target).val());
    }
});

Template.error.helpers({
    apiIndex: () => apiIndex,

    inputAttributes: () => {
        return {
            placeholder: 'Search'
        }
    }
});
Template.client.onRendered(function () {

    sideBar();

    function sideBar() {
        $('.sidebar-toggle img').click(function () {
            $('.content-side__wrapper').toggle();
        })
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
    }
});

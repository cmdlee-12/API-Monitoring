var PostSubs = new SubsManager({

  // maximum number of cache subscriptions
    cacheLimit: 20,
    // any subscription will be expire after 5 minute, if it's not subscribed again
    expireIn: 5
});

Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'notFoundLoading'
});

Router.route('/dashboard', {
  name: 'mainDashboard',
  waitOn: function () {
    // return one handle, a function, or an array
    return [PostSubs.subscribe('apiaddress'), PostSubs.subscribe("addingapisearch"), PostSubs.subscribe("apierrors"),PostSubs.subscribe('clients'),PostSubs.subscribe('properties')];
  },

  action: function () {
    var state = this.ready();
    if(!Meteor.userId()){
      this.render('login');
      this.layout('blankLayout')
    }
    else{
      if(state) {
        this.render('mainDashboard');
      }
    }
  },
  fastRender: true
});

Router.route('/clients', {
  name: 'clients',
  waitOn: function () {
    // return one handle, a function, or an array
    return [PostSubs.subscribe('apiaddress'), PostSubs.subscribe("addingapisearch"), PostSubs.subscribe("apierrors"),PostSubs.subscribe('clients')];
  },

  action: function () {
    var state = this.ready();
    if(!Meteor.userId()){
      this.render('login');
      this.layout('blankLayout')
    }
    else{
      if(state) {
        this.render('client');
      }
    }
  },
  fastRender: true
});

Router.route('/api', {
  name: 'api',
  waitOn: function () {
    // return one handle, a function, or an array
    return [PostSubs.subscribe('apiaddress'), PostSubs.subscribe("addingapisearch"), PostSubs.subscribe("apierrors"),PostSubs.subscribe('users')];
  },

  action: function () {
    var state = this.ready();
    if(!Meteor.userId()){
      this.render('login');
      this.layout('blankLayout')
    }
    else{
      if(state) {
        this.render('api');
      }
    } 
  },
  fastRender: true
});

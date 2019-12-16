var PostSubs = new SubsManager({
    // maximum number of cache subscriptions
    cacheLimit: 20,
    // any subscription will be expire after 5 minute, if it's not subscribed again
    expireIn: 5
});
Meteor.subscribe("users");

Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'

});

Router.route('/', function () {
    if (!Meteor.userId()) {
        this.render('login');
        this.layout('blankLayout');
    } else {
        Router.go('/dashboard');
    }

});

Router.route('/login', function () {
    this.render('login');
    this.layout('blankLayout');

});

Router.route('/signout', function () {
    this.render('loggedOut');
    this.layout('blankLayout');

});

Router.route('/register', function () {
    this.render('register');
    this.layout('blankLayout');
});

Router.route('/notFound', function () {
    this.render('notFound');
    this.layout('blankLayout');
});

Router.route('/Clients', function () {
    this.render('client');
    this.layout('mainLayout');
});

Router.route('/Api', function () {
    this.render('api');

});

Router.route('/Starred', function () {
    this.render('starred');
    this.layout('mainLayout');
});

Router.route('/Profile', function () {
    this.render('profile');
    this.layout('mainLayout');
});

Router.route('/Error', function () {
    this.render('error');
    this.layout('mainLayout');
});

Router.route('/Properties', function () {
    this.render('properties');
    this.layout('mainLayout');
});
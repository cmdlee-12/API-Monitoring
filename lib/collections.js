apiAddress = new Mongo.Collection("apiaddress");

addingApiSearch = new Mongo.Collection("addingapisearch");

FutureTasks = new Mongo.Collection('future_tasks');

individualGraphsTasks = new Mongo.Collection("individualgraphstasks");

overallGraphsTasks = new Mongo.Collection("overallgraphstasks");

apiErrors = new Mongo.Collection("apierrors");

Clients = new Mongo.Collection("clients");

Properties = new Mongo.Collection("properties");


// Search and filter configuration
propIndex = new EasySearch.Index({
    collection: Properties,
    fields: ['createdBy', 'propertyName', 'propertyURL', 'lastRun', 'status', 'uptime', 'downtime', 'pageSpeed', 'isStarred'],
    defaultSearchOptions: {
        sortBy: 'status',
    },
    engine: new EasySearch.MongoDB({
        selector: function (searchObject, options, aggregation) {
            const selector = this.defaultConfiguration().selector(searchObject, options, aggregation)
            // filter for the brand if set
            if (options.search.props.status == "Up") {
                selector.status = "Up";
            } else if (options.search.props.status == "Down") {
                selector.status = "Down";
            } else if (options.search.props.status == "all") {
                selector.status;
            }

            return selector
        }
    }),
    permission: () => {
        return true
    }
});

apiIndex = new EasySearch.Index({
    collection: apiAddress,
    fields: ['createdBy', 'apiName', 'apiAddress', 'status', 'propertyID','isProperty'],
    // engine: new EasySearch.MongoDB
    engine: new EasySearch.MongoDB({
        selector: function (searchObject, options, aggregation) {
            const selector = this.defaultConfiguration().selector(searchObject, options, aggregation)
            // filter for the brand if set
            if (options.search.props.status == "pass") {
                selector.status = "pass";
            } else if (options.search.props.status == "FAIL") {
                selector.status = "FAIL";
            } else if (options.search.props.status == "all") {
                selector.status;
            }

            return selector
        }
    })
});

//
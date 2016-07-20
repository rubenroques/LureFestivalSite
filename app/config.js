// Sets the MongoDB Database options

module.exports = {

    mongolab:
    {
        name: "database-lurefestival-prod",
        url: "mongodb://heroku_8ve9bfeu8839898hef:YxDk58P8L7Fc3wB7xQLz5ZYCV@ds023485.mlab.com:23485/heroku_vp9fwfwc",
        port: 27017
    },

    local:
    {
        name: "database-lurefestival-pre",
        url: "mongodb://localhost/LureFestivalApp",
        port: 27017
    },

    localtest:
    {
        name: "database-lurefestival-dev",
        url: "mongodb://localhost/LureFestivalApp",
        port: 27017
    }

};

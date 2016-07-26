// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a User Schema. This will be the basis of how user data is stored in the db
var FestivalSchema = new Schema({
    name: {type: String, required: true},
    location: {type: [Number], required: true}, // [Long, Lat]

	startDate: {type: Date, required: true},
	endDate:  {type: Date, required: true},

    editionKey: {type:String, required:true},

    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
FestivalSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

FestivalSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.created_at;
    delete obj.updated_at;
    delete obj._id;
    delete obj.editionKey;
    delete obj.__v;
    return obj;
};

// Indexes this schema in geoJSON format (critical for running proximity searches)
FestivalSchema.index({location: '2dsphere'});

// Exports the FestivalSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('festivals', FestivalSchema);

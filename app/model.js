// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Creates a User Schema. This will be the basis of how user data is stored in the db
var FestivalSchema = new Schema({
    festivalName: {type: String, required: true},       
    location: {type: [Number], required: true}, // [Long, Lat]
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
	startDate: {type: Date, required: true},
	endDate:  {type: Date, required: true}
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

// Indexes this schema in geoJSON format (critical for running proximity searches)
FestivalSchema.index({location: '2dsphere'});

// Exports the FestivalSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('festivals', FestivalSchema);

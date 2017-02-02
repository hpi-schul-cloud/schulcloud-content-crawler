import mongoose from 'mongoose';

export default callback => {
	if (process.env.NODE_ENV == "production") {
		// connect to a database if needed, then pass it to `callback`:
		mongoose.connect("mongodb://mongodb:27017/schulCloudContent", {user:process.env.DB_USERNAME, pass:process.env.DB_PASSWORD}, callback);
		mongoose.Promise = global.Promise;
	} else {
		// connect to a database if needed, then pass it to `callback`:
		mongoose.connect("mongodb://localhost:27017/schulCloudContent", {user:process.env.DB_USERNAME, pass:process.env.DB_PASSWORD}, callback);
		mongoose.Promise = global.Promise;
	}
}

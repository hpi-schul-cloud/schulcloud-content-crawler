module.exports = {
	name: "serlo",
	getAll: function (callback) {
		setTimeout(() => {
			console.log("geilo");
			callback(null, true);
		}, 500);
	}
}
module.exports = {
	name: "serlo2",
	getAll: function (callback) {
		var data = [{name: "deutschEins", contentUrl: "http://deutsch.de/cool"}, {name: "deutschZwei", contentUrl: "http://deutsch.de/wow"}];
		return new Promise((resolve) => setTimeout(() => resolve(data),1000));
	}
}
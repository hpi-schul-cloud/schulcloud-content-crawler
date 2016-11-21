module.exports = {
	name: "serlo",
	getAll: function () {
		var data = [{name: "mathe1", contentUrl: "http://mathe.de/cool"}, {name: "mathe2", contentUrl: "http://mathe.de/wow"}];
		return new Promise((resolve) => setTimeout(() => resolve(data), 1000));
	}
}
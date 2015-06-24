var http = require('http'),
	_ = require('underscore');

http.get('http://data.iana.org/TLD/tlds-alpha-by-domain.txt', function (response) {
	var body = '';

	response.on('data', function(chunk) {
		body += chunk;
	});

	response.on('end', function() {
		if (response.statusCode !== 200) {
			console.log('Invalid status code: '+response.statusCode);
			return;
		}

		var list = body.split("\n");

		var extensions_object = {};

		_.each(list, function(extension) {
			// Trim any extra whitespace either side of it
			extension = extension.trim();

			var length = extension.length;

			// Just in case we have empty lines
			if (length === 0) {
				return;
			}

			// Document allows comments (first line) which start with #
			if (extension.substr(0, 1) === '#') {
				return;
			}

			// Ignore the XN-- ones for now, not sure what unicode characters they are?
			if (length > 4 && extension.substr(0, 4) === 'XN--') {
				return;
			}

			extensions_object[extension.toLowerCase()] = true;
		});

		console.log("\nCopy the following object into the markdown.js file, replacing the existing definition:\n\n");
		console.log('Markdown.extensions_object = ' + JSON.stringify(extensions_object) + ';');
		console.log("\n\nCopy the object above into the markdown.js file, replacing the existing definition");
	});

});

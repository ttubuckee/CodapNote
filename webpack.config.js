const path = require('path');

module.exports = {
	entry: './src/js/content_scripts.js',
	output : {
		path:path.resolve(__dirname,'dist/'),
		filename: 'bundle.js'
	},
	mode: "none"
}

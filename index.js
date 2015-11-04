var fs = require('fs');
var path = require('path');

//Find a jxp file in the current folder (or create something new), list all the .js- and .json-files in the node_modules directory and set the files-property in the jxp file.

(function main() {
	
	var jxp = null;
	var jxpFileName = null;
	
	var packageJson = null;	//Needed to get up to date info on - amongs others - version.
	
	var files = fs.readdirSync('./');
	for(var index in files) {
		var file = files[index];
		if(path.extname(file) === ".jxp") {
			jxpFileName = file;
			jxp = JSON.parse(fs.readFileSync(file, 'utf8'));
		}
		else if(file === 'package.json') {
			packageJson = JSON.parse(fs.readFileSync(file, 'utf8'))
		}
	}
	
	if(jxp === null) {
		console.log('Creating jxp object');

		jxp = { name: '', version: '', author: '', description: '', company: '', copyright: '',
			website: '', package: null, startup: '', execute: null, extract: false, output: '',
			files: [], assets: [], preInstall: null, library: true, fs_reach_sources: true, native: true };
	}
	
	if(packageJson !== null) {
		jxp.name = packageJson.name || 'app';
		jxpFileName = jxp.name + '.jxp';
		jxp.output = jxp.name + '.jx';
		jxp.version = packageJson.version || 'build ' + new Date().toISOString();
		jxp.author = packageJson.author || '';
		jxp.description = packageJson.description || '';
		jxp.startup = packageJson.main;
		jxp.copyright = packageJson.license || '';
	}
	
	var jsAndJsonFiles = getAllRelevantNodeModulesFiles();
	jxp.files = jsAndJsonFiles;
	
	var writeStream = fs.createWriteStream(jxpFileName);
	writeStream.write(JSON.stringify(jxp, null, 2));	//2 whitespace characters, results in nicely formatted and readable json
	
	console.log('Wrote a jxp file with references to ' + jsAndJsonFiles.length + ' js and json files.')
	
	function getAllRelevantNodeModulesFiles() {
		
		var relevantFiles = [];
		var ignoreDirectories = parseCommandLineArguments().slim || [];
		recursivelyCheckDirectoryForFilesWithExtensions('./', ignoreDirectories, ['.js', '.json']);
		
		function recursivelyCheckDirectoryForFilesWithExtensions(dirPath, ignoreDirectories, filterExtensions) {
			if (!fs.existsSync(dirPath)) {
				return;
			}
			var filesAndFolders = fs.readdirSync(dirPath);
			for(var i = 0; i < filesAndFolders.length; i++) {
				var fileOrFolder = path.join(dirPath, filesAndFolders[i]);
				var stat = fs.lstatSync(fileOrFolder);
				if (stat.isDirectory()) {
					if(ignoreDirectories.indexOf(fileOrFolder) === -1) {
						recursivelyCheckDirectoryForFilesWithExtensions(fileOrFolder, ignoreDirectories, filterExtensions); //recursive call happens here
					}
				}
				else {
					var fileExt = path.extname(fileOrFolder);
					if(filterExtensions.indexOf(fileExt) !== -1) {
						relevantFiles.push(fileOrFolder);
					}
				};
			};
		};
		
		return relevantFiles;
	}
	
	function parseCommandLineArguments() {
		var arguments = { slim: [] };
		
		for (var i = 0, len = process.argv.length; i < len; ++i) {
			var arg = process.argv[i];

			if(arg === '-ignore') {	//Check for one or more directories that don't need to be added, quite similar to the jx package -slim argument.
				while(i+1 < len ) {
					var argValue = process.argv[i+1];
					if(argValue.charAt(0) === '-') {
						break;
					}
					arguments.slim.push(argValue);
					++i;
				}
			}
		}
		
		return arguments;
	}

})();

	

var fs = require('fs');
var path = require('path');

//Find a jxp file in the current folder (or create something new), list all the .js- and .json-files in the node_modules directory and set the files-property in the jxp file.

(function main() {
	
	var arguments = parseCommandLineArguments();
	
	var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));	//Needed to get up to date info on - amongs others - version.
	
	var jxp = null;
	var jxpFileName = (arguments.name || packageJson.name) + '.jxp';
	if(fs.existsSync(jxpFileName)) {
		jxp = JSON.parse(fs.readFileSync(jxpFileName, 'utf8'));
	}
	
	//Make sure no other jxp files (and corresponding exe files exist, to minimize confusion about what has recently been compiled)
	var files = fs.readdirSync('./');
	for(var index in files) {
		var file = files[index];
		if(path.extname(file) === ".jxp" && file !== jxpFileName) {
			fs.unlinkSync(file);
			var correspondingExeFile = path.basename(file, '.jxp') + '.exe';
			if(fs.existsSync(correspondingExeFile)) {
				fs.unlinkSync(correspondingExeFile);	
			}
		}
	}
	
	if(jxp === null) {
		console.log('Creating jxp object');

		jxp = { name: '', version: '', author: '', description: '', company: '', copyright: '',
			website: '', package: null, startup: '', execute: null, extract: false, output: '',
			files: [], assets: [], preInstall: null, library: true, fs_reach_sources: true, native: true };
	}
	
	if(packageJson !== null) {
		jxp.name = arguments.name || packageJson.name || 'app';
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
		var ignoreDirectories = arguments.slim || [];
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
		var arguments = { slim: [], name: null };
		
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
			else if(arg === '-name') {
				if(++i >= len) {
					break;
				}
				arguments.name = process.argv[i];
			}
		}
		
		return arguments;
	}

})();

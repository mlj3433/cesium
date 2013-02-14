/*global self,importClass,project,attributes,elements,java,Packages*/
/*jshint strict:false, loopfunc:true, evil:true*/

importClass(java.io.File); /*global File*/
importClass(java.io.FileReader); /*global FileReader*/
importClass(Packages.org.apache.tools.ant.util.FileUtils); /*global FileUtils*/

importClass(Packages.org.mozilla.javascript.tools.shell.Main); /*global Main*/
var args = ["-e", "var a='STRING';"];
Main.exec(args);

var jsHintPath = attributes.get('jshintpath');
var load = Main.global.load;
load(jsHintPath); /*global JSHINT*/

var jsHintOptions = eval('({' + attributes.get('jshintoptions') + '})');
var errors = [];

var sourceFilesets = elements.get('sourcefiles');
for ( var i = 0, len = sourceFilesets.size(); i < len; ++i) {
    var sourceFileset = sourceFilesets.get(i);
    var basedir = sourceFileset.getDir(project);
    var sourceFilenames = sourceFileset.getDirectoryScanner(project).getIncludedFiles();

    for ( var j = 0, sourceFilenamesLen = sourceFilenames.length; j < sourceFilenamesLen; j++) {
        var sourceFilename = sourceFilenames[j];

        if (j > 0 && j % 50 === 0) {
            self.log('Checked ' + j + ' of ' + sourceFilenamesLen + ' files');
        }

        var sourceFile = new File(basedir, sourceFilename);
        var reader = new FileReader(sourceFile);
        var contents = String(FileUtils.readFully(reader));
        reader.close();

        if (!JSHINT(contents, jsHintOptions)) {
            JSHINT.errors.forEach(function(error) {
                if (error) {
                    errors.push(sourceFilename + ': line ' + error.line + ', col ' + error.character + ', ' + error.reason);
                }
            });
        }
    }
}

if (errors.length > 0) {
    self.log('Errors:\n' + errors.join('\n'));
    project.setProperty(attributes.get("failureproperty"), "true");
} else {
    self.log('No errors!');
}
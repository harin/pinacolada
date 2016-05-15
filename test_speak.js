var salient = require('salient');
var cp = require('concepts-parser');
var glossary = new salient.glossary.Glossary();

var test = "I hate Thai food but not Japanese";
glossary.parse(test);

//console.log(glossary.root);

console.log(glossary.root.next);

//console.log(glossary.root);
//console.log(glossary.concepts());
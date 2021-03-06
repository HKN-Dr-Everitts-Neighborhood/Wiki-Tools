#! node.exe

var data = require('./data.js');
var common = require('./common.js');

var fs = require('fs');

// Subfields is an object that will map the name of a subfield to the list of classes in that subfield.
var subfields = {};
var tech_elec_types = {
  "ECE tech elective": 1,
  "ECE tech elective / lab": 1,
  "CS tech elective": 1,
  "3of5": 1,
  "3of5 / lab": 1  
};

// go through all the data, fill in subfields object
for (var i=0; i<data.json.length; i++)
{
  var course = data.json[i];
  if (course.type in tech_elec_types || course.eetype in tech_elec_types || course.cetype in tech_elec_types)
  {
    if (course.subfield)
    {
      // if the subfield hasn't been seen before, need to create a list for it.
      if (!(course.subfield in subfields))
        subfields[course.subfield] = [];
      
      // add the object representing the class to the list of classes in that subfield
      subfields[course.subfield].push(course);
    }
    else
      console.log(course.name + " is missing a subfield");
  }
}

// Now build the tech electives by subfields wiki text from the subfields object.
var output = "";

// sort the subfields
var fields = [];
for (subfield in subfields) {
  fields.push(subfield);
}
fields.sort();

//now, generate the index
function to_anchor(subfield){return subfield.replace(/[ :,/]/g, '_').replace(/&/g, 'and');}

output += "h3. Subfields:\n";
for (var i = 0; i < fields.length; i++)
{
  var subfield = fields[i];
  output += "* [" + subfield + "|#" + to_anchor(subfield) + "]\n";
}
output += "\n";

// print out the subfields / graphs / bullets
for (var j = 0; j < fields.length; j++)
{
  var subfield = fields[j];
  output += "{anchor:" + to_anchor(subfield) + "}\n";
  output += "h3. " + subfield + "\n\n";
  subfields[subfield].sort(function(course1, course2){return course1.name > course2.name;});
  for (var i = 0; i < subfields[subfield].length; i++)
  {
    var course = subfields[subfield][i];
	  
    output += "* [" + course.name + " - " + course.title + "|" + course.internallink + "]";
    
    output += common.same_as(course) + "\n";
  }
  output += "\n"

  // ideally we'd include the svg directly in the html, but since the
  // cites wiki doesn't support the {html} macro we can't do this anymore.
  // so instead include it as a data uri - keeps us from having to upload
  // 1 image per subfield.
  // TODO (david): ideally this would not base64 encode svg, as that actually
  // increases pagesize ~33% and doesn't compress as well as raw svg.
  output += "{img:src=data&colon;image&sol;svg+xml;base64&comma;"
  var graph = fs.readFileSync(
    "temp/" + common.subfield_to_file_name(subfield) + ".svg"
  );
  output += new Buffer(graph).toString('base64');
  output += "}"
  output += "\n\n\n";
}

fs.writeFileSync("output/tech_electives_by_subfields.txt", output);


# builds data.json from raw_data.json and links.json
../data/prepare.py

# creates data.js from data.json
. ./makedatajs.sh > ./data.js

# makes the files temp/*.dot and from those, temp/*.svg and output/*.svg
# all from data.json
node ./make_dot.js

python post_process_svg.py

# makes output/tech_electives_by_subfields.txt from temp/*.svg files and data.json
node ./techelectives_by_subfield.js

# makes graph.html, so you can preview the interactivity on the latest data.
bash make_html.sh

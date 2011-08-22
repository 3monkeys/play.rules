<!--![Alt "3MonkeysPlayRules"](/3monkeys/play.rules/blob/master/rsrc/Play_rules.png?raw=true)-->
![Alt "3MonkeysPlayRules"](https://github.com/3monkeys/play.rules/raw/master/rsrc/Play_rules.png)


## Pdf output

You may find a very special `generate.pdf.coffee` which is a basic wrapper around [devongovett/pdfkit](https://github.com/devongovett/pdfkit) library.

Is is designed to take a folder, full of markdown file, and generate a pdf output accordingly. There is no concept of files sorting yet (still, file returned by [findit](https://github.com/substack/node-findit) seems to be what we want in our case), we may need a better way to ensure files are processed in the right order (like a yaml file).

### Installation

It will require node, npm and coffeescript installed to work.

For node:

    git clone git://github.com/joyent/node.git
    cd node
    git checkout v0.4.11
    ./configure
    make
    make install
    
*Note: you may want to checkout whichever version you prefered, stay on master, or checkout the latest stable version (https://github.com/joyent/node/wiki/ChangeLog)*

For npm:

    curl http://npmjs.org/install.sh | sh
    
For CoffeeScript:

    npm install -g coffee-script
    

This is not properly packaged yet, there is no package.json, so you'll need to manually installed required dependencies:

    npm install pdfkit findit
    
### Usage

    coffee generate.pdf.coffee
    
You'll get the generated pdf as `output.pdf`

You may configure a few things for now, open up the `generate.pdf.coffee` file and start to tweak things in config object at the top of the file.

##### Note

This is a work in progress, but this is quite stable and usable as is. You can try to generate locally.
# Schematar

Creates mongoose schemas, typescript interfaces and json schemas from a single schema. 

TODO: implement documentation

For now, you'll have to look at the tests.

A command line tool is installed for setting up typescript interface files, for use in build scripts etc.

    npx schematar create-typescript-interfaces ./output-directory src/**/*-schema.js
    
Or your schema files are in typescript it gets more complicated

        npx ts-node node_modules/.bin/schematar create-typescript-interfaces ./output-directory src/**/*-schema.js
    
Globs are supported for the schema parameter, helping with environments where the shell does not expand them.

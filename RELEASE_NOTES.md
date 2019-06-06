# 1.4.0

- Arrays in mongoose support things like refs, indices and such
- Complex types that come from different versions of schematar can be used interchangeable (the foreign version needs to be 1.4.0+ though)

# 1.3.2

- Make mkdirp a regular dependency instead of a dev dependency

# 1.3.1

- Generated typescript interface files have tslint and eslint completely disabled

# 1.3.0

- Complex can now be subclassed and the subclasses can modify the output
- Explicit exports for typescriptSchemas can have a complex as the schema
- hashSchema can be called on complexes

# 1.2.0

- Some dependency updates
- Mongoose nested objects are not wrapped with a {type: ...} as it did not seem to have the intended effect

# 1.1.0

- ObjectId is now a const string instead a symbol to make is work better in situations with multiple schematar installations
- TypescriptSchemaDefinition is now exported to help set up proper types in schema files

# 1.0.2

- Updated dependencies

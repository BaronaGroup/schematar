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

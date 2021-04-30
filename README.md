# Schematar

Creates mongoose schemas, typescript interfaces and json schemas from a single javascript schema.

## Overview

The recommended way to use schematar is by creating a schema file in and having it export the mongoose and json-schema
schemas, and have a build process to generate typescript interface files. If you prefer, you can of course also generate
files for mongoose and json-schema as well.

Note: throughout this documentation the language being referred to is Javascript, but Typescript can just as well be
used in its place. The package includes TS type definitions.

## Concepts

### Context

It is often useful tha have slight variations in schemas. A common example is having different required fields in update
and create endpoint validation and the typescript interfaces used for that data.

This is accomplished using contexts. Any field can be flagged to be present only in some contexts, or to be optional in
some contexts.

The API by default generates the schemas/interfaces with the contexts `typescript`, `mongoose` and `jsonschema`
depending on the output type, but the user of the API can freely use any string. Nonetheless it can be convenient to use
these default contexts for simple variations based simply on output type.

## API

### Javascript API

Everything stable is exported from the main file of the package. For any examples below, it is assumed that either
`const schematar = require('schematar')` or `import * as schematar from 'schematar'` is present in the scope.

#### createMongooseSchema

    function createMongooseSchema(schema: Schema, context?: string): MongooseFields
    function createMongooseSchema(schema: Schema, options?: MongooseSchemaOptions): MongooseFields

This function creates a mongoose schema definition (not an instantiated schema) from the provided schema. Passing a context
string is equivalent to passing an options object where the context is set to the value.

##### Parameters

| Name    | Type    | Description                                                                                         |
| ------- | ------- | --------------------------------------------------------------------------------------------------- |
| schema  | Schema                                            | The Schematar schema being turned into a mongoose schema  |
| options | [MongooseSchemaOptions] (#mongooseschemaoptions)? | Options for mongoose schema generation                    |

###### MongooseSchemaOptions

An object with any of the following properties:

| Name         | Type      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| context      | string?   | The [context](#context) used for the schema generation. Defaults to `mongoose` |
| transformer  | function? | A function that can be used to change the modify the actual mongoose schema elements as they are being generated. It receives as is parameters the element as created by papupata, a path to the field as an array and the schematar field definition. The function can either return a modified version of the mongoose schema element or mutate the one passed to it. An example use would be conditionally removing or adding indexing to fields. |


##### Return value

Mongoose schema definition, which can be passed to mongoose `createSchema` function.

#### createTypescriptInterfaceDefinition

    function createTypescriptInterfaceDefinition(exportName: string, schema: Schema, context?: string, options?: TSOptions): string;

This function creates a typescript interface and returns it as a string.

##### Parameters

| Name       | Type                     | Description                                                                      |
| ---------- | ------------------------ | -------------------------------------------------------------------------------- |
| exportName | string                   | The name to be used for the generated exported interface                         |
| schema     | Schema                   | The Schematar schema being turned into a typescript interface                    |
| context    | string?                  | The [context](#context) used for the schema generation. Defaults to `typescript` |
| options    | [TSOptions](#tsoptions)? | Additional options for creating the interface                                    |

###### TSOptions

An object with any of the following properties:

| Name                | Type     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| omitExtraExports    | boolean? | By default, in addition to exporting the generic main interface a few additional interface are exported of the interface, with pre-set specialized types. These are `${interfaceName}Mongoose` with mongo object id used as object id and Date used for dates, `${interfaceName}JSON` with strings for both object id and date and `${interfaceName}Fluid` which allows either type for the the two. By setting this field to true, these exports are not created. |
| exportHash          | string   | If set to a value, a hash of this schema is exported as the export named by this option. This allows for checking if the interface being used matches the schema definition. This can be used to have the application refuse to run with outdated interfaces.                                                                                                                                                                                                      |
| doNotImportObjectId | boolean? | If set to true, no import for mongoose object id is generated. If you plan on inserting the generated schemas into your own files, this can be useful.                                                                                                                                                                                                                                                                                                             |

##### Return value

The function returns the contents of a file that exports a typescript interface defined the schema. The schema is
exported with the provided name, but is generic. The first type parameter is used as the concrete type for fields of
type `ObjectId`, and the second parameter is used for fields of type `Date`.

This allows you to use the interface for many uses, with for example dates coming in as strings through a REST API but
being actual Date objects otherwise.

#### createJSONSchema

    function createJSONSchema(schema: Schema, context?: string, options?: JSONSchemaOptions): JSONSchema;

This function creates a JSON-schema schema from a schematar schema.

##### Paramaters

| Name    | Type                                     | Description                                                                      |
| ------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| schema  | Schema                                   | The Schematar schema being turned into a json schema                             |
| context | string?                                  | The [context](#context) used for the schema generation. Defaults to `jsonschema` |
| options | [JSONSchemaOptions](#jsonschemaoptions)? | Additional options for creating the json-schema                                  |

###### JSONSchemaOptions

An object with any of the following properties:

| Name                   | Type     | Description                                                                                                                                                  |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| makeEverythingOptional | boolean? | If true, everything in the schema is made optional; applies to nested objects, too.                                                                          |
| allowAdditionalFields  | boolean? | By default all objects in the schema have `additionalProperties` set to false; if this option is set to true, `additionalProperties` is set to true instead. |

##### Return value

This function returns a json-schema schema as an object. At the moment it is of draft-07 variant.

#### createTypescriptInterfaceFiles

function createTypescriptInterfaceFiles(sourceFileGlobOrFileArray: string | string[], outputPath: string, logCreations?:
boolean): Promise<void>;

This function creates typescript interface files from a provided set of schema files. This function is essentially the
implementation of the command line tool. The filenames for the schemas are chosen automatically.

##### Paramaters

| Name                      | Type             | Description                                                                                        |
| ------------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| sourceFileGlobOrFileArray | string, string[] | One or many filenames or filename globs; relative paths are relative to current working directory. |
| outputPath                | string           | The directory, in which the interfaces are created                                                 |
| logCreations              | boolean?         | If set to true, any interfaces being created is logged to console                                  |

See [Exporting typescript interface information](#exporting-typescript-interface-information) for details on how the
function determines which interfaces are to be created and how.

##### Return value

A promise resolved when the interface creation is complete.

#### hashSchema

    function hashSchema(schema: Schema): string

This function creates a hash of a schema to be used for verifying that a typescript interface is up to date. At this
time features exclusive to other schema types do not affect the hash.

##### Parameters

| Name   | Type   | Description                       |
| ------ | ------ | --------------------------------- |
| schema | Schema | The Schematar schema being hashed |

##### Return value

The hash of the schema as a string

### Command line tool

A command line tool is installed for setting up typescript interface files, for use in build scripts etc.

    npx schematar create-typescript-interfaces ./output-directory src/**/*-schema.js

Or your schema files are in typescript and you do not wish to compile them ahead of time, you'll probably want to use
ts-node for the process:

    npx ts-node node_modules/.bin/schematar create-typescript-interfaces ./output-directory src/**/*-schema.js

Globs are supported for the schema parameter, helping with environments where the shell does not expand them.

See [Exporting typescript interface information](#exporting-typescript-interface-information) for details on how the
tool determines which interfaces are to be created and how.

## Defining schemas

A schema is a javascript object, that has `fields` property, which is a map where a key indicates property name and
value indicates property type. If you are used to mongoose schemas, you should find the format for the properties pretty
familiar.

    const emptySchema = {fields: {}}

A type for a field can be presented either as a simple type, or a type with additional options.

    const simpleSchema = {fields: { field: String }}
    const complexSchema = {fields: { field: {type: String /* other options go here */ } }}

### Field options

These options are available for most if not all field types.

| Name            | Type                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| index           | string or boolean or undefined | Permitted string values `unique` and `unique-sparse`. Relevant only for mongoose schema output; indicates how the field should be indexed. By default, and with explicit values false and undefined the field is not indexed. If set to boolean true, the field is indexed. If set to `unique` an unique index is created for the field. If set to `unique-sparse` an unique index is created with the `sparse` option set to true. |
| format          | any                            | Not used at this time                                                                                                                                                                                                                                                                                                                                                                                                               |
| optional        | boolean?                       | If set to true, undefined is a valid value for this field                                                                                                                                                                                                                                                                                                                                                                           |
| allowNull       | boolean?                       | If set to true, null is a valid value for this field                                                                                                                                                                                                                                                                                                                                                                                |
| presentIn       | string[]?                      | An array of contexts where this field is present at all. If left undefined, it is present in all contexts.                                                                                                                                                                                                                                                                                                                          |
| optionalIn      | string[]?                      | An array of contexts where undefined is a valid value for this field. Use the `optional` option instead if it is optional in all contexts.                                                                                                                                                                                                                                                                                          |
| mongooseDefault | any                            | Default value for the field in the mongoose schema                                                                                                                                                                                                                                                                                                                                                                                  |
| mongoose        | any                            | Any additional fields to be passed to the mongoose field definition                                                                                                                                                                                                                                                                                                                                                                 |

### Field types

#### String

    const schema = {fields: { field: String }}

A string, any string (unless the "enum" option is used)

Supported options:

| Name | Type      | Description                                                                  |
| ---- | --------- | ---------------------------------------------------------------------------- |
| enum | string[]? | An array of permitted values for this string. Supported in all schema types. |

#### Number

    const schema = { fields: {field: Number }}

A number, any number. In JSON-schema `NaN` and `Infinity` cannot be presented in any way.

#### Boolean

    const schema = { fields: {field: Boolean }}

Either true or false

#### Date

    const schema = {fields: { field: Date }}

A date, or rather, a date-time. In json-schema the date is expected to be presented as a string in ISO format compatible
with the Date `toISOString` method. In typescript interfaces a generic parameter indicates the concreted type for the
date.

Supported options:

| Name            | Type    | Description                                                       |
| --------------- | ------- | ----------------------------------------------------------------- |
| mongooseExpires | string? | Sets up the mongoose `expires` option for the field to this value |

For dates you can set up a mongoose default value to be the current moment with a special value for the
`mongooseDefault` option

    const schema = {fields: { field: Date, mongooseDefault: schematar.now }}

#### Arrays

    const schema = {fields: { field: [String]}}

Arrays are presented as an array that has one item, which is the type of the items within the array.

#### Nested Object

    const schema = {
      fields: {
        field: new schematar.Complex({
          nestedField: string
        }})
      }
    }

Nested objects are created by creating objects of the class `schematar.Complex`, whose constructor is given the fields
of the schema, in the same format as one would have the `fields` property of the schema itself.

#### ObjectId

    const schema = { fields: { field: schematar.ObjectId }}

For use with mongoose, the object id type. In json-schema the object ids are expected to be presented in their 24
hexadecimal digit string form. In typescript interfaces the concrete type of the object id is a generic parameter.

| Name        | Type    | Description                                                   |
| ----------- | ------- | ------------------------------------------------------------- |
| mongooseRef | string? | Sets up the mongoose `ref` option for the field to this value |

#### Other

For less common needs it is possible to provide custom output by subclassing the `Complex` class and overriding some
or all of its methods. The functions can always call the corresponding method of their superclass to get the default output.

There are methods for each of the output types:

##### outputTypescript

Return type: string

Parameters

| Name        | Type    | Description                                                        |
| ----------- | ------- | ------------------------------------------------------------------ |
| context     | string  | The context the output is for                                      |
| indentation | string  | Expected indentation for whatever is returner                      |
| _field      | object  | Reference to the raw field object present in the schema definition |


##### outputMongoose

Return type: object; either {type: mongooseFieldType} or {plain: mongooseFieldDefinition}
where the former just becomes a part of a mongoose field definition and the latter is the whole
field definition.

Parameters

| Name        | Type    | Description                                                        |
| ----------- | ------- | ------------------------------------------------------------------ |
| context     | string  | The context the output is for                                      |
| _field      | object  | Reference to the raw field object present in the schema definition |


##### outputJSONSchema

Return type: object, JSON-schema property

Parameters

| Name        | Type                    | Description                                                        |
| ----------- | ----------------------- | ------------------------------------------------------------------ |
| context     | string                  | The context the output is for                                      |
| context     | makeEverythingOptional  | Current value for the config setting                               |
| _field      | object                  | Reference to the raw field object present in the schema definition |

##### Example

    class AnyInTypescript extends Complex {
        constructor() { 
            super({})
        }
        
        outputTypescript() {
            return 'any'
        }
    }


### Any / unspecified

    const schema = { fields: {field: Object }}

This field can contain any value. Type-specific options are not available.

## Exporting typescript interface information

The interface filenames are the same as the base name of the schema file, with the double extension `schematar.ts`.

There are two ways to export typescript interfaces -- implicitly and explicitly.

### Implicitly

If the schema file does not export `typescriptSchemas`, then implicit mode is used.

In implicit mode the schema is expected to be exported as either `schema` or `default` (default export when using es
modules). If neither is exported, no interface is created. If `name` is exported, it is used as the name of the
typescript interface, otherwise the interface name is deduced from the schema filename.

All schema-specific typescript options are left at their default.

### Explicitly

You can export `typescriptSchemas` from the schema file to be in control of how the interfaces are crated. It is an
array, with an entry for each interface you want created.

For the examples here the ES module export style is used, but you can just as well use the commonjs exports object.

If you specifically want no typescript interfaces created for a schema, you can do one of

    export const typescriptSchemas = []

Entries in the array are objects with the following properties:

| Name    | Type    | Description                                                            |
| ------- | ------- | ---------------------------------------------------------------------- |
| name    | string  | Name of the interface; will be used as the exported interface name     |
| schema  | Schema  | The schematar schema to use for the interface                          |
| context | string? | The context to use for creating the interface. Default to `typescript` |

Additionally, any options from [TSOptions](#tsoptions) can be included in the object.

## Recommendations for schema implementation

TODO

## Plans

- Make mongoose completely optional for typescript interfaces
- JSON-schema option should be `allowAdditionalProperties`, not `allowAdditionalFields`
- hashSchema should support properties used by schema types other than ts interfaces
- support custom patterns in json-schema

## Contributing

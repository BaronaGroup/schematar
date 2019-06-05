import {FieldInfo, SchemaFields} from './schema'
import {outputFields as outputTSFields} from './ts-output'
import {MongooseTypeBase, outputFields as outputMongooseFields} from './mongoose-output'
import {
  JSONSchemaObjectProperty,
  JSONSchemaProperty,
  outputFields as outputJSONSchemaFields
} from './json-schema-output'

export default class Complex {
  public subschema: SchemaFields

  constructor(subschema: SchemaFields) {
    this.subschema = subschema
  }

  public generateTypescript(context: string, indentation: string, _field: FieldInfo) {
    return '{\n' + [...outputTSFields(this.subschema, context, indentation + '  ')].join('\n') + '\n' + indentation + '}'
  }

  public outputMongoose(context: string, _field: FieldInfo): MongooseTypeBase {
    return {plain: outputMongooseFields(this.subschema, context)}
  }

  public outputJSONSchema(context: string, makeEverythingOptional: boolean, _field: FieldInfo): JSONSchemaProperty {
    const subschema: JSONSchemaObjectProperty = {
      type: 'object',
      required: [],
      properties: {},
      additionalProperties: false
    }
    outputJSONSchemaFields(this.subschema, context, subschema, makeEverythingOptional)
    return subschema
  }
}

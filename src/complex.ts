import {
  JSONSchemaObjectProperty,
  JSONSchemaOptions,
  JSONSchemaProperty,
  outputFields as outputJSONSchemaFields,
} from './json-schema-output'
import { MongooseOutputOptions, MongooseTypeBase, outputFields as outputMongooseFields } from './mongoose-output'
import { FieldInfo, SchemaFields } from './schema'
import { outputFields as outputTSFields } from './ts-output'
import { TypeGraphQLOptions } from './typeGraphQLOutput'

export const COMPLEX_IDENTITY = 'complex-30753295-84f7-486b-bc21-b224461736ee'

export default class Complex {
  public subschema: SchemaFields

  get _schematarIdentity() {
    return COMPLEX_IDENTITY
  }

  constructor(subschema: SchemaFields) {
    this.subschema = subschema
  }

  public outputTypescript(context: string, indentation: string, _field?: FieldInfo) {
    return (
      '{\n' + [...outputTSFields(this.subschema, context, indentation + '  ')].join('\n') + '\n' + indentation + '}'
    )
  }

  public outputMongoose(options: MongooseOutputOptions, _field?: FieldInfo): MongooseTypeBase {
    return { plain: outputMongooseFields(this.subschema, options) }
  }

  public outputJSONSchema(context: string, options: JSONSchemaOptions, _field?: FieldInfo): JSONSchemaProperty {
    const subschema: JSONSchemaObjectProperty = {
      type: 'object',
      required: [],
      properties: {},
      additionalProperties: !!options.allowAdditionalFieldsNested,
    }
    outputJSONSchemaFields(this.subschema, context, subschema, options)
    return subschema
  }

  public static isComplex(potentialComplex: any): potentialComplex is Complex {
    return !!(potentialComplex && potentialComplex._schematarIdentity === COMPLEX_IDENTITY)
  }
}

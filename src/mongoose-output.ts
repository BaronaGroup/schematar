import {Schema, DefaultContext, SchemaFields, FieldInfo, Field, PlainType} from './schema'
import ObjectId from './object-id'
import Complex from './complex'

export default function<Context>(schema: Schema<Context>, context: DefaultContext | Context = 'mongoose') {
    const output: string[] = []
    output.push('export default const {')
    for (const field of outputFields(schema.fields, context as Context, '  ')) output.push(field)
    output.push('}')
    return output.join('\n')
}

function* outputFields<Context>(fields: SchemaFields<Context>, context: Context, indentation: string): IterableIterator<string> {
    for (const key of Object.keys(fields)) {
        if (key === '_id' || key === '__v') continue

        const field = fields[key]
        if (isFullDeclaration(field)) {
            yield indentation + key + ': {'
            const subind = indentation + '  '
            yield `${subind}type: ${asMongooseType(field.type, context, subind)},`
            if (field.index === true) {
                yield `${subind}index: true,`
            } else if (field.index === 'unique') {
                yield `${subind}unique: true,`
            } else if (field.index === 'unique-sparse') {
                yield `${subind}unique: true,`
                yield `${subind}sparse: true,`
            }        
            yield indentation + '}'
            
        } else {
            yield `${indentation}${key}: ${asMongooseType(field, context, indentation)},`
        }
    }
}

function asMongooseType<Context>(type: PlainType<Context>, context: Context, indentation: string): string {
    if (type === ObjectId) return 'ObjectId'
    if (type === String) return 'string'
    if (type === Date) return 'Date'
    if (type instanceof Complex) {
        return '{\n' + [...outputFields(type.subschema, context, indentation + '  ')].join('\n') + '\n' + indentation + '}'
    }
    if (type instanceof Array) {
        // TODO: support complex types
        return '[' + asMongooseType(type[0], context, indentation) + ']'
    }
    throw new Error('Unsupported type ' + type)
}

function isFullDeclaration<Context>(field: Field<Context>): field is FieldInfo<Context> {
    return !!(field as any).type
}
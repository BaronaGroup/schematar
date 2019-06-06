import {Schema, DefaultContext, SchemaFields, FieldInfo, Field, PlainType} from './schema'
import Complex from './complex'
import now from './now'
import {ObjectId} from './object-id'

export const filePrefix = `import mongoose from 'mongoose'\n// @ts-ignore -- ObjectId may or may not be used \nconst ObjectId = mongoose.Schema.Types.ObjectId\n\n`

export default function(exportName: string, schema: Schema, context: string = 'mongoose') {
    const output: string[] = []
    output.push(`export const ${exportName} = {`)
    for (const field of outputFields(schema.fields, context, '  ')) output.push(field)
    output.push('}')
    return output.join('\n')
}

function* outputFields(fields: SchemaFields, context: string, indentation: string): IterableIterator<string> {
    for (const key of Object.keys(fields)) {
        if (key === '_id' || key === '__v') continue

        const field = fields[key]
        const presentIn: string[] | undefined = (field as any).presentIn
        if (presentIn && !presentIn.includes(context)) continue
        const ftm = [...outputFieldFormat(field, context, indentation)]
        if (ftm.length === 1) {
            yield `${indentation}${key}: ${ftm[0]},`
        } else {
            yield `${indentation}${key}: ${ftm[0]}`
            yield* yieldMany(ftm.slice(1, -1))
            yield ftm.slice(-1)[0] + ','
        }
    }
}

function* outputFieldFormat(field: Field, context: string, indentation: string) {
    if (isFullDeclaration(field)) {
        yield '{'
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
        if (field.enum) {
            yield `${subind}enum: [${field.enum.map(val => '\'' + val.replace(/'/g, '\\') + '\'').join(', ')}],`
        }
        if (field.mongooseDefault !== undefined) {
            if (field.mongooseDefault === now) {
              yield `${subind}default: Date.now,`
            } else if (typeof field.mongooseDefault === 'string') {
              yield `${subind}default: '${field.mongooseDefault.replace(/'/, '\\\'')}',`
            } else if (typeof field.mongooseDefault === 'number') {
              yield `${subind}default: ${field.mongooseDefault},`
            } else {
                throw new Error('Cannot handle default value: ' + field.mongooseDefault)
            }
        }
        if (field.mongooseRef) {
            yield `${subind}ref: '${field.mongooseRef}',`
        }
        if (field.mongooseExpires) {
            yield `${subind}expires: '${field.mongooseExpires}',`
        }
        yield indentation + '}'

    } else {
        yield asMongooseType(field, context, indentation)
    }
}

function asMongooseType<Context>(type: PlainType, context: string, indentation: string): string {
    if (type === ObjectId) return 'ObjectId'
    if (type === String) return 'String'
    if (type === Boolean) return 'Boolean'
    if (type === Number) return 'Number'
    if (type === Object) return 'Object'
    if (type === Date) return 'Date'
    if (Complex.isComplex(type)) {
        return '{\n' + [...outputFields(type.subschema, context, indentation + '  ')].join('\n') + '\n' + indentation + '}'
    }
    if (type instanceof Array) {
        // TODO: support complex types
        const output = [...outputFieldFormat(type[0], context, indentation)].join('\n')
        return '[' + output + ']'
    }
    throw new Error('Unsupported type for mongoose schema ' + type)
}

function isFullDeclaration<Context>(field: Field): field is FieldInfo {
    return !!(field as any).type
}

function* yieldMany<T>(items: T[]): IterableIterator<T> {
    for (const item of items) yield item
}

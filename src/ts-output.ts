import {Schema, DefaultContext, SchemaFields, FieldInfo, Field, PlainType} from './schema'
import ObjectId from './object-id'
import Complex from './complex'

interface Options {
  omitExtraExports?: boolean
}

export default function(exportName: string, schema: Schema, context: string = 'typescript', options: Options = {}) {
    const output: string[] = []
    for (const field of outputFields(schema.fields, context, '  ')) output.push(field)
    output.unshift(`export interface ${exportName}Base<IDType, DateType, Defaultable> {`)
    output.unshift('// tslint:disable array-type')
    output.push('}')
    if (!options.omitExtraExports) {
        output.push(`export type ${exportName}Mongoose = ${exportName}Base<ObjectId, Date>`)
        output.push(`export type ${exportName}JSON = ${exportName}Base<string, string>`)
    }
    return output.join('\n')
}

function* outputFields(fields: SchemaFields, context: string, indentation: string): IterableIterator<string> {
    for (const key of Object.keys(fields)) {
        const field = fields[key]
        const presentIn: string[] | undefined = (field as any).presentIn
        if (presentIn && !presentIn.includes(context)) continue

        const ftm = [...outputFieldFormat(field, context, indentation)]
        const optional = isOptional(field, context)

        if (ftm.length === 1) {
            yield `${indentation}${key}${optional ? '?' : ''}: ${ftm[0]}`
        } else {
            yield `${indentation}${key}: ${ftm[0]}`
            yield* yieldMany(ftm.slice(1))
        }
    }
}

function isOptional<Context>(field: any, context: string) {
    if (!field.type) return false
    const fi = field as FieldInfo
    return fi.optional || (fi.optionalIn && fi.optionalIn.includes(context))

}

function* outputFieldFormat(field: Field, context: string, indentation: string) {
    if (isFullDeclaration(field)) {
        if (field.enum) {
            yield field.enum.map(f => "'" + f.replace(/'/g, "\\'") + "'").join(' | ')
        } else {
          const tsType = asTSType(field.type, context, indentation)
          yield 'mongooseDefault' in field ? tsType  + ' | Defaultable' : tsType
        }

    } else {
        yield asTSType(field, context, indentation)
    }
}

function asTSType<Context>(type: PlainType, context: string, indentation: string): string {
    if (type === ObjectId) return 'IDType'
    if (type === String) return 'string'
    if (type === Date) return 'DateType'
    if (type === Boolean) return 'boolean'
    if (type === Number) return 'number'
    if (type === Object) return 'any'

    if (type instanceof Complex) {
        return '{\n' + [...outputFields(type.subschema, context, indentation + '  ')].join('\n') + '\n' + indentation + '}'
    }
    if (type instanceof Array) {
        // TODO: support complex types
        const output = [...outputFieldFormat(type[0], context, indentation)].join('\n')
        return 'Array<' + output + '>'
    }
    throw new Error('Unsupported type for typescript type ' + type)
}

function isFullDeclaration<Context>(field: Field): field is FieldInfo {
    return !!(field as any).type
}

function* yieldMany<T>(items: T[]): IterableIterator<T> {
    for (const item of items) yield item
}

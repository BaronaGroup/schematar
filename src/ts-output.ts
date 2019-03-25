import {Schema, DefaultContext, SchemaFields, FieldInfo, Field, PlainType} from './schema'
import Complex from './complex'
import {ObjectId} from './object-id'

export interface TSOptions {
  omitExtraExports?: boolean
}

export default function(exportName: string, schema: Schema, context: string = 'typescript', options: TSOptions = {}) {
    const output: string[] = []
    output.push('// Generated file, do not edit!')
    output.push('')
    output.push('// tslint:disable array-type')
    output.push('// @ts-ignore -- ignore possibly unused type parameters')
    output.push(`export interface ${exportName}Base<IDType, DateType> {`)
    for (const field of outputFields(schema.fields, context, '  ')) output.push(field)
    output.push('}')
    if (!options.omitExtraExports) {
        output.push(`import {ObjectId} from 'mongodb'`)
        output.push(`export type ${exportName}Mongoose = ${exportName}Base<ObjectId, Date>`)
        output.push(`export type ${exportName}JSON = ${exportName}Base<string, string>`)
        output.push(`export type ${exportName}Fluid = ${exportName}Base<string | ObjectId, string | Date>`)
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
        const allowNull = (field as any).allowNull
        if (allowNull && !optional) throw new Error('allowNull can only be used on optional fields')

        if (ftm.length === 1) {
            yield `${indentation}${key}${optional ? '?' : ''}: ${ftm[0]}${allowNull ? ' | null' : ''}`
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
            yield field.enum.map(f => '\'' + f.replace(/'/g, '\\\'') + '\'').join(' | ')
        } else {
          yield asTSType(field.type, context, indentation)
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

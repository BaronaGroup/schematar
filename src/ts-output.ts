import {Schema, DefaultContext, SchemaFields, FieldInfo, Field, PlainType, isFullDeclaration} from './schema'
import Complex from './complex'
import {ObjectId} from './object-id'
import {generateHash} from './hash-schema'

export interface TSOptions {
    omitExtraExports?: boolean
    exportHash?: string
    doNotImportObjectId?: boolean
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
        if (!options.doNotImportObjectId) {
            output.push(`import {ObjectId} from 'mongodb'`)
        }
        output.push(`export type ${exportName}Mongoose = ${exportName}Base<ObjectId, Date>`)
        output.push(`export type ${exportName}JSON = ${exportName}Base<string, string>`)
        output.push(`export type ${exportName}Fluid = ${exportName}Base<string | ObjectId, string | Date>`)
    }
    const {exportHash} = options
    if (exportHash) {
        const hash = generateHash(schema)
        output.push(`export const ${exportHash} = '${hash}'`)
    }

    return output.join('\n')
}

export function* outputFields(fields: SchemaFields, context: string, indentation: string): IterableIterator<string> {
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
          yield asTSType(field, context, indentation)
        }

    } else {
        yield asTSType({type: field}, context, indentation)
    }
}

function asTSType<Context>(field: FieldInfo, context: string, indentation: string): string {
    const {type} = field
    if (type === ObjectId) return 'IDType'
    if (type === String) return 'string'
    if (type === Date) return 'DateType'
    if (type === Boolean) return 'boolean'
    if (type === Number) return 'number'
    if (type === Object) return 'any'

    if (type instanceof Complex) {
        return type.generateTypescript(context, indentation, field)
    }
    if (type instanceof Array) {
        // TODO: support complex types
        const output = [...outputFieldFormat(type[0], context, indentation)].join('\n')
        return 'Array<' + output + '>'
    }
    throw new Error('Unsupported type for typescript type ' + type)
}

function* yieldMany<T>(items: T[]): IterableIterator<T> {
    for (const item of items) yield item
}

import Complex from './complex'
import { generateHash } from './hash-schema'
import { ObjectId } from './object-id'
import { Field, FieldInfo, Schema, SchemaFields, isFullDeclaration, isSchema } from './schema'

export interface TypeGraphQLOptions {
  exportHash?: string
  classNamePrefix?: string
  classNameSuffix?: string
  suffixObjectIdsWithId?: boolean
  exportResolversAs?: string
}

interface Resolver {
  name: string
  lines: string[]
}

export default function typeGraphQLOutput(
  baseName: string,
  schema: Schema | Complex,
  context = 'type-graphql',
  options: TypeGraphQLOptions = {}
) {
  const output: string[] = []
  output.push('// Generated file, do not edit!')
  output.push('')
  output.push('// tslint:disable')
  output.push('/* eslint-disable */')

  const requiredImports = new Set<string>()

  const resolvers: Array<Resolver | null> = []

  output.push(
    ...convertSubschema(
      [baseName],
      context,
      Complex.isComplex(schema) ? schema.subschema : schema.fields,
      requiredImports,
      resolvers,
      false,
      options
    )
  )

  const { exportHash } = options
  if (exportHash) {
    const hash = generateHash(Complex.isComplex(schema) ? { fields: schema.subschema } : schema)
    output.push(`export const ${exportHash} = '${hash}'`)
  }

  for (const requiredImport of Array.from(requiredImports)) {
    output.unshift(requiredImport)
  }

  for (const resolver of resolvers) {
    if (resolver) {
      output.push(...resolver.lines)
    }
  }

  const resolversExport = options.exportResolversAs ?? `${baseName}Resolvers`

  output.push(`export const ${resolversExport} = [`)
  for (const resolver of resolvers) {
    if (resolver) {
      output.push(`  ${resolver.name},`)
    }
  }
  output.push('] as const')

  return output.join('\n')
}

function getClassName(path: string[], options: TypeGraphQLOptions) {
  return `${options.classNamePrefix ?? ''}${path.join('_')}${options.classNameSuffix ?? ''}`
}

function convertSubschema(
  path: string[] = [],
  context: string,
  schema: SchemaFields,
  requiredImports: Set<string>,
  resolvers: Resolver[],
  needsId: boolean,
  options: TypeGraphQLOptions
): string[] {
  const output: string[] = []
  const className = getClassName(path, options)

  output.push(...generatedNestedSubschemas(path, context, schema, requiredImports, resolvers, options))
  output.push(`@ObjectType('${path.join('_')}')`)
  requiredImports.add("import { ObjectType } from 'type-graphql'")
  output.push(`export class ${className} {`)
  output.push(...outputFields(path, schema, context, requiredImports, needsId, options))
  output.push(`}`)
  output.push(``)

  resolvers.push(generateResolver(path, schema, context, requiredImports, options))

  return output
}

function generateResolver(
  path: string[],
  fields: SchemaFields,
  context: string,
  imports: Set<string>,
  options: TypeGraphQLOptions
): Resolver | null {
  let isSignificant = false
  const resolverClass = getClassName(['DefaultResolver', ...path], options)
  const codeLines = Array.from(generateResolverImpl())
  if (!isSignificant) return null
  return {
    name: resolverClass,
    lines: codeLines,
  }

  function* generateResolverImpl(): IterableIterator<string> {
    imports.add("import { Resolver } from 'type-graphql'")
    yield ''
    yield `@Resolver(() => ${getClassName(path, options)})`
    yield `export class ${resolverClass} {`

    if (path.length === 1 && !('id' in fields)) {
      isSignificant = true

      imports.add(`import { FieldResolver } from 'type-graphql'`)
      imports.add(`import { Root } from 'type-graphql'`)
      imports.add(`import { ID } from 'type-graphql'`)
      imports.add(`import { getIdForGql } from 'schematar/dist/get-id-for-gql'`)
      yield '  '
      yield `  @FieldResolver(() => ID)`
      yield `  id(@Root() root: ${getClassName(path, options)}) {`
      yield `    return getIdForGql(root, '${path[0]}', 'id', root, 0)`
      yield '  }'
    }

    for (const key of Object.keys(fields)) {
      const field = fields[key]
      const presentIn: string[] | undefined = (field as any).presentIn
      if (presentIn && !presentIn.includes(context)) continue

      const complex = getComplex(field)

      if (isArrayField(field) && complex) {
        isSignificant = true
        imports.add(`import { FieldResolver } from 'type-graphql'`)
        imports.add(`import { Root } from 'type-graphql'`)
        imports.add(`import { getIdForGql } from 'schematar/dist/get-id-for-gql'`)
        yield '  '
        yield `  @FieldResolver(() => [${getClassName([...path, key], options)}])`
        yield `  ${key}(@Root() root: ${getClassName(path, options)}) {`
        yield `    return root['${key}']?.map((item, index) => ({`
        yield `       ...item,`
        yield `       id: getIdForGql(root, '${path[0]}', '${key}', item, index),`
        yield `    }))`
        yield '  }'
      }

      if (isObjectIdType(field)) {
        isSignificant = true
        imports.add(`import { FieldResolver } from 'type-graphql'`)
        imports.add(`import { Root } from 'type-graphql'`)

        const effectiveKey = options.suffixObjectIdsWithId && key !== '_id' && !key.endsWith('Id') ? `${key}Id` : key

        yield '  '
        yield `  @FieldResolver(() => String)`
        yield `  ${effectiveKey}(@Root() root: ${getClassName(path, options)}) {`
        yield `    const id = root['${key}']`
        yield `    if (!id) return id`
        yield `    return id.toString()`
        yield '  }'
      }
    }
    yield '}'
  }
}

function* generatedNestedSubschemas(
  path: string[],
  context: string,
  fields: SchemaFields,
  requiredImports: Set<string>,
  resolvers: Resolver[],
  options: TypeGraphQLOptions
): IterableIterator<string> {
  for (const key of Object.keys(fields)) {
    const field = fields[key]
    const presentIn: string[] | undefined = (field as any).presentIn
    if (presentIn && !presentIn.includes(context)) continue

    const complex = getComplex(field)
    if (!complex) continue

    const needsId = isArrayField(field)

    yield* convertSubschema([...path, key], context, complex.subschema, requiredImports, resolvers, needsId, options)
  }
}

function isArrayField(field: Field) {
  if (isFullDeclaration(field)) {
    return Array.isArray(field.type)
  } else {
    return Array.isArray(field)
  }
}

export function* outputFields(
  path: string[],
  fields: SchemaFields,
  context: string,
  requiredImports: Set<string>,
  needsId: boolean,
  options: TypeGraphQLOptions
): IterableIterator<string> {
  const keys = Object.keys(fields)
  if (!keys.includes('id') && needsId) {
    requiredImports.add("import { Field } from 'type-graphql'")
    requiredImports.add("import { ID } from 'type-graphql'")
    yield `  @Field(() => ID, { nullable: false })`
    yield `  public id: string`
  }
  for (const key of keys) {
    const field = fields[key]
    const presentIn: string[] | undefined = (field as any).presentIn
    if (presentIn && !presentIn.includes(context)) continue

    const optional = isOptional(field, context)
    const allowNull = (field as any).allowNull
    if (allowNull && !optional) throw new Error('allowNull can only be used on optional fields')

    const effectiveKey =
      options.suffixObjectIdsWithId && isObjectIdType(field) && key !== '_id' && !key.endsWith('Id') ? `${key}Id` : key

    yield '  '
    if (effectiveKey === key) {
      if (!(getComplex(field) && isArrayField(field))) {
        yield '  ' + outputFieldDecorator([...path, key], field, optional, requiredImports, options)
      }
      yield `  public ${effectiveKey}${optional ? '?' : ''}: ${outputFieldFormat(
        [...path, key],
        field,
        context,
        requiredImports,
        options
      )}`
    } else {
      yield `  public ${key}: string`
    }
  }
}

function isObjectIdType(field: Field) {
  if (isFullDeclaration(field)) {
    return field.type === ObjectId
  } else {
    return field === ObjectId
  }
}

function getComplex(field: Field): null | Complex {
  if (isFullDeclaration(field)) {
    if (Complex.isComplex(field.type)) return field.type
    if (Array.isArray(field.type)) {
      return getComplex(field.type[0])
    }
  } else {
    if (Complex.isComplex(field)) return field
    if (Array.isArray(field)) {
      return getComplex(field[0])
    }
  }
  return null
}

function outputFieldDecorator(
  path: string[],
  field: Field,
  optional: boolean,
  imports: Set<string>,
  options: TypeGraphQLOptions
) {
  imports.add("import { Field } from 'type-graphql'")

  return `@Field(() => ${getGqlType(path, field, imports, options)}, { nullable: ${!!optional} })`
}

function getGqlType(path: string[], field: Field, imports: Set<string>, options: TypeGraphQLOptions): string {
  const fieldDecl: FieldInfo = isFullDeclaration(field) ? field : { type: field }

  if (fieldDecl.typeGraphQL?.specialType) {
    switch (fieldDecl.typeGraphQL?.specialType) {
      case 'int':
        imports.add("import { Int } from 'type-graphql'")
        return 'Int'
      case 'float':
        imports.add("import { Float } from 'type-graphql'")
        return 'Float'
      default:
        throw new Error('Invalid special type ' + fieldDecl.typeGraphQL?.specialType)
    }
  }

  const { type } = fieldDecl

  if (type === ObjectId) return 'String'
  if (type === String) return 'String'
  if (type === Date) {
    imports.add("import { GraphQLISODateTime } from 'type-graphql'")
    return 'GraphQLISODateTime'
  }
  if (type === Boolean) return 'Boolean'
  if (type === Number) {
    imports.add("import { Float } from 'type-graphql'")
    return 'Float'
  }
  if (type === Object) {
    return 'BAD'
    //throw new Error('Fields of an unspecified type are not supported in type-graphql: ' + path.join('/'))
  }

  if (Complex.isComplex(type)) {
    return getClassName(path, options)
  }
  if (Array.isArray(type)) {
    return `[${getGqlType(
      path,
      isFullDeclaration(type[0]) ? type[0] : { ...fieldDecl, type: type[0] },
      imports,
      options
    )}]`
  }
  if (isSchema(type)) {
    return getClassName(path, options)
  }
}

function isOptional(field: any, context: string) {
  if (!field.type) return false
  const fi = field as FieldInfo
  return fi.optional || (fi.optionalIn && fi.optionalIn.includes(context))
}

function outputFieldFormat(
  path: string[],
  field: Field,
  context: string,
  imports: Set<string>,
  options: TypeGraphQLOptions
): string {
  if (isFullDeclaration(field)) {
    if (field.enum) {
      const isArray = Array.isArray(field.type)
      return (
        (isArray ? 'Array<' : '') +
        field.enum.map((f) => "'" + f.replace(/'/g, "\\'") + "'").join(' | ') +
        (isArray ? '>' : '')
      )
    } else {
      return asTSType(path, field, context, imports, options)
    }
  } else {
    return asTSType(path, { type: field }, context, imports, options)
  }
}

function asTSType(
  path: string[],
  field: FieldInfo,
  context: string,
  imports: Set<string>,
  options: TypeGraphQLOptions
): string {
  const { type } = field
  if (type === ObjectId) {
    imports.add("import { ObjectId} from 'mongodb'")
    return '(ObjectId | string)'
  }
  if (type === String) return 'string'
  if (type === Date) return '(Date | string)'
  if (type === Boolean) return 'boolean'
  if (type === Number) return 'number'
  if (type === Object) return 'any'

  if (Complex.isComplex(type)) {
    return getClassName(path, options)
  }
  if (Array.isArray(type)) {
    // TODO: support complex types
    const output = outputFieldFormat(path, type[0], context, imports, options)
    return 'Array<' + output + '>'
  }
  if (isSchema(type)) {
    return getClassName(path, options)
  }
  throw new Error('Unsupported type for typescript type ' + type)
}

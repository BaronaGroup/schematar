import {Schema} from '../../schema'

export const schema: Schema = {
  fields: {
    field1: String,
    field2: {type: String, optionalIn: ['one']},
    field3: {type: String, optionalIn: ['two']},
    field4: {type: String, presentIn: ['one']},
    field5: {type: String, presentIn: ['two']},
  }
}

export const typescriptSchemas: any[] = [
  {
    context: 'one'
  }
]

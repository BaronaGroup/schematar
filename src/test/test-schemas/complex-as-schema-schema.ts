import Complex from '../../complex'

const schema = new Complex({
  field: String,
  field2: Number,
})

export const typescriptSchemas: any[] = [{ name: 'CustomName', schema }]

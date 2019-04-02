export const schema = {
  fields: {
    field: String,
    finalField: {type: String, presentIn: ['final']}
  }
}

export const typescriptSchemas: any[] = [
  {
  },
  {
    name: 'Alternative',
    exportHash: 'anotherHash',
    schema: {
      fields: {
        another: Number
      }
    }
  },
  {
    name: 'Final',
    context: 'final'
  }
]

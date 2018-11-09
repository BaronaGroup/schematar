import {Schema} from '../schema'
import ObjectId from '../object-id'
import Complex from '../complex' 
import toMongooseSchema from '../mongoose-output'
import toTypescriptSchema from '../ts-output'
import toJSONSchema from '../json-schema-output'
import { Context } from './context';

const schema: Schema<Context> = {
    fields: {
        _id: ObjectId,
        parent: ObjectId,
        name: new Complex<Context>({
            first: String,
            last: String
        }),
        createdAt: {
            type: Date
        },
        email: {
            type: String,
            index: true,
            format: /@/
        },
        phoneNumbers: [{type: String}],

        password: {
            type: String,
            presentIn: ['mongoose', 'typescript']
        }
    }
}

export default {
    mongoose: toMongooseSchema(schema),
    ts: toTypescriptSchema(schema),
    json: toJSONSchema(schema)
}

import {Schema} from '../schema'
import Complex from '../complex'
import toMongooseSchema from '../mongoose-output'
import toTypescriptSchema from '../ts-output'
import toJSONSchema from '../json-schema-output'
import {ObjectId} from 'bson'
const schema: Schema = {
    fields: {
        _id: ObjectId,
        parent: ObjectId,
        name: new Complex({
            first: String,
            last: String
        }),
        createdAt: {
            type: Date,
            optional: true
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
        },
        favouriteColor: {
            type: String,
            enum: ['red', 'blue', 'green', 'other']
        }
    }
}

export default {
    mongoose: toMongooseSchema('exampleSchema', schema),
    typescript: toTypescriptSchema('Example', schema),
    json: toJSONSchema('ExampleJSONSchema', schema)
}

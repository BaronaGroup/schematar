import { Schema, DefaultContext, SchemaFields } from "./schema";

export default class Complex<Context = DefaultContext>{
    public subschema :SchemaFields<Context>

    constructor(subschema: SchemaFields<Context>) {       
        this.subschema = subschema
    }
}
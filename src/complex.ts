import { SchemaFields } from "./schema";

export default class Complex{
    public subschema: SchemaFields

    constructor(subschema: SchemaFields) {
        this.subschema = subschema
    }
}

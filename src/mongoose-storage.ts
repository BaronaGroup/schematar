let mongoose: any

export function setMongoose(newMongoose: any) {
  mongoose = newMongoose
}

export function getMongoose() {
  return mongoose
}

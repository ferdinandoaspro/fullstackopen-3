const mongoose = require("mongoose")

const url = process.env.MONGODB_URL

mongoose.set("strictQuery", false)

mongoose.connect(url)
    .then(result => {
      console.log('connected to MongoDB')
    })
    .catch(error => {
      console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({

    id: Number,
    name: {type: String, minLength: 3, required: true},
    number: {
        type: String,
        minLength: 8, 
        required: true,
        validate: {
            validator: function(v) {
              return /\d{2,3}-\d{7,8}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`      
        }
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
  }
})
    
/*

const Person = mongoose.model("Person", personSchema)

const name = process.argv[2]
const number = process.argv[3]

const person = new Person({

    id: Math.floor(Math.random() * 1000),
    name: name,
    number: number
})

if (process.argv.length == 3) {

    Person.find({}).then(result => {

        console.log("phonebook:")
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        
        mongoose.connection.close()
    })

    } else {

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
}

*/
module.exports = mongoose.model("Person", personSchema)
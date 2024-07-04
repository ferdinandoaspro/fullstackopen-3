require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const app = express()
morgan.token("postData", (req, res) => JSON.stringify(req.body))
const isPost = (req, res) => req.method === "POST"
const isNotPost = (req, res) => req.method !== "POST"

// Routes and middleware for errors

app.use(cors())
app.use(express.static("dist"))
app.use(morgan("tiny", {skip: isPost}))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :postData", {skip: isNotPost}))

app.get('/info', (req, res) => {
    res.end(`<p>Phonebook has info for ${Person.length} people</p><p>${new Date().toString()}</p>`)
})

app.get("/api/persons", (req, res) => {
    Person.find({}).then(persons => {
      res.json(persons)
    })
})

app.get("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
      .then(person => {
        res.status(204).end()
      })
      .catch(error => next(error))
})

app.use(express.json())

app.post("/api/persons", (req, res) => {
  const body = req.body
  const nameExists = Person.find({name: body.name})
  const generateId = () => {
    const maxId = Math.floor(Math.random() * 1000)
    return maxId + 1
  }

  const person = new Person({
    id: generateId(),
    ...body
  })

  if (!body.name) {
    return res.status(400).json({
      error: "name is missing"
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: "number is missing"
    })
  }

  if (nameExists.length > 0) {
    return res.status(400).json({
      error: "name must be unique"
    })
  }

  person.save().then(newPerson => {
    res.json(newPerson)
  })
})

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  if (error.name === "CastError") {
    return res.status(400).send({error: "malformatted id"})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
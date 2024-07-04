require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const app = express()
morgan.token("postData", (req, res) => JSON.stringify(req.body))
const isPost = (req, res) => req.method === "POST"
const isNotPost = (req, res) => req.method !== "POST"

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

app.delete("/api/persons/:id", (req, res) => {
    Person.findByIdAndDelete(req.params.id)
      .then(person => {
        res.status(204).end()
      })
      .catch(error => {
        res.status(400).send({error: "malformatted id"})
      })
})

app.use(express.json())

app.post("/api/persons", (req, res) => {
  const body = req.body
  const generateId = () => {
    const maxId = Math.floor(Math.random() * 1000)
    return maxId + 1
  }

  const person = new Person({
    id: generateId(),
    ...body
  })

  person.save().then(newPerson => {
    res.json(newPerson)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
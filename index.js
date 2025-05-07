require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const morgan = require('morgan')

morgan.token('req_body', function getRequestBody (req) {
  return JSON.stringify(req.body)
})

const app = express()

app.use(express.static('dist'))
app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req_body'))


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})


app.get('/info', (request, response) => {
  Person.countDocuments().then(count => {
    const info = `
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>`
    response.send(info)
  })
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number || '',
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => {
    next(error)
  })
})


app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => console.log(error.message))
})


app.put('/api/persons/:id', (request, response, next) => {
  console.log('updating info')
  const { name, number } = request.body
  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }
      person.number = number
      person.name = name
      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
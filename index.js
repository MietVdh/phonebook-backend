require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const morgan = require('morgan')


if (process.argv.length == 3) {
    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length == 5) {
    const name = process.argv[3]
    const number = process.argv[4]
    const person = new Person({ name, number })
    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

const app = express()

app.use(express.json())
morgan.token('req_body', function getRequestBody (req) {
    return JSON.stringify(req.body)
  })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req_body'))
app.use(express.static('dist'))

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
    
})

app.get('/info', (request, response) => {
    const numberOfPeople = persons.length == 1 ? "1 person" : `${persons.length} people`
    const info = `
    <p>Phonebook has info for ${numberOfPeople}</p>
    <p>${new Date()}</p>
    `
    response.send(info)
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: "name missing"
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: "number missing"
        })
    }

    // if (persons.find(person => person.name === body.name)) {
    //     return response.status(400).json({
    //         error: "name must be unique"
    //     })
    // }
    const person = new Person({
        name: body.name,
        number: body.number || "",
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

})


app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => console.log(error.message))    
})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
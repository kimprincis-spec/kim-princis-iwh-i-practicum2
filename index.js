require('dotenv').config()

const express = require('express')
const axios = require('axios')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const HUBSPOT_BASE_URL = 'https://api.hubapi.com'

const CUSTOM_OBJECT = '2-54738442'


const PROPERTIES = [
  { name: 'name', label: 'Name' },
  { name: 'species', label: 'Species' },
  { name: 'color', label: 'Color' }
]

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  try {
    const propertiesParam = PROPERTIES.map(p => p.name).join(',')

    const response = await axios.get(
      `${HUBSPOT_BASE_URL}/crm/v3/objects/${CUSTOM_OBJECT}?properties=${propertiesParam}`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`
        }
      }
    )

    const records = response.data.results || []

    res.render('homepage', {
      title: 'Homepage | Integrating With HubSpot I Practicum',
      properties: PROPERTIES,
      records
    })
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).send('Could not load data from HubSpot')
  }
})

app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
    properties: PROPERTIES
  })
})

app.post('/update-cobj', async (req, res) => {
  try {
    const payloadProperties = {}

    PROPERTIES.forEach(prop => {
      if (req.body[prop.name]) {
        payloadProperties[prop.name] = req.body[prop.name]
      }
    })

    await axios.post(
      `${HUBSPOT_BASE_URL}/crm/v3/objects/${CUSTOM_OBJECT}`,
      {
        properties: payloadProperties
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    res.redirect('/')
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).send('Could not create record in HubSpot')
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

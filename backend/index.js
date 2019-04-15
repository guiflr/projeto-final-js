const app = require('express')()
const consign = require('consign')
const connection = require('./config/db')

app.db = connection

consign()
    .then('./config/middlewares.js')
    .then('./api/validator.js')
    .then('./api/user.js')
    .then('./api/categories.js')
    .then('./api/article.js')
    .then('./config/routes.js')
    .into(app)

app.listen(3000, () => {
    console.log('Executando')
})
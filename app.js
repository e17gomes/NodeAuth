require('dotenv').config()
const express = require('express')
const moongose = require('mongoose')
const bc = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.get('/', (req, res)=>{
    res.status(200).json({msg: 'Welcome the our API'})
})
app.listen(3000)


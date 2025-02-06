const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express(); 
const db = mysql.createConnection({
    host: "localhost"

})

app.use(cors()); 

app.listen(8081, ()  =>{
    console.log("listening");
})
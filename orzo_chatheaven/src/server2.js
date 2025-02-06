const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express(); 
const db = mysql.createConnection({
    host: "localhost"

})

app.use(cors()); 

app.post('/login', (req, res)=>{
    const sql = "SELECT * FROM login WHERE username = ? AND password = ?" ;
    db.query(sql, [req.body.email, req.body.password], (err, data) =>{
        if(err) return res.json("error"); 
        if(data.length > 0) {
            return res.json("Login successfull")
        } else {
            return res.json("User does not exist")
        }
    })
})

app.listen(8081, ()  =>{
    console.log("listening");
})
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

const db = new pg.Client ({
  user : "postgres",
  host : "localhost",
  database : "world",
  password : process.env.PASSWORD,
  port : 5432
});

db.connect();

let visited_countries = [];
let total = 0;

db.query("SELECT country_code FROM visited_countries",(err,res) => {
  if(err) {
    console.error("Error executing query",err.stack);
  } else {
    console.log(res.rows);
    console.log(res.rowCount);
    let data = res.rows;
    total = res.rowCount;
    data.map(record => (
      visited_countries.push(record.country_code)
    ));
    console.log(visited_countries);
  }
  db.end();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/",(req, res) => {
  res.render("index.ejs", { 
    total : total, 
    countries : visited_countries
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

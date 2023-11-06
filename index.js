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

// db.query("SELECT country_code FROM visited_countries",(err,res) => {
//   if(err) {
//     console.error("Error executing query",err.stack);
//   } else {
//     console.log(res.rows);
//     console.log(res.rowCount);
//     let data = res.rows;
//     total = res.rowCount;
//     data.map(record => (
//       visited_countries.push(record.country_code)
//     ));
//     console.log(visited_countries);
//   }
//   //db.end();
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/",async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_countries");
  console.log(result.rows);
  console.log(result.rowCount);
  total = result.rowCount;
  result.rows.forEach((record) => {
    visited_countries.push(record.country_code);
  });
  console.log(visited_countries);
  res.render("index.ejs", { 
    total : total, 
    countries : visited_countries
  });
});

app.post("/add",async(req,res) => {
  let country = req.body.country;
  console.log(country);
  let code;
  try {
    code = await db.query("SELECT country_code FROM countries WHERE country_name = $1",[country]);
    console.log(code.rows);
    //res.redirect("/");
    if(code.rows.length !== 0) {
      try {
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[code.rows[0].country_code]);
        res.redirect("/");
      } catch(err) {
        console.log(err);
        res.render("index.ejs", { 
          total : total, 
          countries : visited_countries,
          error : "Country has already been added, try again!!!"
        });
      }
    } else {
      res.render("index.ejs", { 
        total : total, 
        countries : visited_countries,
        error : "Country does not exist, try again!!!"
      });
    }
  } catch(err) {
    console.log(err);
  }
  //res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

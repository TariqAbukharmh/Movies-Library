'use strict';

const express = require("express");
const axios = require("axios");
const pg = require("pg");
const dotenv = require("dotenv");




// read data from JSON file
const movies = require("./MovieData/data.json");

// data taken from .env
const KEY = process.env.KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const port = process.env.PORT;
const client = new pg.Client(DATABASE_URL);

// initializing the server
const app = express();
dotenv.config();

app.use(express.json());

app.get('/', moviesHandler);
app.get('/favorite', favoriteHandler);
app.get('/trending', trendingHandler);
app.get('/searchMovies', searchHandler);

// this is two other get from my own 
app.get('/topRated', topRatedHandler);
app.get("/popular", popularMoviesHandler);

// requst for DB ("Task13")
app.post("/addMovie", addMovieHandler);
app.get("/getMovies", getMoviesHandler);


// update and delete requst  DB
app.put("/updateMovie : id", updateHandler);
app.delete("/DELETE/:id", deleteHandler);






// error and not found handler 
app.use("*", notFoundHandler);
app.use(errorHandler);

// here's our Counstuctor 
function Movie(title, poster_path, overview){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}







function favoriteHandler(request, response){
    return res.send("Welcome to Favorite Page");
}

function moviesHandler(request, response){
    let oneMovies = new Movie(movies.title, movies.poster_path,movies.overview);
    return response.status(200).json(oneMovies);
};

function trendingHandler(request, response){
    let result = [];
    axios.get(`https://api.themoviedb.org/3/trending/all/week?apikey=${KEY}&language=en-US`)
    .then(apiResponse => {
        apiResponse.data.results.map(value => {
            let oneResult = new Movie(value.id, value.title,value.release_date, value.poster_path, value.overview);
            result.push(oneResult);
        });

        return response.status(200).json(result);

    }).catch(error => {
        errorHandler(request, response, error);
    });
}

function searchHandler(req, res) {
    let result = [];
    const search = req.query.Movie;
    axios.get(`https://api.themoviedb.org/3/search/movie?apikey=${KEY}&query=${search}`).then(apiResponse => {
        apiResponse.data.results.map(value => {
            let oneMovie = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview);
            result.push(oneMovie);
        })
        console.log(result);
        return res.status(200).json(result);
    }).catch(error => {
        errorHandler(error, req, res);
    })
};

function topRatedHandler(req, res) {
    let result = [];
    axios.get(`https://api.themoviedb.org/3/movie/top_rated?apikey=${KEY}`).then(apiResponse => {
        apiResponse.data.results.map(value => {
            let oneMovie = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview);
            result.push(oneMovie);
        })
        return res.status(200).json(result);
    }).catch(error => {
        errorHandler(error, req, res);
    })
};

function popularMoviesHandler(req, res) {
    let popularMovies = [];
    axios.get(`https://api.themoviedb.org/3/movie/popular?apikey=${KEY}&language=en-US&page=1`).then((value) => {
  
        value.data.results.forEach((value) => {
          let popularMovie = new DataFormatter(value.id, value.title, value.release_date, value.poster_path, value.overview);
          popularMovies.push(popularMovie);
        });
        return res.status(200).json(popularMovies);
      })
      .catch((error) => {
        errorHandler(error, req, res);
      });
  }
  

  function addMovieHandler(req, res){
    const movie = req.body;
    const sql = `INSERT INTO moviesTable(title, release_date, poster_path, overview , comment) VALUES($1, $2, $3, $4, $5) RETURNING *`;
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comment];
    client.query(sql, values).then((result)=>{
        return res.status(201).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};

function getMoviesHandler(req, res){
    const sql = `SELECT * FROM moviesTable`;

    client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};

// update and delete Handler 

function updateHandler(req, res){
    const id = req.params.id;
    const movie = req.body;
   
    const sql = `UPDATE movieslibrary SET title=$1, poster_path=$2,overview=$3, comment=$4 WHERE id=$5 RETURNING *;`;
    const values = [movie.title, movie.poster_path, movie.overview, movie.comment ,id];

    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })

};

function deleteFavmovieHandler(req, res){
    const id = req.params.id

    const sql = `DELETE FROM moviesTable WHERE id=$1;`
    const values = [id];

    client.query(sql, values).then(() => {
        return res.status(204).json({})
    }).catch(error => {
        errorHandler(error, req, res);
    })
};










function errorHandler(error, req, res) {
    const err = {
        status: 500,
        responseText: "Sorry, something went wrong"
    }
    return res.status(500).send(err);
}

function notFoundHandler(req, res) {
    return res.status(404).send("Page Not Found");
}


client.connect().then(() => {
    app.listen(3001, () => {
        console.log("Listen on ${port}");
    });
})


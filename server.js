'use strict';

const express = require("express");
const axios = require("axios");

// read data from JSON file
const movies = require("./MovieData/data.json");

const KEY = "35024a323cf49dc7c1418e232abcf0ef";

// initializing the server
const app = express();

app.get('/', moviesHandler);
app.get('/favorite', favoriteHandler);
app.get('/trending', trendingHandler);
app.get('/searchMovies', searchHandler);

// this is two other get from my own 
app.get('/topRated', topRatedHandler);
app.get("/popular", popularMoviesHandler);


// error and not found handler 
app.use("*", notFoundHandler);
app.use(errorHandler);






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
  


function Movie(title, poster_path, overview){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

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

app.listen(3001, () => {
    console.log("Listen on 3001");
});

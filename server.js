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
function Movie(title, poster_path, overview){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

app.listen(3000, () => {
    console.log("Listen on 3000");
});

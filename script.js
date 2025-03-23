document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:3000/films";

    const filmsList = document.getElementById("films");
    const moviePoster = document.getElementById("movie-poster");
    const movieTitle = document.getElementById("movie-title");
    const movieDescription = document.getElementById("movie-description");
    const movieShowtime = document.getElementById("movie-showtime");
    const movieRuntime = document.getElementById("movie-runtime");
    const availableTickets = document.getElementById("available-tickets");
    const buyTicketButton = document.getElementById("buy-ticket");
    const deleteMovieButton = document.getElementById("delete-movie");

    let currentMovie = null;

    //  Fetch and display movies
    function loadMovies() {
        fetch(API_URL)
            .then(response => response.json())
            .then(movies => {
                displayMovieList(movies);
                if (movies.length > 0) {
                    displayMovieDetails(movies[0]); 
                }
            })
            .catch(error => console.log("Error fetching movies:", error));
    }
    


    // Display movie list
    function displayMovieList(movies) {
        filmsList.innerHTML = "";
        movies.forEach(function (movie) {
            const listItem = document.createElement("li");
            listItem.textContent = movie.title;
            listItem.classList.add("film");
            listItem.dataset.id = movie.id;

            listItem.addEventListener("click", function () {
                displayMovieDetails(movie);
            });

            filmsList.appendChild(listItem);
        });
    }
    

    //  Display movie details
    function displayMovieDetails(movie) {
        currentMovie = movie;
        moviePoster.src = movie.poster;
        movieTitle.textContent = movie.title;
        movieDescription.textContent = movie.description;
        movieShowtime.textContent = movie.showtime;
        movieRuntime.textContent = movie.runtime + " min";
        updateTickets(movie.capacity - movie.tickets_sold);
    }

    // Update available tickets
    function updateTickets(ticketsLeft) {
        availableTickets.textContent = ticketsLeft;
        buyTicketButton.disabled = ticketsLeft <= 0;
        buyTicketButton.textContent = ticketsLeft > 0 ? "Buy Ticket" : "Sold Out";
    }

    // Buy a ticket
    buyTicketButton.addEventListener("click", function () {
        if (!currentMovie) return;

        let remainingTickets = parseInt(availableTickets.textContent);
        if (remainingTickets > 0) {
            remainingTickets--;
            currentMovie.tickets_sold++;

            updateTickets(remainingTickets);

            fetch(API_URL + "/" + currentMovie.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tickets_sold: currentMovie.tickets_sold })
            })
            .then(response => response.json())
            .then(updatedMovie => console.log("Updated movie:", updatedMovie))
            .catch(error => console.log("Error updating tickets:", error));
        }
    });

    //  Remove a movie
    deleteMovieButton.addEventListener("click", function () {
        if (!currentMovie) return;

        fetch(API_URL + "/" + currentMovie.id, { method: "DELETE" })
            .then(function () {
                document.querySelector(`[data-id='${currentMovie.id}']`).remove();
                clearMovieDetails();
                currentMovie = null;
                console.log("Movie deleted successfully");
            })
            .catch(error => console.log("Error deleting movie:", error));
    });

    // Clear deleting a movie
    function clearMovieDetails() {
        moviePoster.src = "";
        movieTitle.textContent = "";
        movieDescription.textContent = "";
        movieShowtime.textContent = "";
        movieRuntime.textContent = "";
        availableTickets.textContent = "";
    }

    //Bonus
    function addMovie(movie) {
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movie)
        })
        .then(response => response.json())
        .then(function (newMovie) {
            displayMovieList([...document.querySelectorAll(".film")].map(film => ({
                id: film.dataset.id,
                title: film.textContent
            })).concat(newMovie));
            console.log("Movie added:", newMovie);
        })
        .catch(error => console.log("Error adding movie:", error));
    }

    // Load movies when page loads
    loadMovies();
});

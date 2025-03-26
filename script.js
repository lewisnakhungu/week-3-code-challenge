document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://api.jsonbin.io/v3/b/67e3cde28561e97a50f32d33/latest"; 
    const API_KEY = "YOUR_JSONBIN_API_KEY"; // Replace with your actual API key

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

    function loadMovies() {
        fetch(API_URL, {
            method: "GET",
            headers: { 
                "X-Master-Key": API_KEY, 
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Data:", data); 

            if (data && data.record && data.record.films) {
                const movies = data.record.films;  
                displayMovieList(movies);
                displayMovieDetails(movies[0]); 
            } else {
                console.error("Unexpected data format:", data);
            }
        })
        .catch(error => console.error("Error fetching movies:", error));
    }

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

    function displayMovieDetails(movie) {
        currentMovie = movie;
        moviePoster.src = movie.poster;
        movieTitle.textContent = movie.title;
        movieDescription.textContent = movie.description;
        movieShowtime.textContent = movie.showtime;
        movieRuntime.textContent = movie.runtime + " min";
        updateTickets(movie.capacity - movie.tickets_sold);
    }

    function updateTickets(ticketsLeft) {
        availableTickets.textContent = ticketsLeft;
        buyTicketButton.disabled = ticketsLeft <= 0;
        buyTicketButton.textContent = ticketsLeft > 0 ? "Buy Ticket" : "Sold Out";
    }

    buyTicketButton.addEventListener("click", function () {
        if (!currentMovie) return;

        let remainingTickets = parseInt(availableTickets.textContent);
        if (remainingTickets > 0) {
            remainingTickets--;
            currentMovie.tickets_sold++;

            updateTickets(remainingTickets);

            fetch(API_URL + "/" + currentMovie.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
                body: JSON.stringify({ tickets_sold: currentMovie.tickets_sold })
            })
            .then(response => response.json())
            .then(updatedMovie => console.log("Updated movie:", updatedMovie))
            .catch(error => console.log("Error updating tickets:", error));
        }
    });

    deleteMovieButton.addEventListener("click", function () {
        if (!currentMovie) return;

        fetch(API_URL + "/" + currentMovie.id, { 
            method: "DELETE",
            headers: { "X-Master-Key": API_KEY }
        })
        .then(() => {
            document.querySelector(`[data-id='${currentMovie.id}']`).remove();
            clearMovieDetails();
            currentMovie = null;
            console.log("Movie deleted successfully");
        })
        .catch(error => console.log("Error deleting movie:", error));
    });

    function clearMovieDetails() {
        moviePoster.src = "";
        movieTitle.textContent = "";
        movieDescription.textContent = "";
        movieShowtime.textContent = "";
        movieRuntime.textContent = "";
        availableTickets.textContent = "";
    }

    loadMovies();
});

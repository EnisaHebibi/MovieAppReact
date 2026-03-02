import React, { useState, useEffect, useRef } from "react";
import Search from "./components/Search";
import SpinnerEmpty from "./components/SpinnerEmpty";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_TOKEN;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity"); // popularity | rating | date
  const trackedSearchesRef = useRef(new Set());

  useDebounce(() => setDebounceSearchTerm(searchTerm), 700, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const sortMap = {
        popularity: "popularity.desc",
        rating: "vote_average.desc",
        date: "primary_release_date.desc",
      };

      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?include_adult=false&language=en-US&page=${page}&sort_by=${sortMap[sortBy]}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList((prev) =>
        page === 1 ? data.results : [...prev, ...data.results],
      );
    } catch (error) {
      console.error(`Error fetching movies:${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  // Track search term
  useEffect(() => {
    const trackSearch = async () => {
      const term = debounceSearchTerm.trim().toLowerCase();
      if (!term) return;

      try {
        // always update database
        await updateSearchCount(term);
      } catch (err) {
        console.error("Failed to track search", err);
      }
    };

    trackSearch();
  }, [debounceSearchTerm]);

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [debounceSearchTerm, sortBy]);

  // Fetch movies whenever search, sort, or page changes
  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm, sortBy, page]);

  useEffect(() => {
    setTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero " />

          <h1>
            Find <span className="text-gradient">Movies </span>You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <h2 className="mb-2">All Movies</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="mb-4 rounded border p-2 text-gray-400 ml-0 w-30"
        >
          <option value="popularity">Popular</option>
          <option value="rating">Top Rated</option>
          <option value="date">Newest</option>
        </select>
        <section className="all-movies">
          {isLoading ? (
            <SpinnerEmpty />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="mt-6 rounded bg-transparent px-6 py-2 font-semibold w-1xl m-auto text-white cursor-pointer "
        >
          Load More
        </button>

        <h3 className="text-white m-auto mt-6">
          You have searched for: " {searchTerm} "
        </h3>
      </div>
    </main>
  );
};

export default App;

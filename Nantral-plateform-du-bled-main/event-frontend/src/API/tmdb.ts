const TMDB_API_KEY = 'bfec91704e70de1230945d8064ed02f3';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export async function searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=${page}`
  );
  if (!response.ok) throw new Error('Failed to search movies');
  return await response.json();
}

export async function getPopularMovies(page: number = 2): Promise<TMDBSearchResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`
  );
  if (!response.ok) throw new Error('Failed to fetch popular movies');
  return await response.json();
}

export function getImageUrl(path: string | null, size: 'w200' | 'w500' | 'original' = 'w500'): string {
  if (!path) return '/placeholder-movie.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function isApiKeyConfigured(): boolean {
  return TMDB_API_KEY.length > 0 && TMDB_API_KEY !== 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZmVjOTE3MDRlNzBkZTEyMzA5NDVkODA2NGVkMDJmMyIsIm5iZiI6MTc2OTU5NTEwOC41NDgsInN1YiI6IjY5NzllMGU0MzQzYjVjN2JmOGNkYmJhYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xaJA9MZAAl7_rUrvDAypW-T16KB2fSMsk9Hqfb7p4dg';
}

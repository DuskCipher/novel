// Use internal proxy API path
const BASE_URL = "/api";

const fetchAnimeApi = async (path: string) => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: 600 },
    });
    
    if (!res.ok) {
        throw new Error(`API returned status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Anime fetchApi error", error);
    throw error;
  }
};

export const getAnimeHome = async () => {
  return await fetchAnimeApi("/anime/home");
};

export const getAnimeSchedule = async () => {
  return await fetchAnimeApi("/anime/schedule");
};

export const getAnimeDetail = async (slug: string) => {
  return await fetchAnimeApi(`/anime/anime/${slug}`);
};

export const getAnimeCompleted = async (page: number = 1) => {
  return await fetchAnimeApi(`/anime/complete-anime?page=${page}`);
};

export const getAnimeOngoing = async (page: number = 1) => {
  return await fetchAnimeApi(`/anime/ongoing-anime?page=${page}`);
};

export const getAnimeGenres = async () => {
  return await fetchAnimeApi("/anime/genre");
};

export const getAnimeByGenre = async (slug: string, page: number = 1) => {
  return await fetchAnimeApi(`/anime/genre/${slug}?page=${page}`);
};

export const getAnimeEpisode = async (slug: string) => {
  return await fetchAnimeApi(`/anime/episode/${slug}`);
};

export const searchAnime = async (keyword: string) => {
  return await fetchAnimeApi(`/anime/search/${encodeURIComponent(keyword)}`);
};

export const getAnimeBatch = async (slug: string) => {
  return await fetchAnimeApi(`/anime/batch/${slug}`);
};

export const getAnimeServer = async (serverId: string) => {
  return await fetchAnimeApi(`/anime/server/${serverId}`);
};

export const getAllAnime = async () => {
  return await fetchAnimeApi("/anime/unlimited");
};

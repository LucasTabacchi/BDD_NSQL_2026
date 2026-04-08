import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

export const getGroups = () => API.get('/groups');
export const getPlaces = (group) => API.get(`/places/${group}`);
export const addPlace = (group, place) => API.post(`/places/${group}`, place);
export const deletePlace = (group, name) => API.delete(`/places/${group}/${encodeURIComponent(name)}`);
export const getNearby = (group, lat, lon, radius = 5) =>
  API.post(`/nearby/${group}?radius=${radius}`, { latitude: lat, longitude: lon });
export const getDistance = (group, lat, lon, placeName) =>
  API.post(`/distance/${group}?place_name=${encodeURIComponent(placeName)}`, { latitude: lat, longitude: lon });

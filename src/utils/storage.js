// src/utils/storage.js
const STORAGE_KEY = "pascali_menu";

export const getMenu = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const setMenu = (menu) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
};

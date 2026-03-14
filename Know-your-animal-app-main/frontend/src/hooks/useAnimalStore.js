import { useState, useEffect } from "react";
import { animalData as staticAnimalData } from "@/data/animalDiseases";

const STORAGE_KEY = "kya_animal_store";

const defaultAnimalsGrid = [
  { name: "cow",     image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=400&fit=crop" },
  { name: "goat",    image: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=400&h=400&fit=crop" },
  { name: "dog",     image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop" },
  { name: "cat",     image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop" },
  { name: "chicken", image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=400&fit=crop" },
  { name: "duck",    image: "https://images.unsplash.com/photo-1459682687441-7761439a709d?w=400&h=400&fit=crop" },
  { name: "rabbit",  image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop" },
  { name: "parrot",  image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop" },
  { name: "pigeon",  image: "https://images.unsplash.com/photo-1555169062-013468b47731?w=400&h=400&fit=crop" },
];

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getInitialStore() {
  const saved = loadStore();
  if (saved) return saved;
  // Build initial from static data
  const diseases = {};
  Object.keys(staticAnimalData).forEach((key) => {
    diseases[key] = staticAnimalData[key].diseases.map((d) => ({ ...d }));
  });
  return { grid: defaultAnimalsGrid, diseases };
}

export function useAnimalStore() {
  const [store, setStore] = useState(getInitialStore);

  const persist = (next) => {
    setStore(next);
    saveStore(next);
  };

  // ── Grid (Animals page) ──────────────────────────────────────────────────
  const addAnimalToGrid = (name, image) => {
    if (store.grid.find((a) => a.name === name)) return;
    persist({ ...store, grid: [...store.grid, { name, image }] });
  };

  const removeAnimalFromGrid = (name) => {
    persist({ ...store, grid: store.grid.filter((a) => a.name !== name) });
  };

  // ── Diseases (AnimalDetail page) ─────────────────────────────────────────
  const getDiseases = (animalName) => {
    if (store.diseases[animalName]) return store.diseases[animalName];
    // Fall back to static
    return staticAnimalData[animalName]?.diseases || [];
  };

  const addDisease = (animalName, disease) => {
    const existing = getDiseases(animalName);
    const maxId = existing.reduce((m, d) => Math.max(m, d.id), 0);
    const newDisease = { ...disease, id: maxId + 1 };
    persist({
      ...store,
      diseases: { ...store.diseases, [animalName]: [...existing, newDisease] },
    });
  };

  const deleteDisease = (animalName, diseaseId) => {
    const existing = getDiseases(animalName);
    persist({
      ...store,
      diseases: {
        ...store.diseases,
        [animalName]: existing.filter((d) => d.id !== diseaseId),
      },
    });
  };

  return {
    grid: store.grid,
    getDiseases,
    addAnimalToGrid,
    removeAnimalFromGrid,
    addDisease,
    deleteDisease,
    allAvailableAnimals: Object.keys(staticAnimalData),
    staticAnimalData,
  };
}

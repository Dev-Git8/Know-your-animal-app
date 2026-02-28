import api from "./authApi";

// ── Public Animal API ────────────────────────────────────────────────

export const getAllAnimals = async () => {
    const { data } = await api.get("/animals");
    return data;
};

export const getAnimalBySlug = async (slug) => {
    const { data } = await api.get(`/animals/${slug}`);
    return data;
};

// ── Admin Animal API ─────────────────────────────────────────────────

export const createAnimal = async (animalData) => {
    const { data } = await api.post("/animals", animalData);
    return data;
};

export const updateAnimal = async (slug, animalData) => {
    const { data } = await api.put(`/animals/${slug}`, animalData);
    return data;
};

export const deleteAnimal = async (slug) => {
    const { data } = await api.delete(`/animals/${slug}`);
    return data;
};

export const addDisease = async (slug, diseaseData) => {
    const { data } = await api.post(`/animals/${slug}/diseases`, diseaseData);
    return data;
};

export const deleteDiseaseApi = async (slug, diseaseId) => {
    const { data } = await api.delete(`/animals/${slug}/diseases/${diseaseId}`);
    return data;
};

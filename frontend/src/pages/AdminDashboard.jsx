import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Plus, Trash2, ChevronDown, ChevronUp, LogOut,
    Shield, Loader2, AlertTriangle
} from "lucide-react";
import {
    getAllAnimals, createAnimal, deleteAnimal,
    addDisease, deleteDiseaseApi, getAnimalBySlug
} from "@/integrations/animalApi";
import { adminLogout, getAdminProfile } from "@/integrations/authApi";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedAnimal, setExpandedAnimal] = useState(null);
    const [animalDiseases, setAnimalDiseases] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddAnimal, setShowAddAnimal] = useState(false);
    const [animalForm, setAnimalForm] = useState({
        slug: "", name: "", nameHi: "", image: "", description: ""
    });

    const [showAddDisease, setShowAddDisease] = useState(null);
    const [diseaseForm, setDiseaseForm] = useState({
        name: "", nameHi: "", symptoms: "", causes: "", treatment: "", prevention: ""
    });

    useEffect(() => {
        const check = async () => {
            try {
                const data = await getAdminProfile();
                setAdmin(data.user);
            } catch {
                navigate("/admin-login", { replace: true });
            }
        };
        check();
    }, [navigate]);

    useEffect(() => { loadAnimals(); }, []);

    const loadAnimals = async () => {
        try {
            setLoading(true);
            const data = await getAllAnimals();
            setAnimals(data.animals);
        } catch {
            setError("Failed to load animals");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await adminLogout();
        navigate("/admin-login");
    };

    const flash = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(""), 3000);
    };

    const toggleAnimal = async (slug) => {
        if (expandedAnimal === slug) {
            setExpandedAnimal(null);
            setAnimalDiseases([]);
            return;
        }
        try {
            const data = await getAnimalBySlug(slug);
            setAnimalDiseases(data.animal.diseases || []);
            setExpandedAnimal(slug);
        } catch {
            setError("Failed to load animal details");
        }
    };

    const handleAddAnimal = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await createAnimal(animalForm);
            setAnimalForm({ slug: "", name: "", nameHi: "", image: "", description: "" });
            setShowAddAnimal(false);
            flash("Animal added successfully!");
            loadAnimals();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add animal");
        }
    };

    const handleDeleteAnimal = async (slug) => {
        if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) return;
        setError("");
        try {
            await deleteAnimal(slug);
            flash("Animal deleted!");
            if (expandedAnimal === slug) setExpandedAnimal(null);
            loadAnimals();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete animal");
        }
    };

    const handleAddDisease = async (e, slug) => {
        e.preventDefault();
        setError("");
        try {
            const payload = {
                ...diseaseForm,
                symptoms: diseaseForm.symptoms.split(",").map((s) => s.trim()).filter(Boolean),
                prevention: diseaseForm.prevention.split(",").map((s) => s.trim()).filter(Boolean),
            };
            await addDisease(slug, payload);
            setDiseaseForm({ name: "", nameHi: "", symptoms: "", causes: "", treatment: "", prevention: "" });
            setShowAddDisease(null);
            flash("Disease added!");
            const data = await getAnimalBySlug(slug);
            setAnimalDiseases(data.animal.diseases || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add disease");
        }
    };

    const handleDeleteDisease = async (slug, diseaseId) => {
        if (!window.confirm("Delete this disease?")) return;
        setError("");
        try {
            await deleteDiseaseApi(slug, diseaseId);
            flash("Disease deleted!");
            const data = await getAnimalBySlug(slug);
            setAnimalDiseases(data.animal.diseases || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete disease");
        }
    };

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h1 className="font-display text-lg font-bold text-foreground">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:block">{admin.email}</span>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut className="h-4 w-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
                        <button onClick={() => setError("")} className="ml-auto text-xs hover:underline">Dismiss</button>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                        {success}
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold text-foreground">Animals ({animals.length})</h2>
                    <button onClick={() => setShowAddAnimal(!showAddAnimal)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Plus className="h-4 w-4" /> Add Animal
                    </button>
                </div>

                {showAddAnimal && (
                    <form onSubmit={handleAddAnimal} className="mb-6 p-5 bg-card border border-border rounded-xl space-y-3">
                        <h3 className="font-semibold text-foreground text-sm mb-2">New Animal</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input required placeholder="Slug (e.g. cow)" value={animalForm.slug} onChange={(e) => setAnimalForm({ ...animalForm, slug: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                            <input required placeholder="Name (e.g. Cow)" value={animalForm.name} onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                            <input placeholder="Hindi Name (e.g. गाय)" value={animalForm.nameHi} onChange={(e) => setAnimalForm({ ...animalForm, nameHi: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                            <input placeholder="Image URL" value={animalForm.image} onChange={(e) => setAnimalForm({ ...animalForm, image: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                        </div>
                        <textarea placeholder="Description" value={animalForm.description} onChange={(e) => setAnimalForm({ ...animalForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20 resize-none" />
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Save</button>
                            <button type="button" onClick={() => setShowAddAnimal(false)} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80">Cancel</button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {animals.map((animal) => (
                            <div key={animal._id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="flex items-center gap-4 px-4 py-3">
                                    <img src={animal.image} alt={animal.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground text-sm truncate">{animal.name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">/{animal.slug}</p>
                                    </div>
                                    <button onClick={() => toggleAnimal(animal.slug)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                                        {expandedAnimal === animal.slug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                    <button onClick={() => handleDeleteAnimal(animal.slug)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {expandedAnimal === animal.slug && (
                                    <div className="border-t border-border px-4 py-4 bg-muted/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">Diseases ({animalDiseases.length})</span>
                                            <button onClick={() => setShowAddDisease(showAddDisease === animal.slug ? null : animal.slug)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                <Plus className="h-3 w-3" /> Add Disease
                                            </button>
                                        </div>

                                        {showAddDisease === animal.slug && (
                                            <form onSubmit={(e) => handleAddDisease(e, animal.slug)} className="p-4 bg-card border border-border rounded-lg space-y-2">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <input required placeholder="Disease Name" value={diseaseForm.name} onChange={(e) => setDiseaseForm({ ...diseaseForm, name: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                                                    <input placeholder="Hindi Name" value={diseaseForm.nameHi} onChange={(e) => setDiseaseForm({ ...diseaseForm, nameHi: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                                                </div>
                                                <input placeholder="Symptoms (comma-separated)" value={diseaseForm.symptoms} onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                                                <textarea placeholder="Causes" value={diseaseForm.causes} onChange={(e) => setDiseaseForm({ ...diseaseForm, causes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20 resize-none" />
                                                <textarea placeholder="Treatment" value={diseaseForm.treatment} onChange={(e) => setDiseaseForm({ ...diseaseForm, treatment: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20 resize-none" />
                                                <input placeholder="Prevention (comma-separated)" value={diseaseForm.prevention} onChange={(e) => setDiseaseForm({ ...diseaseForm, prevention: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20" />
                                                <div className="flex gap-2">
                                                    <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">Add</button>
                                                    <button type="button" onClick={() => setShowAddDisease(null)} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs">Cancel</button>
                                                </div>
                                            </form>
                                        )}

                                        {animalDiseases.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">No diseases recorded.</p>
                                        ) : (
                                            animalDiseases.map((disease) => (
                                                <div key={disease._id} className="flex items-start justify-between gap-3 p-3 bg-card border border-border rounded-lg">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-foreground">{disease.name}</p>
                                                        {disease.nameHi && <p className="text-xs text-muted-foreground">{disease.nameHi}</p>}
                                                        <p className="text-xs text-muted-foreground mt-1">{disease.symptoms?.join(", ")}</p>
                                                    </div>
                                                    <button onClick={() => handleDeleteDisease(animal.slug, disease._id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

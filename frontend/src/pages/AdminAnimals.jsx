import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  Shield, LogOut, ArrowLeft, PawPrint, Trash2, Plus, ChevronDown, ChevronUp, X
} from "lucide-react";
import { useAnimalStore } from "@/hooks/useAnimalStore";

const emptyDisease = {
  name: "", nameHi: "", causes: "", treatment: "",
  symptoms: [""], prevention: [""],
};

export default function AdminAnimals() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("isAdmin") !== "true") navigate("/admin/login");
  }, [navigate]);

  const {
    grid, getDiseases, addAnimalToGrid, removeAnimalFromGrid,
    addDisease, deleteDisease, allAvailableAnimals, staticAnimalData,
  } = useAnimalStore();

  const [expandedAnimal, setExpandedAnimal] = useState(null);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showAddDisease, setShowAddDisease] = useState(null); // animal name
  const [newAnimalKey, setNewAnimalKey] = useState("");
  const [newAnimalImage, setNewAnimalImage] = useState("");
  const [diseaseForm, setDiseaseForm] = useState(emptyDisease);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleAnimal = (name) => setExpandedAnimal(expandedAnimal === name ? null : name);

  const handleAddAnimal = (e) => {
    e.preventDefault();
    const key = newAnimalKey.trim().toLowerCase();
    if (!key) return;
    const img = newAnimalImage.trim() ||
      staticAnimalData[key]?.image ||
      `https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop`;
    addAnimalToGrid(key, img);
    setNewAnimalKey("");
    setNewAnimalImage("");
    setShowAddAnimal(false);
  };

  const handleArrayField = (field, index, value) => {
    const arr = [...diseaseForm[field]];
    arr[index] = value;
    setDiseaseForm({ ...diseaseForm, [field]: arr });
  };

  const addArrayItem = (field) =>
    setDiseaseForm({ ...diseaseForm, [field]: [...diseaseForm[field], ""] });

  const removeArrayItem = (field, index) =>
    setDiseaseForm({ ...diseaseForm, [field]: diseaseForm[field].filter((_, i) => i !== index) });

  const handleAddDisease = (e) => {
    e.preventDefault();
    const clean = {
      ...diseaseForm,
      symptoms: diseaseForm.symptoms.filter(Boolean),
      prevention: diseaseForm.prevention.filter(Boolean),
    };
    addDisease(showAddDisease, clean);
    setDiseaseForm(emptyDisease);
    setShowAddDisease(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Topbar */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
            <Shield className="h-4 w-4 text-background" />
          </div>
          <span className="font-display font-bold text-foreground text-lg">Admin Panel</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Know Your Animal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <button onClick={() => { sessionStorage.removeItem("isAdmin"); navigate("/admin/login"); }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
              <PawPrint className="h-6 w-6" /> Manage Animals
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Add or remove animals from the Animals page and manage their disease details.
            </p>
          </div>
          <button
            onClick={() => setShowAddAnimal(!showAddAnimal)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Animal
          </button>
        </div>

        {/* Add Animal Form */}
        {showAddAnimal && (
          <form onSubmit={handleAddAnimal} className="bg-card border border-border rounded-xl p-5 mb-6 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Add Animal to Grid</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Animal Key (e.g. buffalo)</label>
                <select
                  value={newAnimalKey}
                  onChange={(e) => setNewAnimalKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">— Select animal —</option>
                  {allAvailableAnimals
                    .filter((a) => !grid.find((g) => g.name === a))
                    .map((a) => (
                      <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Image URL (optional)</label>
                <input
                  type="url"
                  value={newAnimalImage}
                  onChange={(e) => setNewAnimalImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                Add
              </button>
              <button type="button" onClick={() => setShowAddAnimal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Animal List */}
        <div className="space-y-3">
          {grid.map(({ name, image }) => {
            const diseases = getDiseases(name);
            const isOpen = expandedAnimal === name;
            const displayName = name.charAt(0).toUpperCase() + name.slice(1);
            return (
              <div key={name} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Animal row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <button
                    onClick={() => toggleAnimal(name)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <img src={image} alt={displayName} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{diseases.length} disease{diseases.length !== 1 ? "s" : ""}</p>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />}
                  </button>
                  <button
                    onClick={() => removeAnimalFromGrid(name)}
                    className="ml-4 p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove from Animals page"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Diseases section */}
                {isOpen && (
                  <div className="border-t border-border px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Diseases</p>
                      <button
                        onClick={() => { setShowAddDisease(name); setDiseaseForm(emptyDisease); }}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
                      >
                        <Plus className="h-3 w-3" /> Add Disease
                      </button>
                    </div>

                    {diseases.length === 0 && (
                      <p className="text-sm text-muted-foreground/60 italic">No diseases added yet.</p>
                    )}

                    {diseases.map((d) => (
                      <div key={d.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium text-foreground">{d.name}</p>
                          {d.nameHi && <p className="text-xs text-muted-foreground">{d.nameHi}</p>}
                        </div>
                        <button
                          onClick={() => deleteDisease(name, d.id)}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                          title="Delete disease"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add Disease inline form */}
                    {showAddDisease === name && (
                      <AddDiseaseForm
                        form={diseaseForm}
                        setForm={setDiseaseForm}
                        onSubmit={handleAddDisease}
                        onCancel={() => setShowAddDisease(null)}
                        handleArrayField={handleArrayField}
                        addArrayItem={addArrayItem}
                        removeArrayItem={removeArrayItem}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function AddDiseaseForm({ form, setForm, onSubmit, onCancel, handleArrayField, addArrayItem, removeArrayItem }) {
  return (
    <form onSubmit={onSubmit} className="border border-border rounded-xl p-4 space-y-4 bg-background mt-2">
      <h4 className="font-semibold text-foreground text-sm">New Disease</h4>

      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Disease Name (EN)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Disease Name (HI)" value={form.nameHi} onChange={(v) => setForm({ ...form, nameHi: v })} />
      </div>

      <Field label="Causes" value={form.causes} onChange={(v) => setForm({ ...form, causes: v })} textarea required />
      <Field label="Treatment" value={form.treatment} onChange={(v) => setForm({ ...form, treatment: v })} textarea required />

      {/* Symptoms */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block font-medium">Symptoms</label>
        <div className="space-y-2">
          {form.symptoms.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s}
                onChange={(e) => handleArrayField("symptoms", i, e.target.value)}
                placeholder={`Symptom ${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
              {form.symptoms.length > 1 && (
                <button type="button" onClick={() => removeArrayItem("symptoms", i)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("symptoms")}
            className="text-xs text-primary hover:underline">+ Add symptom</button>
        </div>
      </div>

      {/* Prevention */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block font-medium">Prevention Tips</label>
        <div className="space-y-2">
          {form.prevention.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={p}
                onChange={(e) => handleArrayField("prevention", i, e.target.value)}
                placeholder={`Tip ${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
              {form.prevention.length > 1 && (
                <button type="button" onClick={() => removeArrayItem("prevention", i)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("prevention")}
            className="text-xs text-primary hover:underline">+ Add tip</button>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
          Save Disease
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, textarea, required }) {
  const cls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring/20";
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block font-medium">{label}</label>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} rows={3} className={cls} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} required={required} className={cls} />
      }
    </div>
  );
}

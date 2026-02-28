// ── Seed script: import hardcoded animal data into MongoDB ───────────
// Usage: node src/utils/seedAnimals.js

require("dotenv").config();
const mongoose = require("mongoose");
const Animal = require("../models/animal.model");

const animalData = {
    cow: {
        name: "Cow", nameHi: "गाय",
        image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&h=400&fit=crop",
        description: "Cows are domesticated livestock known for milk production and are sacred in many Indian cultures.",
        diseases: [
            { name: "Foot and Mouth Disease (FMD)", nameHi: "खुरपका-मुंहपका रोग", symptoms: ["Fever", "Blisters on mouth, tongue, and hooves", "Excessive drooling", "Lameness", "Reduced milk production"], causes: "Caused by a highly contagious virus that spreads through direct contact with infected animals or contaminated objects.", treatment: "No specific cure; supportive care includes cleaning wounds, applying antiseptics, and providing soft food. Vaccination is key for prevention.", prevention: ["Regular vaccination", "Quarantine infected animals", "Maintain hygiene", "Avoid contact with infected herds"] },
            { name: "Mastitis", nameHi: "थनैला रोग", symptoms: ["Swollen udder", "Hot and painful teats", "Clotted or watery milk", "Fever", "Loss of appetite"], causes: "Bacterial infection of the udder, often due to poor milking hygiene or udder injuries.", treatment: "Antibiotics as prescribed by a veterinarian, warm compresses, frequent milking to remove infected milk.", prevention: ["Proper milking hygiene", "Regular teat dipping", "Clean bedding", "Prompt treatment of udder injuries"] },
            { name: "Bloat", nameHi: "अफारा", symptoms: ["Distended left abdomen", "Difficulty breathing", "Restlessness", "Reluctance to move", "Groaning"], causes: "Excessive gas accumulation in the rumen due to eating too much green fodder or legumes.", treatment: "Anti-foaming agents, stomach tube insertion, in severe cases trocarization by a vet.", prevention: ["Gradual introduction to new feed", "Avoid wet or frosted fodder", "Feed dry hay before grazing"] }
        ]
    },
    goat: {
        name: "Goat", nameHi: "बकरी",
        image: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&h=400&fit=crop",
        description: "Goats are versatile animals raised for milk, meat, and fiber across India.",
        diseases: [
            { name: "Peste des Petits Ruminants (PPR)", nameHi: "बकरी प्लेग", symptoms: ["High fever", "Discharge from eyes and nose", "Mouth ulcers", "Diarrhea", "Difficulty breathing"], causes: "Highly contagious viral disease spread through direct contact or respiratory secretions.", treatment: "No specific treatment; supportive care with fluids, antibiotics for secondary infections.", prevention: ["Annual PPR vaccination", "Quarantine new animals", "Avoid contact with infected flocks"] },
            { name: "Goat Pox", nameHi: "बकरी चेचक", symptoms: ["Fever", "Skin nodules and scabs", "Swollen lymph nodes", "Nasal discharge", "Loss of appetite"], causes: "Viral disease spread through direct contact or insect bites.", treatment: "Supportive care, wound treatment with antiseptics, antibiotics for secondary infections.", prevention: ["Vaccination", "Vector control", "Isolation of infected animals"] }
        ]
    },
    dog: {
        name: "Dog", nameHi: "कुत्ता",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop",
        description: "Dogs are popular companion animals and also serve as guard animals in rural India.",
        diseases: [
            { name: "Rabies", nameHi: "रेबीज / जलांतक", symptoms: ["Behavioral changes", "Excessive drooling", "Aggression or unusual friendliness", "Paralysis", "Fear of water"], causes: "Viral disease transmitted through bites of infected animals.", treatment: "No cure once symptoms appear. Prevention through vaccination is essential.", prevention: ["Annual rabies vaccination", "Avoid contact with stray animals", "Post-exposure prophylaxis if bitten"] },
            { name: "Canine Distemper", nameHi: "कुत्ते का डिस्टेंपर", symptoms: ["Fever", "Nasal and eye discharge", "Coughing", "Vomiting and diarrhea", "Seizures"], causes: "Highly contagious virus spread through respiratory secretions.", treatment: "Supportive care with fluids, antibiotics for secondary infections, anticonvulsants.", prevention: ["Puppy vaccination series", "Annual boosters", "Avoid contact with sick dogs"] },
            { name: "Tick Fever (Babesiosis)", nameHi: "टिक बुखार", symptoms: ["High fever", "Pale gums", "Dark urine", "Lethargy", "Loss of appetite"], causes: "Parasitic infection transmitted by tick bites.", treatment: "Anti-parasitic drugs (diminazene, imidocarb), blood transfusion in severe cases.", prevention: ["Regular tick prevention", "Check for ticks daily", "Keep environment clean"] }
        ]
    },
    cat: {
        name: "Cat", nameHi: "बिल्ली",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop",
        description: "Cats are popular pets known for their independence and ability to control rodent populations.",
        diseases: [
            { name: "Feline Panleukopenia", nameHi: "बिल्ली का पैनल्यूकोपेनिया", symptoms: ["Severe vomiting", "Bloody diarrhea", "High fever", "Dehydration", "Depression"], causes: "Highly contagious parvovirus spread through contact with infected cats or feces.", treatment: "Aggressive fluid therapy, anti-nausea medication, antibiotics for secondary infections.", prevention: ["Vaccination as kitten", "Annual boosters", "Quarantine infected cats"] },
            { name: "Upper Respiratory Infection", nameHi: "श्वसन संक्रमण", symptoms: ["Sneezing", "Runny nose and eyes", "Fever", "Loss of appetite", "Mouth ulcers"], causes: "Various viruses (herpesvirus, calicivirus) and bacteria spread through direct contact.", treatment: "Supportive care, steam therapy, eye drops, antibiotics if bacterial.", prevention: ["Vaccination", "Good ventilation", "Reduce stress", "Isolate sick cats"] }
        ]
    },
    chicken: {
        name: "Chicken", nameHi: "मुर्गी",
        image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=400&fit=crop",
        description: "Chickens are the most common poultry raised for eggs and meat in India.",
        diseases: [
            { name: "Newcastle Disease", nameHi: "रानीखेत रोग", symptoms: ["Respiratory distress", "Greenish diarrhea", "Twisted neck", "Paralysis", "Sudden death"], causes: "Highly contagious virus spread through respiratory secretions and feces.", treatment: "No treatment; cull infected birds. Supportive care may help mild cases.", prevention: ["Regular vaccination", "Biosecurity measures", "Quarantine new birds"] },
            { name: "Fowl Pox", nameHi: "मुर्गी चेचक", symptoms: ["Wart-like lesions on comb and wattles", "Lesions in mouth and throat", "Reduced egg production"], causes: "Viral disease spread by mosquitoes and direct contact.", treatment: "No specific treatment; supportive care, remove scabs with iodine.", prevention: ["Vaccination", "Mosquito control", "Isolate infected birds"] }
        ]
    },
    duck: {
        name: "Duck", nameHi: "बत्तख",
        image: "https://images.unsplash.com/photo-1459682687441-7761439a709d?w=800&h=400&fit=crop",
        description: "Ducks are raised for eggs, meat, and pest control in rice paddies.",
        diseases: [
            { name: "Duck Plague", nameHi: "बत्तख प्लेग", symptoms: ["Sudden death", "Bloody diarrhea", "Nasal discharge", "Swollen head", "Paralysis"], causes: "Highly contagious herpesvirus spread through direct contact and water.", treatment: "No specific treatment; supportive care for mild cases.", prevention: ["Vaccination", "Clean water sources", "Quarantine new ducks"] },
            { name: "Duck Viral Hepatitis", nameHi: "बत्तख हेपेटाइटिस", symptoms: ["Sudden death in ducklings", "Paddling movements", "Enlarged liver", "Lethargy"], causes: "Viral disease affecting young ducks, spread through feces.", treatment: "Antiserum if available; mostly supportive care.", prevention: ["Vaccinate breeding ducks", "Good hygiene", "Isolate sick birds"] }
        ]
    },
    rabbit: {
        name: "Rabbit", nameHi: "खरगोश",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&h=400&fit=crop",
        description: "Rabbits are raised for meat, fur, and as pets across India.",
        diseases: [
            { name: "Myxomatosis", nameHi: "मिक्सोमैटोसिस", symptoms: ["Swollen eyes and genitals", "Fever", "Loss of appetite", "Skin tumors", "Difficulty breathing"], causes: "Viral disease spread by mosquitoes and fleas.", treatment: "No specific treatment; supportive care, often fatal.", prevention: ["Vaccination where available", "Insect control", "Quarantine infected rabbits"] },
            { name: "Snuffles", nameHi: "सर्दी-जुकाम", symptoms: ["Sneezing", "White nasal discharge", "Matted fur on paws", "Eye discharge", "Head tilt"], causes: "Bacterial infection (Pasteurella multocida) triggered by stress or poor conditions.", treatment: "Antibiotics, clean environment, reduce stress.", prevention: ["Good ventilation", "Clean cages", "Reduce stress", "Quarantine sick rabbits"] }
        ]
    },
    parrot: {
        name: "Parrot", nameHi: "तोता",
        image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=400&fit=crop",
        description: "Parrots are popular pet birds known for their intelligence and ability to mimic speech.",
        diseases: [
            { name: "Psittacosis", nameHi: "तोता बुखार", symptoms: ["Ruffled feathers", "Lethargy", "Eye and nasal discharge", "Green droppings", "Weight loss"], causes: "Bacterial infection (Chlamydia psittaci) that can spread to humans.", treatment: "Doxycycline antibiotics for 45 days, supportive care.", prevention: ["Quarantine new birds", "Good hygiene", "Proper ventilation"] },
            { name: "Feather Plucking", nameHi: "पंख नोचना", symptoms: ["Self-inflicted feather loss", "Bare patches", "Skin damage", "Behavioral changes"], causes: "Stress, boredom, nutritional deficiencies, or underlying illness.", treatment: "Environmental enrichment, diet improvement, treat underlying cause.", prevention: ["Adequate stimulation", "Social interaction", "Balanced diet", "Regular health checks"] }
        ]
    },
    pigeon: {
        name: "Pigeon", nameHi: "कबूतर",
        image: "https://images.unsplash.com/photo-1555169062-013468b47731?w=800&h=400&fit=crop",
        description: "Pigeons are raised for sport, show, and meat, with a rich history in Indian culture.",
        diseases: [
            { name: "Pigeon Paramyxovirus (PMV)", nameHi: "कबूतर पीएमवी", symptoms: ["Twisted neck", "Circling", "Paralysis", "Green watery droppings", "Inability to fly"], causes: "Viral disease related to Newcastle disease, spread through droppings.", treatment: "No specific treatment; supportive care, most birds recover with nursing.", prevention: ["Vaccination", "Quarantine new birds", "Good hygiene"] },
            { name: "Canker (Trichomoniasis)", nameHi: "कैंकर", symptoms: ["Yellow cheesy deposits in mouth", "Difficulty swallowing", "Weight loss", "Regurgitation"], causes: "Protozoan parasite (Trichomonas gallinae) spread through contaminated water.", treatment: "Metronidazole or ronidazole, clean water sources.", prevention: ["Clean drinking water", "Regular medication", "Avoid overcrowding"] }
        ]
    }
};

async function seedAnimals() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected");

        let created = 0;
        let skipped = 0;

        for (const [slug, data] of Object.entries(animalData)) {
            const exists = await Animal.findOne({ slug });
            if (exists) {
                console.log(`  Skipped: ${slug} (already exists)`);
                skipped++;
                continue;
            }
            await Animal.create({ slug, ...data });
            console.log(`  Created: ${slug}`);
            created++;
        }

        console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
    } catch (err) {
        console.error("Seed error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedAnimals();

export const animalData = {
  cow: {
    name: "Cow",
    nameHi: "गाय",
    image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&h=400&fit=crop",
    description: "Cows are domesticated livestock known for milk production and are sacred in many Indian cultures.",
    diseases: [
      {
        id: 1,
        name: "Foot and Mouth Disease (FMD)",
        nameHi: "खुरपका-मुंहपका रोग",
        symptoms: ["Fever", "Blisters on mouth, tongue, and hooves", "Excessive drooling", "Lameness", "Reduced milk production"],
        causes: "Caused by a highly contagious virus that spreads through direct contact with infected animals or contaminated objects.",
        treatment: "No specific cure; supportive care includes cleaning wounds, applying antiseptics, and providing soft food. Vaccination is key for prevention.",
        prevention: ["Regular vaccination", "Quarantine infected animals", "Maintain hygiene", "Avoid contact with infected herds"]
      },
      {
        id: 2,
        name: "Mastitis",
        nameHi: "थनैला रोग",
        symptoms: ["Swollen udder", "Hot and painful teats", "Clotted or watery milk", "Fever", "Loss of appetite"],
        causes: "Bacterial infection of the udder, often due to poor milking hygiene or udder injuries.",
        treatment: "Antibiotics as prescribed by a veterinarian, warm compresses, frequent milking to remove infected milk.",
        prevention: ["Proper milking hygiene", "Regular teat dipping", "Clean bedding", "Prompt treatment of udder injuries"]
      },
      {
        id: 3,
        name: "Bloat",
        nameHi: "अफारा",
        symptoms: ["Distended left abdomen", "Difficulty breathing", "Restlessness", "Reluctance to move", "Groaning"],
        causes: "Excessive gas accumulation in the rumen due to eating too much green fodder or legumes.",
        treatment: "Anti-foaming agents, stomach tube insertion, in severe cases trocarization by a vet.",
        prevention: ["Gradual introduction to new feed", "Avoid wet or frosted fodder", "Feed dry hay before grazing"]
      }
    ]
  },
  buffalo: {
    name: "Buffalo",
    nameHi: "भैंस",
    image: "https://images.unsplash.com/photo-1568708167498-2a22bc97ad69?w=800&h=400&fit=crop",
    description: "Water buffaloes are important dairy animals in India, known for producing rich, creamy milk.",
    diseases: [
      {
        id: 1,
        name: "Hemorrhagic Septicemia",
        nameHi: "गलघोंटू",
        symptoms: ["High fever", "Swelling in throat and neck", "Difficulty breathing", "Salivation", "Sudden death"],
        causes: "Caused by Pasteurella multocida bacteria, often triggered by stress or weather changes.",
        treatment: "Early antibiotic treatment (penicillin, sulfonamides). Often fatal if not treated immediately.",
        prevention: ["Annual vaccination", "Reduce stress during monsoon", "Proper nutrition"]
      },
      {
        id: 2,
        name: "Black Quarter",
        nameHi: "लंगड़ा बुखार",
        symptoms: ["Lameness", "Swelling in hip and shoulder muscles", "Gas under skin (crepitation)", "High fever", "Sudden death"],
        causes: "Caused by Clostridium chauvoei bacteria found in soil, enters through wounds.",
        treatment: "Penicillin antibiotics, surgical drainage of gas. Often fatal if not treated early.",
        prevention: ["Vaccination twice yearly", "Avoid grazing in contaminated areas", "Proper wound care"]
      }
    ]
  },
  goat: {
    name: "Goat",
    nameHi: "बकरी",
    image: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&h=400&fit=crop",
    description: "Goats are versatile animals raised for milk, meat, and fiber across India.",
    diseases: [
      {
        id: 1,
        name: "Peste des Petits Ruminants (PPR)",
        nameHi: "बकरी प्लेग",
        symptoms: ["High fever", "Discharge from eyes and nose", "Mouth ulcers", "Diarrhea", "Difficulty breathing"],
        causes: "Highly contagious viral disease spread through direct contact or respiratory secretions.",
        treatment: "No specific treatment; supportive care with fluids, antibiotics for secondary infections.",
        prevention: ["Annual PPR vaccination", "Quarantine new animals", "Avoid contact with infected flocks"]
      },
      {
        id: 2,
        name: "Goat Pox",
        nameHi: "बकरी चेचक",
        symptoms: ["Fever", "Skin nodules and scabs", "Swollen lymph nodes", "Nasal discharge", "Loss of appetite"],
        causes: "Viral disease spread through direct contact or insect bites.",
        treatment: "Supportive care, wound treatment with antiseptics, antibiotics for secondary infections.",
        prevention: ["Vaccination", "Vector control", "Isolation of infected animals"]
      }
    ]
  },
  sheep: {
    name: "Sheep",
    nameHi: "भेड़",
    image: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&h=400&fit=crop",
    description: "Sheep are raised primarily for wool and meat in many parts of India.",
    diseases: [
      {
        id: 1,
        name: "Blue Tongue",
        nameHi: "नीली जीभ",
        symptoms: ["Fever", "Swollen blue tongue", "Drooling", "Lameness", "Facial swelling"],
        causes: "Viral disease transmitted by Culicoides midges (biting insects).",
        treatment: "No specific treatment; supportive care, soft food, shade from sun.",
        prevention: ["Vaccination in endemic areas", "Insect control", "House animals during peak midge activity"]
      },
      {
        id: 2,
        name: "Foot Rot",
        nameHi: "खुर सड़न",
        symptoms: ["Lameness", "Foul smell from hooves", "Swelling between toes", "Reluctance to walk"],
        causes: "Bacterial infection (Dichelobacter nodosus) in wet, muddy conditions.",
        treatment: "Hoof trimming, foot baths with zinc sulfate or copper sulfate, antibiotics.",
        prevention: ["Dry housing", "Regular hoof trimming", "Foot baths", "Culling chronic carriers"]
      }
    ]
  },
  dog: {
    name: "Dog",
    nameHi: "कुत्ता",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop",
    description: "Dogs are popular companion animals and also serve as guard animals in rural India.",
    diseases: [
      {
        id: 1,
        name: "Rabies",
        nameHi: "रेबीज / जलांतक",
        symptoms: ["Behavioral changes", "Excessive drooling", "Aggression or unusual friendliness", "Paralysis", "Fear of water"],
        causes: "Viral disease transmitted through bites of infected animals.",
        treatment: "No cure once symptoms appear. Prevention through vaccination is essential.",
        prevention: ["Annual rabies vaccination", "Avoid contact with stray animals", "Post-exposure prophylaxis if bitten"]
      },
      {
        id: 2,
        name: "Canine Distemper",
        nameHi: "कुत्ते का डिस्टेंपर",
        symptoms: ["Fever", "Nasal and eye discharge", "Coughing", "Vomiting and diarrhea", "Seizures"],
        causes: "Highly contagious virus spread through respiratory secretions.",
        treatment: "Supportive care with fluids, antibiotics for secondary infections, anticonvulsants.",
        prevention: ["Puppy vaccination series", "Annual boosters", "Avoid contact with sick dogs"]
      },
      {
        id: 3,
        name: "Tick Fever (Babesiosis)",
        nameHi: "टिक बुखार",
        symptoms: ["High fever", "Pale gums", "Dark urine", "Lethargy", "Loss of appetite"],
        causes: "Parasitic infection transmitted by tick bites.",
        treatment: "Anti-parasitic drugs (diminazene, imidocarb), blood transfusion in severe cases.",
        prevention: ["Regular tick prevention", "Check for ticks daily", "Keep environment clean"]
      }
    ]
  },
  cat: {
    name: "Cat",
    nameHi: "बिल्ली",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop",
    description: "Cats are popular pets known for their independence and ability to control rodent populations.",
    diseases: [
      {
        id: 1,
        name: "Feline Panleukopenia",
        nameHi: "बिल्ली का पैनल्यूकोपेनिया",
        symptoms: ["Severe vomiting", "Bloody diarrhea", "High fever", "Dehydration", "Depression"],
        causes: "Highly contagious parvovirus spread through contact with infected cats or feces.",
        treatment: "Aggressive fluid therapy, anti-nausea medication, antibiotics for secondary infections.",
        prevention: ["Vaccination as kitten", "Annual boosters", "Quarantine infected cats"]
      },
      {
        id: 2,
        name: "Upper Respiratory Infection",
        nameHi: "श्वसन संक्रमण",
        symptoms: ["Sneezing", "Runny nose and eyes", "Fever", "Loss of appetite", "Mouth ulcers"],
        causes: "Various viruses (herpesvirus, calicivirus) and bacteria spread through direct contact.",
        treatment: "Supportive care, steam therapy, eye drops, antibiotics if bacterial.",
        prevention: ["Vaccination", "Good ventilation", "Reduce stress", "Isolate sick cats"]
      }
    ]
  },
  horse: {
    name: "Horse",
    nameHi: "घोड़ा",
    image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&h=400&fit=crop",
    description: "Horses are used for transportation, agriculture, and ceremonial purposes across India.",
    diseases: [
      {
        id: 1,
        name: "Equine Influenza",
        nameHi: "घोड़े का फ्लू",
        symptoms: ["High fever", "Dry cough", "Nasal discharge", "Loss of appetite", "Muscle stiffness"],
        causes: "Highly contagious virus spread through respiratory droplets.",
        treatment: "Rest for 3 weeks, anti-inflammatory drugs, antibiotics for secondary infections.",
        prevention: ["Bi-annual vaccination", "Quarantine new horses", "Good stable ventilation"]
      },
      {
        id: 2,
        name: "Colic",
        nameHi: "पेट दर्द",
        symptoms: ["Pawing the ground", "Rolling", "Looking at abdomen", "Reduced appetite", "Sweating"],
        causes: "Various causes including gas, impaction, parasites, or twisted intestine.",
        treatment: "Walking the horse, pain relief, fluids, surgery in severe cases.",
        prevention: ["Regular feeding schedule", "Clean water access", "Deworming", "Dental care"]
      }
    ]
  },
  donkey: {
    name: "Donkey",
    nameHi: "गधा",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop",
    description: "Donkeys are hardy working animals used for transportation in rural and hilly areas.",
    diseases: [
      {
        id: 1,
        name: "African Horse Sickness",
        nameHi: "अफ्रीकी घोड़ा बीमारी",
        symptoms: ["High fever", "Breathing difficulty", "Swelling around eyes", "Foamy nasal discharge"],
        causes: "Viral disease transmitted by Culicoides midges.",
        treatment: "No specific treatment; supportive care and rest.",
        prevention: ["Vaccination in endemic areas", "Housing during midge activity", "Insect control"]
      },
      {
        id: 2,
        name: "Sarcoids",
        nameHi: "त्वचा ट्यूमर",
        symptoms: ["Skin tumors", "Warty growths", "Nodules around eyes and belly", "Ulcerated masses"],
        causes: "Caused by bovine papillomavirus, often transmitted by flies.",
        treatment: "Surgical removal, cryotherapy, topical chemotherapy.",
        prevention: ["Fly control", "Avoid contact with infected animals", "Keep wounds clean"]
      }
    ]
  },
  chicken: {
    name: "Chicken",
    nameHi: "मुर्गी",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=400&fit=crop",
    description: "Chickens are the most common poultry raised for eggs and meat in India.",
    diseases: [
      {
        id: 1,
        name: "Newcastle Disease",
        nameHi: "रानीखेत रोग",
        symptoms: ["Respiratory distress", "Greenish diarrhea", "Twisted neck", "Paralysis", "Sudden death"],
        causes: "Highly contagious virus spread through respiratory secretions and feces.",
        treatment: "No treatment; cull infected birds. Supportive care may help mild cases.",
        prevention: ["Regular vaccination", "Biosecurity measures", "Quarantine new birds"]
      },
      {
        id: 2,
        name: "Fowl Pox",
        nameHi: "मुर्गी चेचक",
        symptoms: ["Wart-like lesions on comb and wattles", "Lesions in mouth and throat", "Reduced egg production"],
        causes: "Viral disease spread by mosquitoes and direct contact.",
        treatment: "No specific treatment; supportive care, remove scabs with iodine.",
        prevention: ["Vaccination", "Mosquito control", "Isolate infected birds"]
      }
    ]
  },
  duck: {
    name: "Duck",
    nameHi: "बत्तख",
    image: "https://images.unsplash.com/photo-1459682687441-7761439a709d?w=800&h=400&fit=crop",
    description: "Ducks are raised for eggs, meat, and pest control in rice paddies.",
    diseases: [
      {
        id: 1,
        name: "Duck Plague",
        nameHi: "बत्तख प्लेग",
        symptoms: ["Sudden death", "Bloody diarrhea", "Nasal discharge", "Swollen head", "Paralysis"],
        causes: "Highly contagious herpesvirus spread through direct contact and water.",
        treatment: "No specific treatment; supportive care for mild cases.",
        prevention: ["Vaccination", "Clean water sources", "Quarantine new ducks"]
      },
      {
        id: 2,
        name: "Duck Viral Hepatitis",
        nameHi: "बत्तख हेपेटाइटिस",
        symptoms: ["Sudden death in ducklings", "Paddling movements", "Enlarged liver", "Lethargy"],
        causes: "Viral disease affecting young ducks, spread through feces.",
        treatment: "Antiserum if available; mostly supportive care.",
        prevention: ["Vaccinate breeding ducks", "Good hygiene", "Isolate sick birds"]
      }
    ]
  },
  pig: {
    name: "Pig",
    nameHi: "सूअर",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=400&fit=crop",
    description: "Pigs are raised for meat and are an important protein source in many regions.",
    diseases: [
      {
        id: 1,
        name: "Classical Swine Fever",
        nameHi: "शास्त्रीय स्वाइन बुखार",
        symptoms: ["High fever", "Loss of appetite", "Purple discoloration of skin", "Diarrhea", "Weakness"],
        causes: "Highly contagious virus spread through direct contact and contaminated feed.",
        treatment: "No treatment; infected pigs should be culled.",
        prevention: ["Vaccination", "Biosecurity", "Avoid feeding kitchen waste"]
      },
      {
        id: 2,
        name: "Piglet Diarrhea",
        nameHi: "पिगलेट दस्त",
        symptoms: ["Watery diarrhea", "Dehydration", "Weight loss", "Weakness", "Death in severe cases"],
        causes: "Various bacteria, viruses, or parasites affecting young pigs.",
        treatment: "Oral rehydration, antibiotics, warm housing.",
        prevention: ["Clean farrowing pens", "Colostrum feeding", "Vaccination of sows"]
      }
    ]
  },
  rabbit: {
    name: "Rabbit",
    nameHi: "खरगोश",
    image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&h=400&fit=crop",
    description: "Rabbits are raised for meat, fur, and as pets across India.",
    diseases: [
      {
        id: 1,
        name: "Myxomatosis",
        nameHi: "मिक्सोमैटोसिस",
        symptoms: ["Swollen eyes and genitals", "Fever", "Loss of appetite", "Skin tumors", "Difficulty breathing"],
        causes: "Viral disease spread by mosquitoes and fleas.",
        treatment: "No specific treatment; supportive care, often fatal.",
        prevention: ["Vaccination where available", "Insect control", "Quarantine infected rabbits"]
      },
      {
        id: 2,
        name: "Snuffles",
        nameHi: "सर्दी-जुकाम",
        symptoms: ["Sneezing", "White nasal discharge", "Matted fur on paws", "Eye discharge", "Head tilt"],
        causes: "Bacterial infection (Pasteurella multocida) triggered by stress or poor conditions.",
        treatment: "Antibiotics, clean environment, reduce stress.",
        prevention: ["Good ventilation", "Clean cages", "Reduce stress", "Quarantine sick rabbits"]
      }
    ]
  },
  camel: {
    name: "Camel",
    nameHi: "ऊंट",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=400&fit=crop",
    description: "Camels are the 'ships of the desert', essential for transportation in Rajasthan and Gujarat.",
    diseases: [
      {
        id: 1,
        name: "Trypanosomiasis (Surra)",
        nameHi: "सुर्रा रोग",
        symptoms: ["Fever", "Anemia", "Weight loss", "Edema", "Weakness"],
        causes: "Parasitic disease transmitted by biting flies.",
        treatment: "Suramin or quinapyramine injections by a veterinarian.",
        prevention: ["Fly control", "Regular screening", "Treatment of carriers"]
      },
      {
        id: 2,
        name: "Mange",
        nameHi: "खाज",
        symptoms: ["Intense itching", "Hair loss", "Thickened skin", "Scabs and crusts"],
        causes: "Parasitic mites burrowing into skin.",
        treatment: "Ivermectin injections, topical acaricides, treat all animals in herd.",
        prevention: ["Regular inspection", "Quarantine new animals", "Good nutrition"]
      }
    ]
  },
  elephant: {
    name: "Elephant",
    nameHi: "हाथी",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&h=400&fit=crop",
    description: "Elephants hold cultural and religious significance in India and are used in temples and forests.",
    diseases: [
      {
        id: 1,
        name: "Elephant Endotheliotropic Herpesvirus (EEHV)",
        nameHi: "हाथी हर्पीस वायरस",
        symptoms: ["Sudden lethargy", "Swollen head and tongue", "Cyanosis", "Internal bleeding", "Rapid death"],
        causes: "Fatal herpesvirus primarily affecting young elephants.",
        treatment: "Antiviral drugs (famciclovir), plasma transfusion, intensive care.",
        prevention: ["Regular health monitoring", "Early detection", "Reduce stress in young elephants"]
      },
      {
        id: 2,
        name: "Foot Problems",
        nameHi: "पैर की समस्या",
        symptoms: ["Lameness", "Cracked nails", "Abscesses", "Overgrown cuticles"],
        causes: "Hard surfaces, lack of foot care, injuries.",
        treatment: "Regular foot trimming, treatment of wounds, soft bedding.",
        prevention: ["Proper flooring", "Regular foot inspection", "Adequate exercise on natural surfaces"]
      }
    ]
  },
  parrot: {
    name: "Parrot",
    nameHi: "तोता",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=400&fit=crop",
    description: "Parrots are popular pet birds known for their intelligence and ability to mimic speech.",
    diseases: [
      {
        id: 1,
        name: "Psittacosis",
        nameHi: "तोता बुखार",
        symptoms: ["Ruffled feathers", "Lethargy", "Eye and nasal discharge", "Green droppings", "Weight loss"],
        causes: "Bacterial infection (Chlamydia psittaci) that can spread to humans.",
        treatment: "Doxycycline antibiotics for 45 days, supportive care.",
        prevention: ["Quarantine new birds", "Good hygiene", "Proper ventilation"]
      },
      {
        id: 2,
        name: "Feather Plucking",
        nameHi: "पंख नोचना",
        symptoms: ["Self-inflicted feather loss", "Bare patches", "Skin damage", "Behavioral changes"],
        causes: "Stress, boredom, nutritional deficiencies, or underlying illness.",
        treatment: "Environmental enrichment, diet improvement, treat underlying cause.",
        prevention: ["Adequate stimulation", "Social interaction", "Balanced diet", "Regular health checks"]
      }
    ]
  },
  pigeon: {
    name: "Pigeon",
    nameHi: "कबूतर",
    image: "https://images.unsplash.com/photo-1555169062-013468b47731?w=800&h=400&fit=crop",
    description: "Pigeons are raised for sport, show, and meat, with a rich history in Indian culture.",
    diseases: [
      {
        id: 1,
        name: "Pigeon Paramyxovirus (PMV)",
        nameHi: "कबूतर पीएमवी",
        symptoms: ["Twisted neck", "Circling", "Paralysis", "Green watery droppings", "Inability to fly"],
        causes: "Viral disease related to Newcastle disease, spread through droppings.",
        treatment: "No specific treatment; supportive care, most birds recover with nursing.",
        prevention: ["Vaccination", "Quarantine new birds", "Good hygiene"]
      },
      {
        id: 2,
        name: "Canker (Trichomoniasis)",
        nameHi: "कैंकर",
        symptoms: ["Yellow cheesy deposits in mouth", "Difficulty swallowing", "Weight loss", "Regurgitation"],
        causes: "Protozoan parasite (Trichomonas gallinae) spread through contaminated water.",
        treatment: "Metronidazole or ronidazole, clean water sources.",
        prevention: ["Clean drinking water", "Regular medication", "Avoid overcrowding"]
      }
    ]
  }
};

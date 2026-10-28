// Comprehensive Animal Disease and Cure Dataset
export const animalData = {
  "cow": {
    "name": "Cow",
    "nameHi": "गाय",
    "image": "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800",
    "description": "Cows are gentle dairy livestock vital to agriculture and rural livelihoods across India.",
    "diseases": [
      {
        "id": 1,
        "name": "Foot and Mouth Disease (FMD)",
        "nameHi": "खुरपका-मुंहपका रोग",
        "symptoms": [
          "High fever (104-106°F)",
          "Blisters on mouth, tongue, and interdigital cleft of hooves",
          "Excessive ropey drooling",
          "Severe lameness",
          "Sudden drop in milk yield"
        ],
        "causes": "Aphthovirus (Picornaviridae) transmitted through direct contact, infected aerosols, and contaminated fodder.",
        "treatment": "Isolate the cow. Clean mouth sores with mild 1% potassium permanganate or 2% sodium bicarbonate solution. Dress hoof lesions with povidone-iodine and fly-repellent ointment. Administer antibiotics (Procaine Penicillin or Ceftiofur) to prevent secondary infection, plus Flunixin meglumine for pain/fever. Feed soft gruel.",
        "prevention": [
          "Bi-annual FMD vaccination",
          "21-day quarantine for newly bought cattle",
          "Disinfect premises with 4% washing soda"
        ]
      },
      {
        "id": 2,
        "name": "Bovine Mastitis",
        "nameHi": "थनैला रोग",
        "symptoms": [
          "Hot, swollen, tender udder quarter",
          "Milk with clots, flakes, or watery serum",
          "Pain when touched or milked",
          "Fever and loss of appetite"
        ],
        "causes": "Bacterial infection (Staphylococcus aureus, Streptococcus agalactiae, E. coli) entering via the teat canal due to poor milking hygiene.",
        "treatment": "Complete stripping of infected quarter every 2-3 hours. Intramammary antibiotic infusion (Cephalexin or Cloxacillin) prescribed by a vet. Systemic broad-spectrum antibiotics (Ceftriaxone or Enrofloxacin) and Meloxicam for inflammation. Cold water compresses in acute stage.",
        "prevention": [
          "Post-milking teat dipping in 0.5% iodine",
          "Clean dry lime-dusted flooring",
          "Dry cow therapy between lactations"
        ]
      },
      {
        "id": 3,
        "name": "Lumpy Skin Disease (LSD)",
        "nameHi": "लम्पी त्वचा रोग",
        "symptoms": [
          "Firm, round cutaneous nodules (2-5 cm) all over body",
          "Persistent high fever (105°F)",
          "Edema of legs, dewlap, and brisket",
          "Enlarged prescapular lymph nodes",
          "Nasal and ocular discharge"
        ],
        "causes": "Capripoxvirus spread primarily by blood-feeding insects (mosquitoes, biting flies, ticks) and shared watering points.",
        "treatment": "Supportive care: Administer antipyretics (Meloxicam or Paracetamol) for fever and pain. Broad-spectrum antibiotics (Enrofloxacin or Oxytetracycline) for 5 days to prevent secondary bacterial infection. Clean lesions with potassium permanganate and spray Methylene Blue. Give multivitamins (A, D3, E, Biotin) and zinc.",
        "prevention": [
          "Heterologous Goat Pox vaccine (3 ml s/c in endemic areas)",
          "Vector control with deltamethrin sprays",
          "Immediate isolation of sick cows"
        ]
      },
      {
        "id": 4,
        "name": "Bloat (Tympanites)",
        "nameHi": "अफारा / पेट फूलना",
        "symptoms": [
          "Severe distension of left paralumbar fossa",
          "Difficulty breathing with open mouth",
          "Groaning and restlessness",
          "Kicking at belly",
          "Reluctance to move"
        ],
        "causes": "Excessive accumulation of gas in rumen from grazing lush green legumes (frothy bloat) or esophageal choking.",
        "treatment": "Keep cow standing with front legs elevated. Administer anti-foaming drench: 250-500 ml edible vegetable oil (mustard/groundnut) with 15 ml turpentine oil, or commercial simethicone suspension. Pass stomach tube to release free gas. In emergency suffocation, veterinary trocarization of left flank.",
        "prevention": [
          "Feed dry straw/hay before turning out to lush pastures",
          "Avoid sudden switch to concentrated grain feeds"
        ]
      },
      {
        "id": 5,
        "name": "Milk Fever (Hypocalcemia)",
        "nameHi": "दुग्ध ज्वर",
        "symptoms": [
          "Occurs within 48 hours of calving",
          "Staggering uncoordinated gait",
          "Downer cow with neck bent back into flank ('S-curve')",
          "Cold ears and muzzle",
          "Loss of consciousness"
        ],
        "causes": "Acute depletion of blood calcium due to sudden demand for colostrum synthesis in high-producing dairy cows.",
        "treatment": "Immediate slow intravenous infusion of 400-500 ml warm Calcium Borogluconate (25%) under vet supervision. Prop cow upright with straw bales. Once swallowing reflex returns, follow with oral ionic calcium gel tube every 12 hours.",
        "prevention": [
          "Low calcium anionic diet (DCAD) 3 weeks before calving",
          "Oral calcium paste immediately at calving and 24 hours later"
        ]
      }
    ]
  },
  "buffalo": {
    "name": "Buffalo",
    "nameHi": "भैंस",
    "image": "https://images.unsplash.com/photo-1568708167498-2a22bc97ad69?auto=format&fit=crop&q=80&w=800",
    "description": "Water buffaloes are crucial dairy and draught animals known for high-fat creamy milk production.",
    "diseases": [
      {
        "id": 1,
        "name": "Hemorrhagic Septicemia (HS)",
        "nameHi": "गलघोंटू रोग",
        "symptoms": [
          "High spiking fever (105-107°F)",
          "Hot painful swelling in throat, dewlap and neck",
          "Loud stertorous rattling breathing",
          "Tongue swollen and protruding with salivation",
          "Death within 24 hours if untreated"
        ],
        "causes": "Pasteurella multocida bacteria, triggered by monsoon climate stress, exhaustion, and sudden chilling.",
        "treatment": "Immediate early antibiotic therapy: Intravenous Oxytetracycline (10 mg/kg), Ceftiofur sodium, or Sulfadimidine (33.3% at 100-150 ml IV). Flunixin meglumine IV to rapidly reduce throat swelling. Provide easily digestible warm gruel.",
        "prevention": [
          "Mandatory annual HS vaccination 1 month prior to monsoon",
          "Isolate feverish buffaloes immediately"
        ]
      },
      {
        "id": 2,
        "name": "Black Quarter (BQ)",
        "nameHi": "लंगड़ा बुखार / चरचरी",
        "symptoms": [
          "Severe acute lameness in one leg",
          "Hot, painful swelling in heavy muscles (thigh/shoulder) that becomes cold and painless",
          "Crepitation (crackling sound) under skin when pressed",
          "High fever",
          "Prostration"
        ],
        "causes": "Clostridium chauvoei endospores in soil ingested and activated in deep muscle by trauma or heavy work.",
        "treatment": "Early treatment is vital: Crystalline Penicillin G IV (20,000-40,000 units/kg) followed by Procaine Penicillin IM for 5 days. Deep surgical incisions to aerate muscle and flush with hydrogen peroxide. Analgesics for pain.",
        "prevention": [
          "Annual BQ vaccination at 6 months of age",
          "Avoid grazing in pastures with history of blackleg",
          "Prompt wound antiseptic care"
        ]
      },
      {
        "id": 3,
        "name": "Surra (Trypanosomiasis)",
        "nameHi": "सर्रा रोग",
        "symptoms": [
          "Intermittent fever spikes",
          "Progressive emaciation despite normal appetite",
          "Anemia with pale mucous membranes",
          "Edema of legs and lower abdomen",
          "Circling and head-pressing in terminal stage"
        ],
        "causes": "Blood protozoan Trypanosoma evansi mechanically transmitted by tabanid horseflies.",
        "treatment": "Trypanocidal injection: Quinapyramine sulfate + chloride (Triquin / Antrycide prosalt at 3-5 mg/kg s/c) or Diminazene diaceturate (Berenil at 3.5-7 mg/kg deep IM). Supportive liver tonics, vitamin B-complex, and dextrose infusions.",
        "prevention": [
          "Fly control with repellent sprays",
          "Smoke shelters during peak fly season",
          "Prophylactic quinapyramine before monsoon"
        ]
      },
      {
        "id": 4,
        "name": "Buffalo Pox",
        "nameHi": "भैंस चेचक",
        "symptoms": [
          "Painful papules, vesicles, and scabs on teats, udder, and inner thighs",
          "Reluctance to allow milking",
          "Teat canal obstruction",
          "Mild fever"
        ],
        "causes": "Buffalopox virus spread via milkers' hands, shared cloths, and biting flies.",
        "treatment": "Wash lesions with mild 1:1000 potassium permanganate solution. Apply soothing antiseptic ointment (boric acid + zinc oxide or silver sulfadiazine) after milking. Use teat cannula if duct is blocked. Administer paracetamol for pain.",
        "prevention": [
          "Milker hand disinfection",
          "Milk infected buffaloes last",
          "Fly control in dairy sheds"
        ]
      }
    ]
  },
  "goat": {
    "name": "Goat",
    "nameHi": "बकरी",
    "image": "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800",
    "description": "Goats are hardy small ruminants raised across India for milk, meat, and fiber.",
    "diseases": [
      {
        "id": 1,
        "name": "Peste des Petits Ruminants (PPR)",
        "nameHi": "पीपीआर (बकरी प्लेग)",
        "symptoms": [
          "High fever (104-106°F)",
          "Ulcers and white necrotic lesions inside mouth",
          "Severe foul-smelling diarrhea",
          "Nasal and ocular discharge caking nostrils",
          "Coughing and pneumonia"
        ],
        "causes": "PPR morbillivirus spread through direct contact, shared water, and respiratory droplets.",
        "treatment": "Supportive therapy is vital: Rehydration with oral electrolyte solution (ORS). Broad-spectrum antibiotics (Enrofloxacin or Oxytetracycline) to prevent secondary bacterial pneumonia. Clean mouth sores with warm 1% baking soda wash and boro-glycerine.",
        "prevention": [
          "PPR live vaccine at 3 months of age (gives 3 years immunity)",
          "Quarantine new goats for 21 days"
        ]
      },
      {
        "id": 2,
        "name": "Enterotoxemia (Pulpy Kidney)",
        "nameHi": "एंटेरोटॉक्सिमिया (फिड़किया)",
        "symptoms": [
          "Sudden death in healthy kids",
          "Convulsions, head thrown back (opisthotonos)",
          "Teeth grinding and frothing at mouth",
          "Greenish-black diarrhea"
        ],
        "causes": "Clostridium perfringens type D multiplying rapidly in gut after sudden intake of high-starch grains or lush grass.",
        "treatment": "Emergency administration of Enterotoxemia hyperimmune antiserum if available. High-dose oral penicillin. Oral antacids (magnesium hydroxide or sodium bicarbonate) and intestinal protectants. Immediate fluid therapy.",
        "prevention": [
          "Annual Enterotoxemia (ET) vaccination before monsoon and grain feeding",
          "Gradual change of diet"
        ]
      },
      {
        "id": 3,
        "name": "Contagious Caprine Pleuropneumonia (CCPP)",
        "nameHi": "संक्रामक फुफ्फुस शोथ",
        "symptoms": [
          "Painful coughing",
          "High fever (105°F)",
          "Mouth breathing with extended neck and tongue out",
          "Grunting chest pain",
          "Frothy nasal discharge"
        ],
        "causes": "Mycoplasma capricolum subsp. capripneumoniae transmitted by aerosol droplet inhalation in crowded sheds.",
        "treatment": "Early administration of Tylosin tartrate (10 mg/kg IM) or Oxytetracycline (20 mg/kg long-acting IM). Anti-inflammatory Meloxicam to relieve lung pain. Keep in warm, dry, draft-free shelter.",
        "prevention": [
          "CCPP inactivated vaccine in high-risk zones",
          "Avoid overcrowding in sheds",
          "Maintain clean dry bedding"
        ]
      },
      {
        "id": 4,
        "name": "Coccidiosis in Kids",
        "nameHi": "कोक्सीडायोसिस (खूनी दस्त)",
        "symptoms": [
          "Dark green or bloody diarrhea with mucus",
          "Straining (tenesmus)",
          "Severe dehydration and weakness",
          "Rough staring coat",
          "Pot-bellied appearance in kids aged 1-6 months"
        ],
        "causes": "Intracellular protozoan parasites (Eimeria species) ingested from contaminated bedding and unhygienic floors.",
        "treatment": "Oral drench of Amprolium (10-20 mg/kg daily for 5 days) or Toltrazuril (Baycox at 20 mg/kg single dose). Oral rehydration therapy with glucose-electrolyte solution. Sulfadimethoxine drench for co-infections.",
        "prevention": [
          "Raise feed and water troughs off ground",
          "Keep nursery pens clean and dry with lime",
          "Avoid overcrowding"
        ]
      }
    ]
  },
  "sheep": {
    "name": "Sheep",
    "nameHi": "भेड़",
    "image": "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800",
    "description": "Sheep are versatile domestic ruminants farmed for quality wool, mutton, and milk.",
    "diseases": [
      {
        "id": 1,
        "name": "Bluetongue Disease",
        "nameHi": "नीली जीभ रोग",
        "symptoms": [
          "High fever",
          "Swollen lips, muzzle, and ears",
          "Cyanotic bluish swollen tongue",
          "Mouth ulcers and drooling",
          "Lameness from red coronary band around hooves"
        ],
        "causes": "Bluetongue virus (Orbivirus) transmitted by biting Culicoides midges.",
        "treatment": "Supportive nursing care: House sheep in shaded cool barns out of direct sun. Provide soft gruel and clean water. Administer Meloxicam for fever and pain. Broad-spectrum antibiotics (Ampicillin or Oxytetracycline) to prevent secondary pneumonia.",
        "prevention": [
          "Pentavalent Bluetongue vaccine before monsoon",
          "House sheep indoors from dusk to dawn when midges feed",
          "Insecticidal dipping"
        ]
      },
      {
        "id": 2,
        "name": "Sheep Pox",
        "nameHi": "भेड़ चेचक",
        "symptoms": [
          "High fever",
          "Round papules and scabs on wool-free skin (groin, axilla, muzzle)",
          "Swollen eyelids and eye discharge",
          "Respiratory distress in lambs"
        ],
        "causes": "Sheeppox virus spread by direct contact, scabs, and shared wool shearing equipment.",
        "treatment": "Clean crusts with povidone-iodine wash. Apply soothing antibiotic and fly-repellent ointment. Administer parenteral antibiotics (Penicillin or Enrofloxacin) to prevent secondary bacterial pneumonia. Supply vitamins A and E.",
        "prevention": [
          "Annual live attenuated Sheep Pox vaccine (0.5 ml s/c)",
          "Burn infected scabs and bedding",
          "Quarantine new sheep"
        ]
      },
      {
        "id": 3,
        "name": "Foot Rot",
        "nameHi": "खुर सड़न",
        "symptoms": [
          "Severe progressive lameness",
          "Sheep grazing on knees",
          "Foul-smelling necrotic discharge in interdigital cleft",
          "Hoof horn separating from underlying tissue"
        ],
        "causes": "Dichelobacter nodosus and Fusobacterium necrophorum bacteria thriving in wet muddy conditions.",
        "treatment": "Careful hoof paring to remove dead horn and expose bacteria to air. Foot bathing in 10% Zinc Sulfate or 5% Copper Sulfate solution for 15 minutes twice weekly. Spray pared feet with Oxytetracycline aerosol. Move flock to dry pasture.",
        "prevention": [
          "Maintain dry bedding",
          "Routine hoof trimming",
          "Walk through zinc sulfate footbath at shed entrance",
          "Cull chronic carriers"
        ]
      },
      {
        "id": 4,
        "name": "Barber's Pole Worm (Haemonchosis)",
        "nameHi": "पेट के कीड़े (एनीमिया)",
        "symptoms": [
          "Extreme anemia with chalky white eye conjunctiva (FAMACHA 4-5)",
          "Submandibular edema ('bottle jaw')",
          "Severe weakness and lag behind flock",
          "Poor wool quality"
        ],
        "causes": "Haemonchus contortus blood-sucking stomach nematode inside the abomasum.",
        "treatment": "Targeted deworming: Closantel (10 mg/kg), Levamisole, or Ivermectin drench. Administer iron tonics (Iron Dextran injection or oral syrup) and vitamin B12. High-protein feed supplementation.",
        "prevention": [
          "Rotational pasture grazing",
          "Avoid grazing on wet morning dew grass",
          "Strategic seasonal deworming"
        ]
      }
    ]
  },
  "dog": {
    "name": "Dog",
    "nameHi": "कुत्ता",
    "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800",
    "description": "The domestic dog is a loyal companion, guard animal, and devoted family pet across Indian homes.",
    "diseases": [
      {
        "id": 1,
        "name": "Canine Parvovirus (CPV)",
        "nameHi": "कैनाइन पार्वोवायरस",
        "symptoms": [
          "Severe foul-smelling bloody diarrhea",
          "Persistent forceful vomiting",
          "Severe dehydration and sunken eyes",
          "High fever followed by subnormal temperature",
          "Complete refusal to eat or drink"
        ],
        "causes": "Canine Parvovirus type 2 (CPV-2) spreading via contaminated feces and infected surfaces.",
        "treatment": "Urgent veterinary hospitalization: IV fluid therapy (Ringer's Lactate / Normosol-R) with Potassium Chloride. Antiemetics: Maropitant (Cerenia) or Ondansetron IV. Broad-spectrum IV antibiotics (Ceftriaxone + Metronidazole) to prevent sepsis. Sucralfate gastric protectant.",
        "prevention": [
          "Core puppy vaccination (DHPPi) at 6, 9, 12, and 16 weeks with annual boosters",
          "Disinfect kennels with 1:30 dilution of household bleach"
        ]
      },
      {
        "id": 2,
        "name": "Canine Distemper",
        "nameHi": "कैनाइन डिस्टेंपर",
        "symptoms": [
          "Pus-like eye and nasal discharge",
          "Dry hacking cough",
          "Vomiting and diarrhea",
          "Hardening of paw pads and nose ('hard pad')",
          "Muscle twitching (myoclonus) and seizures"
        ],
        "causes": "Canine distemper paramyxovirus spread through airborne droplets and secretions.",
        "treatment": "Supportive hospital care: IV fluids, nebulization with saline, broad-spectrum antibiotics for secondary lung infection. Anticonvulsants (Phenobarbital, Levetiracetam) for seizures. Neurotrophic vitamins (Methylcobalamin).",
        "prevention": [
          "DHPPi core vaccination series in puppies",
          "Keep unvaccinated puppies away from public dog parks"
        ]
      },
      {
        "id": 3,
        "name": "Tick Fever (Babesiosis / Ehrlichiosis)",
        "nameHi": "टिक बुखार (बेबेसियोसिस)",
        "symptoms": [
          "High spiking fever",
          "Pale gums and tongue",
          "Dark tea-colored or bloody urine",
          "Nosebleeds (epistaxis)",
          "Lethargy and swollen lymph nodes"
        ],
        "causes": "Intracellular blood parasites (Babesia canis, Ehrlichia canis) transmitted by brown dog ticks.",
        "treatment": "Specific injection: Imidocarb dipropionate (6.6 mg/kg deep IM, repeat in 14 days) or Diminazene for Babesia. Oral Doxycycline (10 mg/kg once daily for 28 days) for Ehrlichia. Blood transfusion in severe anemia (PCV < 15%). Supportive liver tonics.",
        "prevention": [
          "Year-round tick prevention: Bravecto, Simparica, or Fipronil spot-ons",
          "Daily tick inspection after walks"
        ]
      },
      {
        "id": 4,
        "name": "Rabies",
        "nameHi": "रेबीज / जलांतक",
        "symptoms": [
          "Behavioral changes (aggression or unusual timidness)",
          "Excessive drooling and jaw dropping",
          "Inability to swallow",
          "Paralysis and hydrophobia panic",
          "Coma and death"
        ],
        "causes": "Rabies lyssavirus transmitted via bite or saliva contact from an infected mammal.",
        "treatment": "Incurable once clinical signs appear. If exposed: Wash wound immediately with running tap water and soap for 15 minutes, apply povidone-iodine, and administer post-exposure rabies vaccine (Days 0, 3, 7, 14, 28) plus Rabies Immunoglobulin (RIG).",
        "prevention": [
          "Mandatory annual anti-rabies vaccination starting at 3 months of age",
          "Avoid contact with stray or wild animals"
        ]
      },
      {
        "id": 5,
        "name": "Canine Sarcoptic Mange (Scabies)",
        "nameHi": "कुत्तों की खाज-खुजली",
        "symptoms": [
          "Intense uncontrollable itching and scratching",
          "Thick crusty scabs on ear tips, elbows, and belly",
          "Patchy hair loss (alopecia)",
          "Red inflamed skin sores"
        ],
        "causes": "Sarcoptes scabiei mites burrowing into skin. Contagious to other animals and humans.",
        "treatment": "Oral isoxazoline tablet (Bravecto, Simparica, or Nexgard) provides fast total mite elimination. Medicated baths with benzoyl peroxide shampoo to soften scabs followed by Amitraz dip. Antihistamines for itching. Wash dog bedding in hot water.",
        "prevention": [
          "Regular spot-on / chewable parasite prevention",
          "Avoid contact with mangy stray dogs"
        ]
      }
    ]
  },
  "cat": {
    "name": "Cat",
    "nameHi": "बिल्ली",
    "image": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
    "description": "Cats are beloved domestic pets known for agility, cleanliness, and affectionate companionship.",
    "diseases": [
      {
        "id": 1,
        "name": "Feline Panleukopenia (Feline Parvo)",
        "nameHi": "बिल्ली का संक्रामक आंत्रशोथ",
        "symptoms": [
          "Sudden severe vomiting",
          "Profuse watery foul diarrhea",
          "Cat sits hunched over water bowl without drinking",
          "High fever followed by dangerous hypothermia",
          "Third eyelid protrusion"
        ],
        "causes": "Feline panleukopenia virus (parvovirus) destroying intestinal lining and white blood cells.",
        "treatment": "Aggressive hospital care: IV fluids (Normosol/RL with potassium). Antiemetics (Maropitant 1 mg/kg s/c). Injectable antibiotics (Ampicillin-Sulbactam) to prevent bacterial sepsis. Assisted feeding with high-calorie recovery food once vomiting stops.",
        "prevention": [
          "FVRCP core vaccine at 8, 12, and 16 weeks with annual booster",
          "Disinfect premises with diluted bleach"
        ]
      },
      {
        "id": 2,
        "name": "Feline Upper Respiratory Infection (Cat Flu)",
        "nameHi": "बिल्ली फ्लू / जुकाम",
        "symptoms": [
          "Sneezing fits",
          "Eye discharge and conjunctivitis",
          "Painful ulcers on tongue and gums",
          "Copious nasal discharge",
          "Loss of appetite due to inability to smell food"
        ],
        "causes": "Feline Herpesvirus-1 (FHV-1) and Feline Calicivirus (FCV), often with secondary bacterial infections.",
        "treatment": "Steam inhalation or saline nebulization 2-3 times daily. Clean eyes/nose with warm wet cotton; apply Tobramycin eye drops. Oral Doxycycline or Azithromycin for secondary bacteria. Oral L-Lysine (250-500 mg daily). Warm, aromatic wet food.",
        "prevention": [
          "Core FVRCP vaccination",
          "Reduce household stress and overcrowding",
          "Quarantine new cats for 2 weeks"
        ]
      },
      {
        "id": 3,
        "name": "Feline Lower Urinary Tract Disease (FLUTD)",
        "nameHi": "मूत्र पथ रोग / पेशाब रुकना",
        "symptoms": [
          "Straining painfully in litter box",
          "Frequent attempts with only drops passed",
          "Crying while urinating",
          "Blood in urine (hematuria)",
          "Distended hard painful bladder (emergency in males!)"
        ],
        "causes": "Urethral plugs of crystals/mucus, bladder stones, or stress-induced feline idiopathic cystitis (FIC).",
        "treatment": "Veterinary emergency: Immediate sedation and gentle catheterization to unblock urethra and flush bladder with warm sterile saline. IV fluids to correct electrolyte crisis. Antispasmodics (Prazosin), pain relief (Buprenorphine). Switch permanently to wet prescription urinary diet.",
        "prevention": [
          "Feed predominantly wet canned food",
          "Provide multiple clean fresh water fountains",
          "Clean litter box daily"
        ]
      },
      {
        "id": 4,
        "name": "Feline Ear Mites (Otodectes)",
        "nameHi": "कान की खुजली (माइट्स)",
        "symptoms": [
          "Intense scratching of ears",
          "Vigorous head shaking",
          "Crumbly dark brown 'coffee ground' debris inside ear canals",
          "Scratch wounds behind ears"
        ],
        "causes": "Otodectes cynotis microscopic mites living inside the ear canal.",
        "treatment": "Clean outer ear canal gently with veterinary ear cleaner. Apply topical spot-on medication (Selamectin / Revolution or Bravecto Plus) on back of neck skin. Topical ear drops containing miconazole and prednisolone for secondary yeast/inflammation. Treat all pets in home.",
        "prevention": [
          "Monthly spot-on antiparasitic treatments",
          "Regular ear inspection during grooming"
        ]
      }
    ]
  },
  "horse": {
    "name": "Horse",
    "nameHi": "घोड़ा",
    "image": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800",
    "description": "Horses are magnificent equines bred and kept for transport, riding, sports, and ceremonial heritage.",
    "diseases": [
      {
        "id": 1,
        "name": "Equine Colic",
        "nameHi": "घोड़े का पेट दर्द (कोलिक)",
        "symptoms": [
          "Looking back at flank",
          "Kicking at belly",
          "Pawing at ground",
          "Violent rolling and thrashing",
          "Profuse sweating",
          "Absence of normal gut sounds"
        ],
        "causes": "Gas accumulation, feed impaction, twisted intestine (volvulus), sand ingestion, or parasites.",
        "treatment": "Emergency: Withhold feed immediately. Walk the horse calmly; prevent violent rolling. Vet passes nasogastric tube to release gas and deliver mineral oil. IV Flunixin meglumine for pain. IV fluids. Immediate surgery for twisted bowel.",
        "prevention": [
          "Consistent feeding schedule",
          "Continuous access to clean water",
          "Annual dental float check",
          "Regular deworming"
        ]
      },
      {
        "id": 2,
        "name": "Tetanus (Lockjaw)",
        "nameHi": "धनुस्तंभ (लॉकजॉ)",
        "symptoms": [
          "Rigid 'sawhorse' stance",
          "Third eyelid flashing across eye",
          "Lockjaw with inability to open mouth",
          "Flared nostrils and upright stiff ears",
          "Violent muscle spasms to sudden noise"
        ],
        "causes": "Clostridium tetani neurotoxin entering puncture wounds, sole injuries, or umbilical stump.",
        "treatment": "Place horse in quiet, dark, well-padded stall. Administer high-dose Tetanus Antitoxin (TAT 30,000-50,000 IU IV/IM). High-dose Penicillin G IV. Clean and debride original wound with hydrogen peroxide. Muscle relaxants (Diazepam/Acepromazine).",
        "prevention": [
          "Annual Tetanus Toxoid vaccination",
          "Immediate booster after any puncture wound or surgery"
        ]
      },
      {
        "id": 3,
        "name": "Strangles (Streptococcus equi)",
        "nameHi": "स्ट्रैंगल्स / गलसुआ",
        "symptoms": [
          "High fever (103-106°F)",
          "Thick yellow pus discharge from nostrils",
          "Painful swollen lymph nodes under jaw that abscess and burst",
          "Difficulty swallowing and noisy breathing"
        ],
        "causes": "Streptococcus equi bacteria spread via nose-to-nose contact, shared water buckets, and contaminated gear.",
        "treatment": "Apply hot packs to mature abscesses; when soft, vet lances and flushes cavities with dilute povidone-iodine. Feed soft soaked mash at ground level to facilitate drainage. Flunixin for fever and throat pain. Procaine Penicillin IM if very early before abscesses form.",
        "prevention": [
          "Quarantine new horses for 3 weeks",
          "Disinfect water troughs and buckets",
          "Strangles vaccination in endemic stables"
        ]
      },
      {
        "id": 4,
        "name": "Equine Laminitis (Founder)",
        "nameHi": "खुर का दर्द (लैमिनाइटिस)",
        "symptoms": [
          "'Founder stance' (leaning back on heels, front feet stretched out)",
          "Hot hooves with pounding digital pulse",
          "Extreme reluctance to walk or turn on hard ground"
        ],
        "causes": "Grain overload, lush spring grass grazing, severe colic endotoxemia, or retained foaling placenta.",
        "treatment": "Emergency cryotherapy: Stand horse in ice water slurry up to knees for first 48 hours. Deep soft sand or sawdust bed (18 inches). IV Flunixin meglumine or Phenylbutazone for pain. Frog support pads. Low-carb soaked hay diet.",
        "prevention": [
          "Control lush pasture grazing",
          "Keep grain bins securely locked",
          "Immediate vet check for retained placenta"
        ]
      }
    ]
  },
  "donkey": {
    "name": "Donkey",
    "nameHi": "गधा",
    "image": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80&w=800",
    "description": "Donkeys are patient, resilient working equines providing reliable transport and draft power.",
    "diseases": [
      {
        "id": 1,
        "name": "Hyperlipaemia in Donkeys",
        "nameHi": "हाइपरलिपेमिया",
        "symptoms": [
          "Severe dullness and lethargy",
          "Head hanging low",
          "Complete refusal to eat",
          "Foul-smelling breath",
          "Rapid liver failure and milky plasma"
        ],
        "causes": "Severe energy deficit triggered by stress, sudden fasting, illness, or transport, mobilizing body fat into blood.",
        "treatment": "Equine critical emergency: Rapid restoration of energy. Administer IV glucose infusions and tube-feed high-energy liquid gruel via nasogastric tube. Low-dose insulin therapy under monitoring. Treat underlying illness/pain with donkey-safe NSAID doses.",
        "prevention": [
          "Never fast or rapidly diet a donkey",
          "Ensure continuous forage availability",
          "Minimize transport stress"
        ]
      },
      {
        "id": 2,
        "name": "African Horse Sickness (AHS)",
        "nameHi": "अफ्रीकी अश्व बीमारी",
        "symptoms": [
          "High fever",
          "Severe breathing difficulty with frothy nasal discharge",
          "Swelling around eyes and head",
          "Sudden death in acute pulmonary form"
        ],
        "causes": "Orbivirus transmitted by biting Culicoides midges.",
        "treatment": "No antiviral cure. Rest in dark shaded stall, anti-inflammatory medications, diuretic therapy for pulmonary edema. High mortality rate.",
        "prevention": [
          "Polyvalent live attenuated AHS vaccine",
          "Housing donkeys in insect-proof barns at dusk and dawn",
          "Permethrin insect repellent"
        ]
      },
      {
        "id": 3,
        "name": "Donkey Hoof Abscess & Thrush",
        "nameHi": "खुर में मवाद और सड़न",
        "symptoms": [
          "Acute 3-legged non-weight bearing lameness",
          "Warm hoof wall",
          "Black foul-smelling discharge in frog clefts",
          "Pain on hoof tester pressure"
        ],
        "causes": "Puncture wounds in white line or bacterial/fungal rotting of frog in wet muddy paddocks.",
        "treatment": "Pare out drainage tract in sole to release pus and pressure. Soak hoof in warm water with Epsom salts for 20 minutes. Apply drawing poultice (Animalintex) for 48 hours. Flush thrush with 10% povidone-iodine. Administer tetanus antitoxin booster.",
        "prevention": [
          "Daily hoof cleaning with hoof pick",
          "Keep corrals dry and clean",
          "Regular farrier trims every 6-8 weeks"
        ]
      }
    ]
  },
  "chicken": {
    "name": "Chicken",
    "nameHi": "मुर्गी",
    "image": "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800",
    "description": "Chickens are the most widespread domestic poultry raised across India for wholesome eggs and meat.",
    "diseases": [
      {
        "id": 1,
        "name": "Ranikhet Disease (Newcastle Disease)",
        "nameHi": "रानीखेत रोग",
        "symptoms": [
          "Gasping for air, coughing, and rattling sounds",
          "Greenish watery diarrhea",
          "Twisted neck (torticollis) and stargazing",
          "Wing and leg paralysis",
          "Sudden drop in egg production"
        ],
        "causes": "Avian orthoavulavirus-1 (AOAV-1) spread via droppings, air aerosols, and contaminated feed.",
        "treatment": "No antiviral cure. Flock supportive care: Add broad-spectrum antibiotics to drinking water (Oxytetracycline or Enrofloxacin) to prevent secondary bacterial infection. Provide water-soluble electrolytes, Vitamin A, and Vitamin C. Isolate paralyzed birds.",
        "prevention": [
          "F1 / Lasota strain ocular vaccine at day 5-7",
          "Lasota booster in water at 4 weeks",
          "R2B injection at 8-10 weeks",
          "Strict biosecurity"
        ]
      },
      {
        "id": 2,
        "name": "Coccidiosis (Bloody Diarrhea)",
        "nameHi": "खूनी दस्त / कोक्सीडियोसिस",
        "symptoms": [
          "Chicks huddling together with ruffled feathers and closed eyes",
          "Bloody or dark red droppings",
          "Pale comb and wattles",
          "Severe weight loss and death"
        ],
        "causes": "Eimeria tenella and Eimeria necatrix protozoa multiplying in intestinal walls, ingested from damp poultry litter.",
        "treatment": "Flock medication in drinking water: Amprolium (0.024% water solution for 5-7 days) or Toltrazuril (Baycox at 7 mg/kg for 2 consecutive days). Add Vitamin K to water to stop intestinal bleeding. Replace all wet litter with dry fresh bedding.",
        "prevention": [
          "Maintain dry litter (moisture < 25%)",
          "Anticoccidial feed additives",
          "Avoid overcrowding"
        ]
      },
      {
        "id": 3,
        "name": "Infectious Coryza",
        "nameHi": "संक्रामक जुकाम (कोराइजा)",
        "symptoms": [
          "Swollen face and eyes ('puffy head')",
          "Foul-smelling nasal discharge",
          "Crusty eyelids glued shut",
          "Sneezing and noisy breathing",
          "Drop in egg yield"
        ],
        "causes": "Avibacterium paragallinarum bacterium transmitted through infected water droplets and close contact.",
        "treatment": "Water medication: Sulfadimethoxine, Trimethoprim-Sulfa, or Tylosin for 5-7 days. Flush crusted eyes with warm 2% boric acid solution. Disinfect water lines daily with chlorine (2 ppm).",
        "prevention": [
          "All-in/all-out poultry management",
          "Coryza bacterin vaccine before laying period",
          "Good coop ventilation"
        ]
      },
      {
        "id": 4,
        "name": "Fowl Pox",
        "nameHi": "मुर्गी चेचक",
        "symptoms": [
          "Wart-like nodules and dark scabs on comb, wattles, and eyelids",
          "Wet form: Cheesy yellow membranes in mouth and throat causing choking",
          "Loss of appetite"
        ],
        "causes": "Avipoxvirus spread by mosquito bites and pecking wounds.",
        "treatment": "Dab external scabs with glycerin-iodine or tincture of iodine. Remove oral cheesy plaques gently with cotton swab dipped in hydrogen peroxide. Add multivitamins (especially Vitamin A) to drinking water. Control mosquitoes.",
        "prevention": [
          "Wing-web puncture vaccination with live Fowl Pox vaccine at 6-8 weeks",
          "Mosquito netting over poultry sheds"
        ]
      }
    ]
  },
  "duck": {
    "name": "Duck",
    "nameHi": "बत्तख",
    "image": "https://images.unsplash.com/photo-1459682687441-7761439a709d?auto=format&fit=crop&q=80&w=800",
    "description": "Ducks are semi-aquatic domestic waterfowl valued for large nutritious eggs and agricultural foraging.",
    "diseases": [
      {
        "id": 1,
        "name": "Duck Viral Enteritis (Duck Plague)",
        "nameHi": "बत्तख प्लेग",
        "symptoms": [
          "Extreme thirst and photophobia (avoiding light)",
          "Sudden death in adult laying ducks",
          "Greenish-watery diarrhea with blood flakes",
          "Soiled vent and penile prolapse in drakes"
        ],
        "causes": "Duck enteritis herpesvirus spread through contaminated water bodies and droppings.",
        "treatment": "No antiviral cure. Remove ducks from pond water immediately. Provide acidified fresh drinking water with Vitamin A, D, and C. Antibiotics in feed to prevent secondary salmonellosis.",
        "prevention": [
          "Duck Plague live vaccine at 8-12 weeks",
          "Prevent wild migratory waterfowl from entering domestic ponds"
        ]
      },
      {
        "id": 2,
        "name": "Duck Viral Hepatitis (DVH)",
        "nameHi": "बत्तख वायरल हेपेटाइटिस",
        "symptoms": [
          "Affects ducklings under 3 weeks of age",
          "Sudden lethargy, falling on sides",
          "Rapid leg paddling movements",
          "Head thrown backwards touching back (opisthotonos)",
          "Death within 2 hours"
        ],
        "causes": "Duck hepatitis A virus rapidly spread through contaminated brooder bedding.",
        "treatment": "Urgent injection of hyperimmune duck hepatitis antiserum (0.5 ml IM) into newly exposed ducklings. Keep brooder warm at 32°C with dry bedding.",
        "prevention": [
          "Vaccinate breeder ducks with attenuated DVH vaccine so maternal antibodies protect ducklings",
          "Maintain strict brooder sanitation and prompt isolation of any sick ducklings"
        ]
      },
      {
        "id": 3,
        "name": "Riemerella anatipestifer Infection",
        "nameHi": "न्यू डक डिजीज",
        "symptoms": [
          "Eye and nasal discharge",
          "Green diarrhea",
          "Head and neck tremors",
          "Ducks lying on back paddling feet",
          "Incoordination"
        ],
        "causes": "Riemerella anatipestifer bacteria affecting ducklings aged 2-8 weeks in damp crowded pens.",
        "treatment": "Medication in water: Ceftiofur, Enrofloxacin, or Florfenicol under veterinary direction. Clean and replace wet bedding with dry sand or shavings.",
        "prevention": [
          "Bacterin vaccination",
          "Maintain strict brooder hygiene and avoid mixing age groups"
        ]
      }
    ]
  },
  "pig": {
    "name": "Pig",
    "nameHi": "सूअर",
    "image": "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800",
    "description": "Domestic pigs are highly intelligent, fast-growing livestock farmed for protein production.",
    "diseases": [
      {
        "id": 1,
        "name": "Classical Swine Fever (Hog Cholera)",
        "nameHi": "स्वाइन फीवर",
        "symptoms": [
          "High fever (106°F)",
          "Pigs huddling together for warmth",
          "Purple-red blotches on ears, snout, belly, and thighs",
          "Gummy eyelids stuck with crusts",
          "Constipation followed by diarrhea"
        ],
        "causes": "Pestivirus spread via untreated kitchen waste (swill), airborne droplets, and pig contact.",
        "treatment": "Statutory reporting disease; no curative antiviral. Isolate herd, administer supportive antibiotics and antipyretics under veterinary authority.",
        "prevention": [
          "Mandatory vaccination with Classical Swine Fever vaccine at 2-3 months",
          "Boil all kitchen swill for 30 minutes before feeding"
        ]
      },
      {
        "id": 2,
        "name": "Swine Erysipelas (Diamond Skin Disease)",
        "nameHi": "हीरा त्वचा रोग",
        "symptoms": [
          "High fever",
          "Stiff stilted gait and swollen joints",
          "Raised diamond-shaped purple/red skin plaques on back and sides",
          "Sudden death from heart valve endocarditis"
        ],
        "causes": "Erysipelothrix rhusiopathiae bacteria shed in saliva/feces and persisting in pen soil.",
        "treatment": "Procaine Penicillin G (20,000 units/kg IM twice daily for 4 days) is the drug of choice with rapid recovery. Flunixin meglumine for high fever and joint pain. Clean dry pen.",
        "prevention": [
          "Erysipelas bacterin vaccination of sows before farrowing and growers at 8-10 weeks",
          "Good pen sanitation"
        ]
      },
      {
        "id": 3,
        "name": "Piglet Iron Deficiency Anemia ('Thumps')",
        "nameHi": "पिगलेट एनीमिया",
        "symptoms": [
          "Affects piglets aged 1-3 weeks on concrete floors",
          "Pale skin, white ears and gums",
          "Laboured jerky diaphragmatic breathing ('thumps')",
          "Slow growth and chalky diarrhea"
        ],
        "causes": "Lack of iron in sow's milk combined with lack of soil rooting when housed in concrete pens.",
        "treatment": "Immediate IM injection of 100-200 mg Iron Dextran in neck muscle on day 3 of life. Supply clean red earth or iron paste in creep area.",
        "prevention": [
          "Routine iron dextran injection given to all newborn piglets between 2nd and 4th day of life",
          "Provide access to clean, parasite-free red earth or peat in piglet creep pens"
        ]
      }
    ]
  },
  "rabbit": {
    "name": "Rabbit",
    "nameHi": "खरगोश",
    "image": "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800",
    "description": "Rabbits are gentle herbivores popular as loving domestic pets and small-scale farm animals.",
    "diseases": [
      {
        "id": 1,
        "name": "Gastrointestinal Stasis (GI Stasis)",
        "nameHi": "खरगोश का पेट रुकना / अफारा",
        "symptoms": [
          "Complete refusal to eat",
          "Small, dry, misshapen or completely absent fecal pellets",
          "Hunched posture and loud teeth grinding (bruxism from pain)",
          "Bloated firm stomach"
        ],
        "causes": "Low-fiber diet (lack of grass hay), dehydration, pain, stress, or hairballs halting gut peristalsis.",
        "treatment": "Emergency: Syringe-feed recovery formula (Oxbow Critical Care) with warm water 4-5 times daily (if no physical obstruction). Subcutaneous fluids. Gut motility drugs: Metoclopramide and Cisapride. Meloxicam for pain. Gentle belly massage. Unlimited grass hay.",
        "prevention": [
          "Diet must consist of 80% fresh grass hay (Timothy hay), leafy greens, limited pellets",
          "Avoid seeds, nuts, and sweets"
        ]
      },
      {
        "id": 2,
        "name": "Snuffles (Pasteurellosis)",
        "nameHi": "खरगोश का नजला / जुकाम",
        "symptoms": [
          "Frequent sneezing",
          "Thick creamy white nasal discharge",
          "Matted fur on inside of front paws from face cleaning",
          "Weeping eyes and wheezing"
        ],
        "causes": "Pasteurella multocida bacteria flared up by dust, ammonia fumes, drafts, or stress.",
        "treatment": "Rabbit-safe antibiotics: Enrofloxacin (Baytril), Trimethoprim-Sulfa, or Azithromycin prescribed by exotic vet (Never give oral penicillins or ampicillin - causes fatal gut toxicity!). Saline nebulization. Dust-free paper bedding.",
        "prevention": [
          "Good hutch ventilation",
          "Use paper bedding instead of dusty pine/cedar shavings",
          "Minimize temperature stress"
        ]
      },
      {
        "id": 3,
        "name": "Ear Canker / Ear Mites",
        "nameHi": "कान की पपड़ी (माइट्स)",
        "symptoms": [
          "Thick brown-yellow crusty scabs filling ear canals",
          "Frequent ear scratching and head shaking",
          "Droopy painful ears"
        ],
        "causes": "Psoroptes cuniculi parasitic mites burrowing into ear canal skin.",
        "treatment": "Apply topical spot-on Selamectin (Revolution at 6-18 mg/kg) or subcutaneous Ivermectin. Dab mineral oil or olive oil on crusts to soften — DO NOT pick dry crusts as it tears raw skin; crusts slide off naturally as mites die. Disinfect hutch.",
        "prevention": [
          "Quarantine new rabbits",
          "Monthly preventative spot-on check",
          "Sanitize bedding weekly"
        ]
      }
    ]
  },
  "camel": {
    "name": "Camel",
    "nameHi": "ऊंट",
    "image": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=800",
    "description": "The dromedary camel is the iconic 'Ship of the Desert', indispensable in arid regions like Rajasthan and Gujarat.",
    "diseases": [
      {
        "id": 1,
        "name": "Surra (Trypanosomiasis / Tibarsa)",
        "nameHi": "सर्रा / तिबरसा रोग",
        "symptoms": [
          "Intermittent undulating fever spikes",
          "Rapid loss of hump fat causing hump to collapse",
          "Progressive anemia and pale eye membranes",
          "Edema of legs, sheath, and belly",
          "Distinctive sweetish odor in urine"
        ],
        "causes": "Trypanosoma evansi protozoa transmitted by biting Tabanus horseflies.",
        "treatment": "Trypanocidal injection: Quinapyramine sulfate + chloride (Triquin / Antrycide at 3-5 mg/kg s/c) or Melarsomine (Cymelarsan 0.25 mg/kg deep IM). Long-acting iron injections, liver tonics, and multivitamin B-complex. Rest and high-energy fodder.",
        "prevention": [
          "Prophylactic quinapyramine prosalt injection before monsoon fly season",
          "Fly repellent sprays on herds"
        ]
      },
      {
        "id": 2,
        "name": "Sarcoptic Mange",
        "nameHi": "खाज-खुजली (माइट्स)",
        "symptoms": [
          "Intense unbearable itching with camels rubbing against trees",
          "Thick corrugated cracked skin ('elephant hide')",
          "Gray crusts starting on neck and spreading to groin",
          "Severe weight loss"
        ],
        "causes": "Sarcoptes scabiei var. cameli mites spread through direct contact, shared saddles, and ropes.",
        "treatment": "Subcutaneous Ivermectin (0.2 mg/kg repeated in 14 days) or Doramectin. Wash affected skin with dilute Amitraz or Deltamethrin. Disinfect harness, pack saddles, and ropes in hot acaricide. Apply sulfur ointment on raw skin.",
        "prevention": [
          "Regular herd inspection",
          "Quarantine newly brought camels for 30 days",
          "Never share unwashed saddle blankets"
        ]
      },
      {
        "id": 3,
        "name": "Camel Pox",
        "nameHi": "ऊंट चेचक",
        "symptoms": [
          "High fever",
          "Swollen lips, eyelids, and head",
          "Papules, vesicles, and crusty pustules on lips, nostrils, and genitals",
          "Painful grazing and slobbering"
        ],
        "causes": "Camelpox virus transmitted by direct contact, thorny acacia bushes, and biting flies.",
        "treatment": "Clean sores with mild 1:1000 potassium permanganate. Apply soft zinc-boric ointment or neem paste to mouth lesions. Feed soft green palatable fodder (lucerne, acacia leaves). Oxytetracycline to prevent secondary lung infections.",
        "prevention": [
          "Live attenuated Camelpox vaccine",
          "Isolate infected camels",
          "Fly control around corrals"
        ]
      }
    ]
  },
  "elephant": {
    "name": "Elephant",
    "nameHi": "हाथी",
    "image": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&q=80&w=800",
    "description": "The Asian elephant is a revered, magnificent megaherbivore deeply intertwined with Indian heritage and ecology.",
    "diseases": [
      {
        "id": 1,
        "name": "Elephant Endotheliotropic Herpesvirus (EEHV)",
        "nameHi": "हाथी हर्पीस वायरस",
        "symptoms": [
          "Rapid lethargy in juvenile elephants (1-8 years)",
          "Cyanosis (dark purple-blue discoloration) of tongue tip",
          "Edema of face, neck, and trunk base",
          "Internal hemorrhages",
          "Death within 24-72 hours"
        ],
        "causes": "EEHV-1A/1B herpesvirus causing severe endothelial damage and capillary leakage.",
        "treatment": "Critical emergency: Immediate high-dose Famciclovir (oral/rectal) or Ganciclovir IV. Plasma transfusion from healthy adult donor elephants. Aggressive IV fluid therapy, anti-inflammatories, and intensive round-the-clock veterinary monitoring.",
        "prevention": [
          "Routine weekly blood PCR screening in juvenile camp elephants",
          "Minimize transport and weaning stress"
        ]
      },
      {
        "id": 2,
        "name": "Foot Rot & Pododermatitis",
        "nameHi": "पैर और नाखून सड़न",
        "symptoms": [
          "Reluctance to walk or bear weight on foot",
          "Deep cracks and cavities in sole pad and nail cuticles",
          "Foul necrotic discharge",
          "Subsolar abscess formation"
        ],
        "causes": "Walking on hard concrete, lack of abrasive natural earth, damp standing stalls, and penetrating foreign bodies.",
        "treatment": "Surgical debridement of necrotic sole horn and cuticles by veterinary mahout. Soak foot in 5% Copper Sulfate or diluted povidone-iodine footbath for 30 minutes daily. Pack clean cracks with antiseptic gauze and fit protective elephant leather boot. Walk on soft natural earth.",
        "prevention": [
          "House elephants on natural earthen/sand paddocks, never concrete",
          "Daily foot inspection and washing",
          "Regular nail trimming"
        ]
      },
      {
        "id": 3,
        "name": "Anthrax in Elephants",
        "nameHi": "एंथ्रेक्स रोग",
        "symptoms": [
          "Sudden spiking fever and shivering",
          "Severe edema of throat, chest, and abdomen",
          "Sudden death with dark uncoagulated tarry blood oozing from trunk, mouth, and anus"
        ],
        "causes": "Bacillus anthracis spores ingested from contaminated soil or watering holes.",
        "treatment": "Penicillin G in massive veterinary doses (10-20 million units) IV/IM if caught in earliest febrile stage. Never open or dissect an anthrax carcass (prevents spore formation); deep burial with quicklime.",
        "prevention": [
          "Annual anthrax spore vaccine for camp elephants living near sanctuaries or endemic areas",
          "Strict prohibition of grazing near known carcass sites and deep burial with quicklime"
        ]
      }
    ]
  },
  "parrot": {
    "name": "Parrot",
    "nameHi": "तोता",
    "image": "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=800",
    "description": "Parrots and companion parakeets are intelligent, colorful pet birds known for vocal mimicry and playful social bonds.",
    "diseases": [
      {
        "id": 1,
        "name": "Psittacosis (Parrot Fever / Chlamydiosis)",
        "nameHi": "तोता बुखार (सिटाकोसिस)",
        "symptoms": [
          "Ruffled feathers and shivering",
          "Lime-green or yellowish watery droppings",
          "Severe conjunctivitis and swollen runny eyes",
          "Nasal discharge and labored breathing",
          "Rapid weight loss. (Zoonotic!)"
        ],
        "causes": "Chlamydia psittaci intracellular bacteria spread through dust from dried droppings and feather dander.",
        "treatment": "Treatment must continue strictly for 45 consecutive days: Oral Doxycycline syrup or medicated mash prescribed by avian vet. Supportive warmth in an incubator (28-30°C). Clean eyes with sterile saline. Caretaker must wear N95 mask and gloves when cleaning cage.",
        "prevention": [
          "30-day quarantine and testing for new birds",
          "Daily cage lining replacement",
          "Never dry-sweep bird droppings"
        ]
      },
      {
        "id": 2,
        "name": "Scaly Face & Leg Mites",
        "nameHi": "चेहरे और पैरों की पपड़ी",
        "symptoms": [
          "Chalky white honeycomb-like crusty growths around beak, nostrils (cere), eyes, and feet",
          "Overgrown deformed beak",
          "Constant face scratching on perches"
        ],
        "causes": "Knemidocoptes pilae burrowing microscopic mites.",
        "treatment": "Topical spot-on Ivermectin (0.1% formulation, 1 tiny drop directly on bare skin of back of neck, repeat in 14 days). Gently dab mineral oil or liquid paraffin on beak crusts with a cotton bud to suffocate mites. Disinfect cage perches in boiling water.",
        "prevention": [
          "Quarantine new birds",
          "Disinfect perches and cages regularly"
        ]
      },
      {
        "id": 3,
        "name": "Feather Plucking & Self-Mutilation",
        "nameHi": "पंख नोचना (व्यवहार विकार)",
        "symptoms": [
          "Severe feather loss on chest, flanks, and back while head feathers remain intact",
          "Chewing at skin causing bleeding wounds",
          "Screeching and agitation"
        ],
        "causes": "Boredom, lack of foraging stimulation, zinc toxicity, liver disease, giardia, or low air humidity.",
        "treatment": "Veterinary workup to rule out parasites or organ disease. Provide interactive foraging toys, fresh leafy greens, and chewable branches (guava/eucalyptus). Increase daily flight and social time. Mist bird with warm water spray daily. Add Omega-3 fatty acids.",
        "prevention": [
          "Varied diet: 70% quality pellets, fresh vegetables, limited seeds",
          "10-12 hours of quiet dark sleep every night"
        ]
      }
    ]
  },
  "pigeon": {
    "name": "Pigeon",
    "nameHi": "कबूतर",
    "image": "https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=800",
    "description": "Pigeons and doves are robust flock birds kept across India for sport, show, homing, and cultural affection.",
    "diseases": [
      {
        "id": 1,
        "name": "Pigeon Paramyxovirus (PPMV-1)",
        "nameHi": "कबूतर का लकवा (चक्कर रोग)",
        "symptoms": [
          "Twisted neck (torticollis) and stargazing",
          "Inability to peck grains accurately",
          "Circling and wing paralysis",
          "Watery bright green droppings"
        ],
        "causes": "Avian orthoavulavirus-1 adapted to pigeons, spread through loft dust and droppings.",
        "treatment": "No antiviral cure, but supportive nursing helps many recover in 4-6 weeks: Hand-feed soaked pellets and corn; supply water with electrolytes and Vitamin B-complex (Neurobion). Keep in warm, quiet, padded cage away from other birds.",
        "prevention": [
          "Annual PPMV vaccination (subcutaneous in neck) given to all loft pigeons",
          "Quarantine newly acquired birds for 21 days before introducing to loft"
        ]
      },
      {
        "id": 2,
        "name": "Canker (Trichomoniasis)",
        "nameHi": "कैंकर (गले में पीले दाने)",
        "symptoms": [
          "Yellow cheesy plaques in mouth, throat, and crop",
          "Foul breath from beak",
          "Difficulty swallowing grains",
          "Vomiting water and rapid weight loss"
        ],
        "causes": "Trichomonas gallinae protozoan parasite transmitted through shared drinking water and crop milk fed to squabs.",
        "treatment": "Antiprotozoal medication: Ronidazole (10%), Metronidazole (20-30 mg/kg once daily for 5-7 days), or Carnidazole tablet. Add apple cider vinegar (5 ml per liter) to drinking water to keep crop acidic.",
        "prevention": [
          "Clean and dry drinking drinkers daily",
          "Treat breeding pairs before mating so squabs are not infected"
        ]
      },
      {
        "id": 3,
        "name": "Pigeon Pox",
        "nameHi": "कबूतर चेचक",
        "symptoms": [
          "Hard wart-like yellow-brown scabs on cere, eyelids, corners of beak, and feet",
          "Eye swelling obstructing vision",
          "Difficulty pecking seeds and breathing through nostrils"
        ],
        "causes": "Pigeonpox virus spread by mosquito bites and fighting pecks.",
        "treatment": "Dab nodules gently with povidone-iodine solution. Add multivitamins (especially Vitamin A) and broad-spectrum antibiotic to drinking water to prevent secondary infection. Do not forcefully peel crusts.",
        "prevention": [
          "Pigeon pox vaccine applied by feather-follicle brush method on thigh",
          "Mosquito screening for lofts"
        ]
      }
    ]
  },
  "bengal-tiger": {
    "name": "Bengal Tiger",
    "nameHi": "बंगाल टाइगर",
    "image": "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=800",
    "description": "The Bengal Tiger is India's iconic national animal and apex predator of the subcontinent's wilderness.",
    "diseases": [
      {
        "id": 1,
        "name": "Canine Distemper in Big Cats",
        "nameHi": "कैनाइन डिस्टेंपर (बाघ)",
        "symptoms": [
          "Loss of natural fear of humans",
          "Disorientation and circling",
          "Muscle twitching and ataxia",
          "Severe pneumonia and lethargy",
          "Inability to hunt"
        ],
        "causes": "Canine distemper virus spillover from feral dogs living on fringes of tiger reserves.",
        "treatment": "Wildlife emergency: Remote dart immobilization for clinical care. Intensive fluid therapy, injectable broad-spectrum antibiotics for pneumonia, anticonvulsants (Diazepam/Levetiracetam), and neuro-protective B-vitamins in sanctuary hospital enclosure.",
        "prevention": [
          "Ring vaccination of all domestic and stray dogs around national park buffer zones",
          "Wildlife health surveillance"
        ]
      },
      {
        "id": 2,
        "name": "Sarcoptic Mange in Tigers",
        "nameHi": "बाघ की खाज (माइट्स)",
        "symptoms": [
          "Severe hair loss (alopecia)",
          "Thick hyperkeratotic crusts and bleeding sores over face, neck, and tail",
          "Extreme emaciation due to relentless itching"
        ],
        "causes": "Sarcoptes scabiei mites transmitted through contact with infected prey or shared resting spots.",
        "treatment": "Remote dart delivery of Ivermectin (0.2-0.3 mg/kg) or Fluralaner (Bravecto) formulated in dart or medicated meat bait under wildlife department protocols. Supportive nutrient supplementation in enclosure.",
        "prevention": [
          "Health monitoring of prey base and exclusion of infected livestock from core tiger zones",
          "Prompt quarantine and veterinary dart treatment of wild carnivores exhibiting patchy alopecia"
        ]
      },
      {
        "id": 3,
        "name": "Bovine Tuberculosis in Tigers",
        "nameHi": "बोवाइन टीबी (तपेदिक)",
        "symptoms": [
          "Chronic progressive weight loss ('wasting')",
          "Intermittent dry coughing",
          "Low stamina",
          "Swollen peripheral lymph nodes"
        ],
        "causes": "Mycobacterium bovis contracted from feeding on infected domestic cattle grazing illegally inside forests.",
        "treatment": "Diagnostic quarantine in rescue center: Standard multi-drug antimycobacterial regimen under strict biosafety and zoo veterinary council direction.",
        "prevention": [
          "Enforce livestock health screening in forest corridors and prevent infected carcasses from entering tiger habitats",
          "Routine quarantine, biosafety protocols, and regular mycobacterial screening in zoological rescue parks"
        ]
      }
    ]
  }
};

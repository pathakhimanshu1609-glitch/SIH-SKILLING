// mcq_question_bank.js
// Seed data for per-skill MCQ assessment (used for BOTH pre-training and post-training phases).
// correct_index is 0-based, pointing into the options array.

export const questionBank = [
  // ---------------- ADVANCED CNC MACHINIST ----------------
  {
    trade: "Advanced CNC Machinist",
    skill: "CNC Programming (G-code)",
    questions: [
      {
        question: "What does the G01 command represent in G-code programming?",
        options: ["Rapid positioning", "Linear interpolation (cutting move)", "Circular interpolation clockwise", "Dwell command"],
        correct_index: 1,
      },
      {
        question: "Which G-code command is used for rapid traverse movement (non-cutting)?",
        options: ["G00", "G01", "G02", "G04"],
        correct_index: 0,
      },
      {
        question: "In CNC programming, what does 'M03' typically command?",
        options: ["Spindle stop", "Spindle on clockwise", "Coolant on", "Program end"],
        correct_index: 1,
      },
    ],
  },
  {
    trade: "Advanced CNC Machinist",
    skill: "Machine Setup & Calibration",
    questions: [
      {
        question: "What is the purpose of setting a work offset (e.g., G54) on a CNC machine?",
        options: ["To define tool length", "To define the workpiece origin relative to machine home", "To set spindle speed", "To calibrate coolant flow"],
        correct_index: 1,
      },
      {
        question: "Which instrument is commonly used to check spindle runout during calibration?",
        options: ["Vernier caliper", "Dial indicator", "Micrometer", "Feeler gauge"],
        correct_index: 1,
      },
      {
        question: "Why is tool length offset (TLO) measurement critical before running a program?",
        options: ["To prevent tool collision and ensure correct Z-depth", "To increase spindle speed", "To reduce coolant usage", "To change the work coordinate system"],
        correct_index: 0,
      },
    ],
  },
  {
    trade: "Advanced CNC Machinist",
    skill: "Quality & Precision Measurement",
    questions: [
      {
        question: "Which instrument typically gives the most precise linear measurement?",
        options: ["Steel rule", "Vernier caliper", "Micrometer", "Try square"],
        correct_index: 2,
      },
      {
        question: "What does 'tolerance' refer to in precision machining?",
        options: ["The hardness of the material", "The allowable variation in a dimension", "The cutting speed", "The coolant type used"],
        correct_index: 1,
      },
      {
        question: "A surface roughness value (Ra) measures what?",
        options: ["Weight of the part", "Texture/finish quality of a machined surface", "Hardness of the material", "Thermal expansion rate"],
        correct_index: 1,
      },
    ],
  },
  {
    trade: "Advanced CNC Machinist",
    skill: "Safety & Maintenance",
    questions: [
      {
        question: "What should be worn/avoided when operating a CNC machine?",
        options: ["Loose clothing and jewelry are fine", "Safety glasses, and no loose clothing/jewelry", "Sandals are recommended", "No PPE is required"],
        correct_index: 1,
      },
      {
        question: "What is the purpose of routine lubrication of machine slideways?",
        options: ["To reduce friction and wear for smooth movement", "To increase operating noise", "To reduce spindle speed", "To change the tool material"],
        correct_index: 0,
      },
      {
        question: "What should be done before performing maintenance on a CNC machine?",
        options: ["Keep the machine powered on", "Lock out/tag out (isolate power)", "Increase the feed rate", "Remove safety guards permanently"],
        correct_index: 1,
      },
    ],
  },

  // ---------------- SOLAR PV INSTALLER & TECHNICIAN ----------------
  {
    trade: "Solar PV Installer & Technician",
    skill: "PV System Design",
    questions: [
      {
        question: "What primarily determines the number of solar panels needed for a given load?",
        options: ["Roof color", "Total energy consumption and panel wattage", "Distance from the grid", "Inverter brand alone"],
        correct_index: 1,
      },
      {
        question: "What is the typical panel orientation for maximum sun exposure in India (Northern Hemisphere)?",
        options: ["North-facing", "South-facing", "East-facing only", "West-facing only"],
        correct_index: 1,
      },
      {
        question: "What does 'kWp' stand for in solar system sizing?",
        options: ["Kilowatt-peak (rated capacity)", "Kilowatt-per-hour", "Kilo-watt-panel", "Kilo-watt-production"],
        correct_index: 0,
      },
    ],
  },
  {
    trade: "Solar PV Installer & Technician",
    skill: "Electrical Wiring & Safety",
    questions: [
      {
        question: "What is the purpose of a DC isolator in a solar PV system?",
        options: ["To increase voltage", "To safely disconnect DC power for maintenance/safety", "To convert AC to DC", "To measure sunlight intensity"],
        correct_index: 1,
      },
      {
        question: "Why should panels with mismatched electrical ratings not be wired in series?",
        options: ["It looks unprofessional", "It can reduce system efficiency and cause hotspots", "It's only a cosmetic issue", "It increases voltage indefinitely"],
        correct_index: 1,
      },
      {
        question: "What safety equipment is essential when working on rooftop solar installations?",
        options: ["Fall protection harness", "Sunglasses only", "An umbrella", "No special equipment needed"],
        correct_index: 0,
      },
    ],
  },
  {
    trade: "Solar PV Installer & Technician",
    skill: "Installation & Mounting",
    questions: [
      {
        question: "What is the purpose of adjusting a mounting structure's tilt angle?",
        options: ["To optimize sun exposure based on latitude and season", "To reduce panel weight", "To increase panel size", "To change panel color"],
        correct_index: 0,
      },
      {
        question: "Which material is commonly used for solar mounting frames due to corrosion resistance?",
        options: ["Mild steel", "Aluminum", "Plastic", "Wood"],
        correct_index: 1,
      },
      {
        question: "What should be checked before finalizing panel mounting on a rooftop?",
        options: ["Structural load-bearing capacity of the roof", "Panel color", "Inverter brand", "Internet connectivity"],
        correct_index: 0,
      },
    ],
  },
  {
    trade: "Solar PV Installer & Technician",
    skill: "Troubleshooting & Maintenance",
    questions: [
      {
        question: "A sudden drop in solar system output is most commonly caused by:",
        options: ["Panel shading or dust accumulation", "Too much sunlight", "Correctly done wiring", "Installing a new inverter"],
        correct_index: 0,
      },
      {
        question: "Which tool is used to measure DC voltage/current output for troubleshooting?",
        options: ["Multimeter", "Micrometer", "Vernier caliper", "Thermometer only"],
        correct_index: 0,
      },
      {
        question: "How often should solar panels typically be cleaned in dusty regions?",
        options: ["Never", "Periodically (e.g., every few weeks/month) depending on dust levels", "Once every 10 years", "Multiple times a day"],
        correct_index: 1,
      },
    ],
  },

  // ---------------- EV BATTERY MAINTENANCE SPECIALIST ----------------
  {
    trade: "EV Battery Maintenance Specialist",
    skill: "Battery Chemistry & BMS",
    questions: [
      {
        question: "What does BMS stand for in EV batteries?",
        options: ["Battery Management System", "Basic Motor System", "Battery Mounting Structure", "Brake Management System"],
        correct_index: 0,
      },
      {
        question: "What is the primary function of a Battery Management System?",
        options: ["Monitor and protect battery cells (voltage, temperature, charge balance)", "Increase vehicle speed", "Control the radio", "Change tire pressure"],
        correct_index: 0,
      },
      {
        question: "Which battery chemistry is most commonly used in modern EVs?",
        options: ["Lead-acid", "Lithium-ion", "Nickel-cadmium", "Alkaline"],
        correct_index: 1,
      },
    ],
  },
  {
    trade: "EV Battery Maintenance Specialist",
    skill: "High-Voltage Electrical Safety",
    questions: [
      {
        question: "What is the recommended first step before servicing an EV's high-voltage battery pack?",
        options: ["Disconnect the high-voltage system via the service disconnect/isolation procedure", "Start the engine", "Touch the terminals directly to test", "Remove the wheels"],
        correct_index: 0,
      },
      {
        question: "What PPE is required when working on high-voltage EV components?",
        options: ["Insulated gloves rated for high voltage", "Regular cotton gloves", "No gloves needed", "Sandals"],
        correct_index: 0,
      },
      {
        question: "Why is it dangerous to work on an EV battery without proper training?",
        options: ["Risk of electric shock/arc flash from high-voltage DC systems", "Risk of running out of fuel", "No real danger exists", "Risk of a flat tire"],
        correct_index: 0,
      },
    ],
  },
  {
    trade: "EV Battery Maintenance Specialist",
    skill: "Diagnostics & Fault Detection",
    questions: [
      {
        question: "What tool is commonly used to diagnose EV battery faults via onboard diagnostics?",
        options: ["OBD-II scanner", "Vernier caliper", "Screwdriver only", "Tire pressure gauge"],
        correct_index: 0,
      },
      {
        question: "A significant, unexplained drop in battery range most likely indicates:",
        options: ["Cell degradation or imbalance", "New tires were fitted", "A clean windshield", "Correct tire pressure"],
        correct_index: 0,
      },
      {
        question: "What does a 'thermal runaway' event in a battery refer to?",
        options: ["An uncontrolled temperature increase that can lead to fire/explosion", "Normal cooling process", "Standard charging behavior", "A routine software update"],
        correct_index: 0,
      },
    ],
  },
  {
    trade: "EV Battery Maintenance Specialist",
    skill: "Maintenance & Disposal",
    questions: [
      {
        question: "Why must damaged EV batteries be handled/disposed of per specific regulations?",
        options: ["They pose fire/chemical hazards and contain recyclable materials", "They are worthless", "They can be thrown in regular trash", "No special handling is needed"],
        correct_index: 0,
      },
      {
        question: "Which routine check helps prevent premature battery degradation?",
        options: ["Monitoring state of charge and avoiding extreme temperature exposure", "Ignoring battery status entirely", "Overcharging regularly", "Disconnecting the BMS"],
        correct_index: 0,
      },
      {
        question: "Which of these is a common warning sign that a battery pack needs professional inspection?",
        options: ["Unusual swelling, smell, or rapid capacity loss", "A new paint color on the vehicle", "A different tire brand fitted", "Standard, expected charging time"],
        correct_index: 0,
      },
    ],
  },
];

export default questionBank;

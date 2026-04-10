// --- BACKGROUND STARS ---
function createStars() {
    const container = document.getElementById('particle-container');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Randomize
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        
        star.style.animationDuration = `${Math.random() * 3 + 2}s, ${Math.random() * 20 + 10}s`;
        star.style.animationDelay = `${Math.random() * 3}s, ${Math.random() * 10}s`;
        
        container.appendChild(star);
    }
}

// --- INITIALIZE ICONS ---
lucide.createIcons();
createStars();

// --- MAP & MARKER SETUP ---
// Init map, centering at 0,0 with zoom level 2
const map = L.map('iss-map', {
    zoomControl: false,
    attributionControl: false
}).setView([0, 0], 3);

// Using a standard OSM tile layer (CSS filters make it dark mode)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
}).addTo(map);

// Add custom zoom control to right side
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Custom ISS Icon
const issIcon = L.divIcon({
    className: 'custom-iss-icon',
    html: `
        <div style="
            width: 40px; 
            height: 40px; 
            background: rgba(0, 240, 255, 0.2); 
            border: 2px solid #00f0ff; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 0 15px #00f0ff;
            animation: pulse 2s infinite;
        ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2.05v3.15"></path><path d="M11 2.05v3.15"></path><path d="M2.05 13h3.15"></path><path d="M2.05 11h3.15"></path><path d="M21.95 13h-3.15"></path><path d="M21.95 11h-3.15"></path><path d="M13 21.95v-3.15"></path><path d="M11 21.95v-3.15"></path><rect width="8" height="8" x="8" y="8" rx="2"></rect><circle cx="12" cy="12" r="1"></circle>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

let issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Path tracking
let orbitPathPoints = [];
let orbitPolyline = L.polyline([], {
    color: '#00f0ff',
    weight: 2,
    opacity: 0.6,
    dashArray: '5, 10'
}).addTo(map);

// --- TELEMETRY & API FETCHING ---
const URL_ISS_POS = 'https://api.wheretheiss.at/v1/satellites/25544';
const URL_ASTROS = 'http://api.open-notify.org/astros.json';

const elements = {
    latLng: document.getElementById('coordinates-display'),
    alt: document.getElementById('alt-value'),
    vel: document.getElementById('vel-value'),
    crewList: document.getElementById('crew-list'),
    crewCount: document.getElementById('crew-count')
};

let mapPanned = false; 

async function updateISSPosition() {
    try {
        const response = await fetch(URL_ISS_POS);
        const data = await response.json();
        
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        const alt = parseFloat(data.altitude);
        const vel = parseFloat(data.velocity);

        // Update UI
        elements.latLng.textContent = `LAT: ${lat.toFixed(4)}° | LNG: ${lng.toFixed(4)}°`;
        elements.alt.textContent = alt.toFixed(1);
        elements.vel.textContent = Math.round(vel).toLocaleString();
        
        // Update Map
        issMarker.setLatLng([lat, lng]);
        
        if (!mapPanned) {
            map.panTo([lat, lng]);
            mapPanned = true;
        }

        // Update orbit trail
        orbitPathPoints.push([lat, lng]);
        if (orbitPathPoints.length > 200) {
            orbitPathPoints.shift();
        }
        orbitPolyline.setLatLngs(orbitPathPoints);

    } catch (error) {
        console.error("Error fetching ISS telemetry:", error);
    }
}

// True State of Humans in Space - April 2026 (From whoisinspace.com)
const HUMANS_IN_SPACE = [
    // Artemis II
    { name: "Reid Wiseman", craft: "Orion", mission: "Artemis II", nat: "USA", code: "us" },
    { name: "Victor J. Glover", craft: "Orion", mission: "Artemis II", nat: "USA", code: "us" },
    { name: "Christina H. Koch", craft: "Orion", mission: "Artemis II", nat: "USA", code: "us" },
    { name: "Jeremy R. Hansen", craft: "Orion", mission: "Artemis II", nat: "Canada", code: "ca" },
    
    // ISS - Soyuz MS-28
    { name: "Christopher Williams", craft: "ISS", mission: "Soyuz MS-28", nat: "USA", code: "us" },
    { name: "Sergey Kud-Sverchkov", craft: "ISS", mission: "Soyuz MS-28", nat: "Russia", code: "ru" },
    { name: "Sergei Mikayev", craft: "ISS", mission: "Soyuz MS-28", nat: "Russia", code: "ru" },
    
    // ISS - SpaceX Crew-12
    { name: "Jessica Meir", craft: "ISS", mission: "SpaceX Crew-12", nat: "USA", code: "us" },
    { name: "Jack Hathaway", craft: "ISS", mission: "SpaceX Crew-12", nat: "USA", code: "us" },
    { name: "Sophie Adenot", craft: "ISS", mission: "SpaceX Crew-12", nat: "France", code: "fr" },
    { name: "Andrey Fedyaev", craft: "ISS", mission: "SpaceX Crew-12", nat: "Russia", code: "ru" },
    
    // Tiangong - Shenzhou 21
    { name: "Zhang Lu", craft: "Tiangong", mission: "Shenzhou 21", nat: "China", code: "cn" },
    { name: "Wu Fei", craft: "Tiangong", mission: "Shenzhou 21", nat: "China", code: "cn" },
    { name: "Zhang Hongzhang", craft: "Tiangong", mission: "Shenzhou 21", nat: "China", code: "cn" },
];

function fetchCrew() {
    try {
        // Filter strictly for ISS
        const issCrew = HUMANS_IN_SPACE.filter(p => p.craft === 'ISS');
        
        elements.crewCount.textContent = `${issCrew.length} ONBOARD`;
        elements.crewList.innerHTML = '';
        
        issCrew.forEach((person, index) => {
            const flagUrl = `https://flagcdn.com/${person.code}.svg`;
            
            const li = document.createElement('li');
            li.className = 'crew-item';
            li.style.animationDelay = `${index * 0.1}s`;
            
            li.innerHTML = `
                <div class="crew-avatar">
                    <i data-lucide="user"></i>
                </div>
                <div class="crew-info">
                    <div class="crew-name">${person.name}</div>
                    <div class="crew-nat">
                        <img src="${flagUrl}" class="flag" alt="${person.nat} Flag" title="${person.nat}">
                        <span class="crew-role">${person.nat} | ${person.mission}</span>
                    </div>
                </div>
            `;
            elements.crewList.appendChild(li);
        });
        
        // Render All Humans in Space Section
        renderAllHumans();
        
        lucide.createIcons();
        
    } catch (error) {
        console.error("Error setting Crew:", error);
        elements.crewList.innerHTML = `<div class="loader" style="color:var(--danger)">SYSTEM ERROR</div>`;
    }
}

function renderAllHumans() {
    const totalCountEl = document.getElementById('total-humans-count');
    const gridEl = document.getElementById('all-astronauts-grid');
    
    if(!totalCountEl || !gridEl) return;
    
    totalCountEl.textContent = `${HUMANS_IN_SPACE.length} TOTAL`;
    gridEl.innerHTML = '';
    
    // Group by mission
    const missions = {};
    HUMANS_IN_SPACE.forEach(p => {
        if (!missions[p.mission]) {
            missions[p.mission] = { craft: p.craft, members: [] };
        }
        missions[p.mission].members.push(p);
    });
    
    for (const [missionName, data] of Object.entries(missions)) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'spacecraft-group';
        
        let membersHTML = '';
        data.members.forEach(m => {
            membersHTML += `
                <div class="crew-item" style="margin-bottom: 0.5rem; background: rgba(0,0,0,0.5);">
                    <img src="https://flagcdn.com/${m.code}.svg" class="flag" style="width: 20px;">
                    <div class="crew-info" style="margin-left: 10px;">
                        <div class="crew-name" style="font-size: 0.95rem;">${m.name}</div>
                    </div>
                </div>
            `;
        });
        
        groupDiv.innerHTML = `
            <div class="spacecraft-header">
                <span>${data.craft}</span>
                <span class="spacecraft-mission">${missionName}</span>
            </div>
            <div class="spacecraft-members">
                ${membersHTML}
            </div>
        `;
        
        gridEl.appendChild(groupDiv);
    }
}

// Main Loop
function startSystem() {
    updateISSPosition();
    fetchCrew();
    
    // Poll telemetry every 2 seconds
    setInterval(updateISSPosition, 2000);
    // Poll crew every 5 minutes
    setInterval(fetchCrew, 300000);
}

startSystem();

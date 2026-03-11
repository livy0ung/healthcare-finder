 /*************************************
 * 1) DOM ELEMENTS
 *************************************/
const residencySelect = document.getElementById("residency");
const primaryInsuranceSelect = document.getElementById("primary-insurance");
const ssmuSelect = document.getElementById("ssmu");
const needSelect = document.getElementById("need");
const problemWrapper = document.getElementById("problem-wrapper");
const problemSelect = document.getElementById("problem");
const form = document.getElementById("healthcare-form");
const resultsDiv = document.getElementById("results");

const searchView = document.getElementById("search-view");
const detailsView = document.getElementById("details-view");
const detailsCard = document.getElementById("details-card");
const breadcrumb = document.getElementById("details-breadcrumb");
const backBtn = document.getElementById("back-btn");

/*************************************
 * 2) SMALL HELPERS
 *************************************/
function getPrimaryInsuranceFromResidency(residency) {
  if (residency === "local") return "ramq";
  if (residency === "out") return "other_prov";
  if (residency === "international") return "bluecross";
  return "ramq";
}

function updatePrimaryInsurance() {
  primaryInsuranceSelect.value = getPrimaryInsuranceFromResidency(residencySelect.value);
}

function insuranceLabel(key) {
  const labels = {
    ramq: "RAMQ",
    other_prov: "Other Provincial",
    bluecross: "Blue Cross",
    ssmu: "SSMU/MCSS"
  };
  return labels[key] || key;
}

function getSelectedInsurance(residency, ssmuValue) {
  const insurance = [getPrimaryInsuranceFromResidency(residency)];
  if (ssmuValue === "yes") insurance.push("ssmu");
  return insurance;
}

function getSelectedInsuranceCols(insurance) {
  if (!insurance || insurance.length === 0) return [];
  return insurance.filter(x => x !== "none");
}

function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}

/*************************************
 * 3) DATA
 *************************************/
const problemOptions = {
  general: [
    { value: "minor_illness", label: "Minor illness (cold, flu, sore throat, fever)" },
    { value: "physical_injury", label: "Physical injury (sprain, strain, minor fracture)" },
    { value: "ongoing_pain", label: "Ongoing pain (headache, back pain, joint pain)" },
    { value: "skin", label: "Skin concerns (rash, acne, infection)" },
    { value: "digestive", label: "Stomach or digestive issues" },
    { value: "medication", label: "Medication questions or refills" },
    { value: "chronic", label: "Chronic condition management (asthma, diabetes, etc.)" },
    { value: "forms", label: "Medical forms or doctor’s note" },
    { value: "other", label: "Not sure / something else" }
  ]
};

const MCGILL_CENTER = {
  name: "McGill University (Downtown Campus)",
  lat: 45.5048,
  lng: -73.5772
};

const virtualResources = [
  {
    id: "info-sante-811",
    name: "Info-Santé 811",
    url: "https://www.quebec.ca/en/health/finding-a-resource/info-sante-811",
    needs: ["urgent", "general", "mental", "sexual"],
    description: "Free phone line to connect with a nurse for non-urgent health advice (24/7)."
  },
  {
    id: "dialogue",
    name: "Dialogue",
    url: "https://studentcare.ca/rte/en/McGillUniversityundergraduatestudentsSSMU_Dialogue_Dialogue",
    needs: ["urgent", "general", "mental", "sexual"],
    acceptedInsurance: ["ramq", "other_prov", "ssmu"],
    description: "An online platform that allows you to virtually connect with nurses and physicians via a mobile or web app from anywhere in Canada, free of charge."
  },
  {
    id: "maple",
    name: "Maple",
    url: "https://www.mcgill.ca/internationalstudents/health/benefits/maple-virtual-care",
    needs: ["urgent", "general", "mental", "sexual"],
    acceptedInsurance: ["bluecross"],
    description: "24/7 on-demand access to doctors by secure text or video for advice, diagnosis and prescriptions, free of charge."
  },
  {
    id: "guardme",
    name: "GuardMe",
    url: "https://studentsupport.telushealth.com/gmssp/ca/home",
    needs: ["mental"],
    description: "A mental health counselling service that provides 24/7 access to licensed counsellors through telephone or mobile chat, free of charge."
  }
];

// keep your existing locations array here unchanged
const locations = [
  // ... your current location objects ...
];

/*************************************
 * 4) COVERAGE + DETAILS HELPERS
 *************************************/
function buildCoverageTableHTML(location, selectedInsurance) {
  const cols = getSelectedInsuranceCols(selectedInsurance);

  if (cols.length === 0) {
    return `
      <p class="muted">
        <em>No insurance selected. Select insurance on the first page to see coverage by plan.</em>
      </p>
    `;
  }

  const coverage = location.coverageByService || {};
  const serviceNames = Object.keys(coverage);

  if (serviceNames.length === 0) {
    return `<p class="muted"><em>No services listed yet for this location.</em></p>`;
  }

  let html = `<table class="coverage-table">`;
  html += `<tr>
    <th>Service</th>
    ${cols.map(k => `<th>${insuranceLabel(k)}</th>`).join("")}
  </tr>`;

  serviceNames.forEach(serviceName => {
    const planMap = coverage[serviceName] || {};
    html += `<tr>
      <td><strong>${serviceName}</strong></td>
      ${cols.map(k => `<td>${planMap[k] ?? "Varies / check plan"}</td>`).join("")}
    </tr>`;
  });

  html += `</table>`;
  return html;
}

function getOtherProvClinicDisclaimer(location, selectedInsurance) {
  const hasOtherProv = selectedInsurance.includes("other_prov");

  if (hasOtherProv && location.otherProvDisclaimer) {
    return `
      <p class="muted" style="margin-top:0.75rem;">
        <strong>Out-of-province note:</strong> ${location.otherProvDisclaimer}
      </p>
    `;
  }

  return "";
}

/*************************************
 * 5) MAP
 *************************************/
let serviceMap = null;
let serviceMarkers = [];
const geocodeCache = new Map();

function showMapUI() {
  document.getElementById("map-wrapper").style.display = "block";
}

function hideMapUI() {
  document.getElementById("map-wrapper").style.display = "none";
}

function createMarkerIcon(clinicType) {
  const typeClass = clinicType === "private" ? "marker-private" : "marker-public";

  return L.divIcon({
    className: "",
    html: `<div class="marker-pin ${typeClass}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });
}

function initServiceMap() {
  if (serviceMap) return;

  serviceMap = L.map("service-map").setView([MCGILL_CENTER.lat, MCGILL_CENTER.lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(serviceMap);

  L.marker([MCGILL_CENTER.lat, MCGILL_CENTER.lng]).addTo(serviceMap)
    .bindPopup(`<b>${MCGILL_CENTER.name}</b>`);

  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "map-legend");
    div.innerHTML = `
      <strong>Service type</strong>
      <div class="map-legend-row">
        <span class="map-legend-swatch map-legend-public"></span>
        <span>Public</span>
      </div>
      <div class="map-legend-row">
        <span class="map-legend-swatch map-legend-private"></span>
        <span>Private</span>
      </div>
    `;
    return div;
  };
  legend.addTo(serviceMap);
}

function clearMarkers() {
  serviceMarkers.forEach(marker => marker.remove());
  serviceMarkers = [];
}

async function geocodeAddress(address) {
  if (!address) return null;
  if (geocodeCache.has(address)) return geocodeCache.get(address);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  try {
    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const result = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    if (Number.isFinite(result.lat) && Number.isFinite(result.lng)) {
      geocodeCache.set(address, result);
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

function getDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat + "," + lng)}`;
}

async function renderLocationsOnMap(matchingLocations, onClickLocation) {
  initServiceMap();
  clearMarkers();

  const resolved = [];
  for (const loc of matchingLocations) {
    let latLng = null;

    if (typeof loc.lat === "number" && typeof loc.lng === "number") {
      latLng = { lat: loc.lat, lng: loc.lng };
    } else {
      latLng = await geocodeAddress(loc.address);
    }

    resolved.push({ loc, latLng });
  }

  const boundsPoints = [[MCGILL_CENTER.lat, MCGILL_CENTER.lng]];

  for (const item of resolved) {
    if (!item.latLng) continue;

    boundsPoints.push([item.latLng.lat, item.latLng.lng]);

    const marker = L.marker(
      [item.latLng.lat, item.latLng.lng],
      { icon: createMarkerIcon(item.loc.clinicType) }
    ).addTo(serviceMap);

    marker.bindPopup(`<b>${item.loc.name}</b><br/><span class="muted">Click for details</span>`);
    marker.on("click", () => onClickLocation(item.loc, item.latLng));
    serviceMarkers.push(marker);
  }

  if (boundsPoints.length > 1) {
    serviceMap.fitBounds(boundsPoints, { padding: [30, 30] });
  } else {
    serviceMap.setView([MCGILL_CENTER.lat, MCGILL_CENTER.lng], 13);
  }

  return resolved;
}

/*************************************
 * 6) DETAILS PAGE
 *************************************/
let lastUserSelections = null;
let lastNeedLabel = "";
let lastProblemLabel = "";

function openDetailsPage(location, latLng) {
  if (!lastUserSelections) return;

  const directions = latLng ? getDirectionsUrl(latLng.lat, latLng.lng) : null;
  const otherProvClinicDisclaimer = getOtherProvClinicDisclaimer(location, lastUserSelections.insurance);
  const selectedCols = getSelectedInsuranceCols(lastUserSelections.insurance);

  const selectedBadges = selectedCols.length
    ? selectedCols.map(k => `<span class="pill">${insuranceLabel(k)}</span>`).join("")
    : `<span class="pill">No insurance selected</span>`;

  const tableHtml = buildCoverageTableHTML(location, lastUserSelections.insurance);

  breadcrumb.textContent = lastNeedLabel + (lastProblemLabel ? ` → ${lastProblemLabel}` : "");

  detailsCard.innerHTML = `
    <h2 style="margin-top:0;">${location.name}</h2>
    <div>${selectedBadges}</div>
    ${otherProvClinicDisclaimer}
    ${location.address ? `<p><strong>Address:</strong> ${location.address}</p>` : ""}
    ${location.url ? `<p><strong>Website:</strong> <a href="${location.url}" target="_blank" rel="noopener noreferrer">${location.url}</a></p>` : ""}
    ${location.waitTimesUrl ? `<p><a href="${location.waitTimesUrl}" target="_blank">Check emergency room wait times</a></p>` : ""}
    ${directions ? `<p><a href="${directions}" target="_blank" rel="noopener noreferrer">Get directions</a></p>` : ""}
    ${location.clinicType ? `<p><strong>Service type:</strong> ${capitalize(location.clinicType)}</p>` : ""}
    <hr style="border:none;border-top:1px solid #eee;margin:1rem 0;" />
    <h3>Services + Coverage (based on your selections)</h3>
    ${tableHtml}
    <p class="muted" style="margin-top:0.75rem;">
      Coverage can vary by eligibility, provider billing, and plan rules—confirm with the clinic and your plan.
    </p>
  `;

  searchView.style.display = "none";
  detailsView.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToResults() {
  detailsView.style.display = "none";
  searchView.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/*************************************
 * 7) FORM / FILTER UI
 *************************************/
function updateProblemDropdown() {
  const need = needSelect.value;

  if (problemOptions[need]) {
    problemWrapper.style.display = "block";
    problemSelect.innerHTML = "";

    problemOptions[need].forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.value;
      opt.textContent = p.label;
      problemSelect.appendChild(opt);
    });
  } else {
    problemWrapper.style.display = "none";
    problemSelect.innerHTML = "";
  }
}

function clinicMatchesFilters(location, need, problem, insurance) {
  if (!location.needs.includes(need)) return false;

  if (need === "general" && problem && location.problems && !location.problems.includes(problem)) {
    return false;
  }

  if (location.acceptedInsurance) {
    const hasMatchingInsurance = location.acceptedInsurance.some(ins => insurance.includes(ins));
    if (!hasMatchingInsurance) return false;
  }

  return true;
}

function resourceMatchesFilters(resource, need, insurance) {
  if (!resource.needs.includes(need)) return false;

  if (resource.acceptedInsurance) {
    const hasMatchingInsurance = resource.acceptedInsurance.some(ins => insurance.includes(ins));
    if (!hasMatchingInsurance) return false;
  }

  return true;
}

/*************************************
 * 8) RESULTS RENDERING
 *************************************/
function buildResourceCardsHTML(resources) {
  let html = `<h3>Virtual Care</h3>`;

  resources.forEach(r => {
    html += `
      <div class="card">
        <h3>${r.name}</h3>
        <p>${r.description || ""}</p>
        ${r.url ? `<p><a href="${r.url}" target="_blank" rel="noopener noreferrer">Learn more</a></p>` : ""}
      </div>
    `;
  });

  return html;
}

function buildLocationCardsHTML(resolved) {
  let html = `<h3>In Person Care</h3>`;

  resolved.forEach(({ loc, latLng }) => {
    const coordsNote = latLng ? "" : `<p class="muted"><em>(Pin not available yet — update the address or add coordinates.)</em></p>`;

    html += `
      <div class="card clickable" data-loc-id="${loc.id}">
        <h3>${loc.name}</h3>
        <p>${loc.address || ""}</p>
        ${coordsNote}
        <p class="muted"><em>Click to view details (website, services, coverage).</em></p>
      </div>
    `;
  });

  return html;
}

/*************************************
 * 9) APP STARTUP
 *************************************/
updatePrimaryInsurance();
updateProblemDropdown();

residencySelect.addEventListener("change", updatePrimaryInsurance);
needSelect.addEventListener("change", updateProblemDropdown);
backBtn.addEventListener("click", backToResults);

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const residency = residencySelect.value;
  const need = needSelect.value;
  const insurance = getSelectedInsurance(residency, ssmuSelect.value);
  const problem = problemWrapper.style.display !== "none" ? problemSelect.value : "";

  lastUserSelections = { residency, insurance };
  lastNeedLabel = needSelect.options[needSelect.selectedIndex].text;
  lastProblemLabel = (need === "general" && problemSelect.options.length)
    ? (problemSelect.options[problemSelect.selectedIndex]?.text || "")
    : "";

  const matchingResources = virtualResources.filter(r => resourceMatchesFilters(r, need, insurance));
  const matchingLocations = locations.filter(l => clinicMatchesFilters(l, need, problem, insurance));

  let html = `<h2>Results</h2><p class="muted">Click a resource or location to see details.</p>`;

  if (need === "general" && problem) {
    html += `<p><strong>Selected category:</strong> ${lastProblemLabel}</p>`;
  }

  if (need === "urgent") {
    html += `
      <div class="card">
        <h3>Emergency note</h3>
        <p>If you are in immediate danger or experiencing a medical emergency, call 911 or go to the nearest emergency department.</p>
      </div>
    `;
  }

  if (matchingResources.length) {
    html += buildResourceCardsHTML(matchingResources);
  }

  if (!matchingLocations.length) {
    resultsDiv.innerHTML = html + `<h3>In Person Care</h3><p>No locations found for that selection.</p>`;
    hideMapUI();
    return;
  }

  resultsDiv.innerHTML = html + `<p class="muted">Loading map and locations…</p>`;
  showMapUI();

  const resolved = await renderLocationsOnMap(matchingLocations, (loc, latLng) => {
    openDetailsPage(loc, latLng);
  });

  resultsDiv.innerHTML = html + buildLocationCardsHTML(resolved);

  document.querySelectorAll("[data-loc-id]").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-loc-id");
      const item = resolved.find(x => x.loc.id === id);
      if (!item) return;
      openDetailsPage(item.loc, item.latLng);
    });
  });
});
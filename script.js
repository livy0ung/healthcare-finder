 /***********************
     * 0) DATA (EDIT LATER)
     ***********************/
 
 const residencySelect = document.getElementById("residency");
 const primaryInsuranceSelect = document.getElementById("primary-insurance");
 const ssmuSelect = document.getElementById("ssmu");
 
 function getPrimaryInsuranceFromResidency(residency) {
   if (residency === "local") return "ramq";
   if (residency === "out") return "other_prov";
   if (residency === "international") return "bluecross";
   return "ramq";
 }
 
 function updatePrimaryInsurance() {
   const residency = residencySelect.value;
   const insuranceValue = getPrimaryInsuranceFromResidency(residency);
   primaryInsuranceSelect.value = insuranceValue;
 }
 
 updatePrimaryInsurance();
 residencySelect.addEventListener("change", updatePrimaryInsurance);
 residencySelect.addEventListener("input", updatePrimaryInsurance);
 
 
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

  // Resources = informational, not mapped
  const resources = [
    {
      id: "info-sante-811",
      name: "Info-Santé 811",
      url: "https://www.quebec.ca/en/health/finding-a-resource/info-sante-811",
      needs: ["urgent", "general", "mental", "sexual"],
      description: "Free phone line to connect with a nurse for non-urgent health advice (24/7)."
    }
  ];

  // Locations = physical places, mapped
  // NOTE: coverageByService is your “table data”.
  // Keys are service names; values map insurance -> text (you can later change to exact %/$).
  const locations = [
    {
      id: "mgh-er",
      name: "Montreal General Hospital (MUHC) – Emergency",
      needs: ["urgent"],
      address: "1650 Cedar Ave, Montréal, QC H3G 1A4",
      url: "https://muhc.ca/montreal-general-hospital",
      servicesOffered: ["Emergency assessment", "Urgent imaging/referrals", "Hospital-based emergency care"],
      coverageByService: {
        "Emergency assessment": {
          ramq: "Typically covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary (may cover extras)"
        },
        "Urgent imaging/referrals": {
          ramq: "Typically covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        },
        "Hospital-based emergency care": {
          ramq: "Typically covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        }
      },
      tags: ["Emergency room"]
    },
    {
      id: "chum-er",
      name: "CHUM – Emergency",
      needs: ["urgent"],
      address: "1001 Rue Sanguinet, Montréal, QC H2X 1R6",
      url: "https://www.chumontreal.qc.ca/le-chum-votre-hopital/nous-joindre",
      servicesOffered: ["Emergency assessment", "Hospital-based emergency care"],
      coverageByService: {
        "Emergency assessment": {
          ramq: "Typically covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary (may cover extras)"
        },
        "Hospital-based emergency care": {
          ramq: "Typically covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        }
      },
      tags: ["Emergency room"]
    },
    {
      id: "jgh-er",
      name: "Jewish General Hospital – Emergency",
      needs: ["urgent"],
      address: "3755 Chemin de la Côte-Sainte-Catherine, Montréal, QC H3T 1E2",
      url: "https://www.jgh.ca/care-services/emergency/",
      servicesOffered: ["Emergency assessment", "Hospital-based emergency care"],
      coverageByService: {
        "Emergency assessment": {
          ramq: "Typically covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        },
        "Hospital-based emergency care": {
          ramq: "Typically covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        }
      },
      tags: ["Emergency room"]
    },

    {
      id: "mcgill-wellness-hub",
      name: "McGill Student Wellness Hub",
      needs: ["general", "mental", "sexual"],
      problems: ["minor_illness", "physical_injury", "ongoing_pain", "skin", "digestive", "medication", "chronic", "forms", "other"],
      address: "McGill Downtown Campus, Montréal, QC",
      url: "https://www.mcgill.ca/wellness-hub/",
      servicesOffered: [
        "Appointments/referrals (depending on service)",
        "Navigation to McGill health services",
        "Wellness and mental health supports"
      ],
      coverageByService: {
        "Appointments/referrals (depending on service)": {
          ramq: "Varies by service (often covered if RAMQ-eligible)",
          other_prov: "Varies (reimbursement rules)",
          bluecross: "Varies (check plan)",
          ssmu: "Not primary (may help with some costs)"
        },
        "Navigation to McGill health services": {
          ramq: "N/A (navigation/support)",
          other_prov: "N/A (navigation/support)",
          bluecross: "N/A (navigation/support)",
          ssmu: "N/A (navigation/support)"
        },
        "Wellness and mental health supports": {
          ramq: "Varies (service-dependent)",
          other_prov: "Varies",
          bluecross: "Varies",
          ssmu: "May help with eligible services"
        }
      },
      tags: ["Student services"]
    },
    {
      id: "centre-medical-decelles",
      name: "Centre Médicale Décelles (Example clinic)",
      needs: ["general"],
      problems: ["minor_illness", "physical_injury", "ongoing_pain", "skin", "digestive", "medication", "chronic", "forms", "other"],
      address: "6900 Ave Decarie, Montréal, QC",
      url: "https://www.mcgill.ca/wellness-hub/get-support/physical-health/appointment",
      servicesOffered: [
        "General medical appointments",
        "Illness/injury assessment (non-emergency)",
        "Basic prescriptions/refills (varies)"
      ],
      coverageByService: {
        "General medical appointments": {
          ramq: "Often covered (if RAMQ-eligible & provider bills RAMQ)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        },
        "Illness/injury assessment (non-emergency)": {
          ramq: "Often covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        },
        "Basic prescriptions/refills (varies)": {
          ramq: "Drug coverage eligibility varies",
          other_prov: "Varies by province",
          bluecross: "Often covered (check plan)",
          ssmu: "May help with eligible costs"
        }
      },
      tags: ["Example clinic", "Appointments / walk-in may vary"]
    },
    {
      id: "cura-sante",
      name: "Cura Santé (Example clinic)",
      needs: ["general"],
      problems: ["minor_illness", "physical_injury", "ongoing_pain", "skin", "digestive", "medication", "chronic", "forms", "other"],
      address: "5515 Rue Saint-Jacques, Montréal, QC",
      url: "https://www.mcgill.ca/wellness-hub/get-support/physical-health/appointment",
      servicesOffered: [
        "General medical appointments",
        "Illness assessment",
        "Referrals (varies by clinic)"
      ],
      coverageByService: {
        "General medical appointments": {
          ramq: "Often covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        },
        "Illness assessment": {
          ramq: "Often covered (if eligible)",
          other_prov: "Often reimbursed (varies)",
          bluecross: "Often covered (check plan)",
          ssmu: "Not primary"
        },
        "Referrals (varies by clinic)": {
          ramq: "Often covered (service-dependent)",
          other_prov: "Varies",
          bluecross: "Varies",
          ssmu: "N/A (usually)"
        }
      },
      tags: ["Example clinic", "Appointments / walk-in may vary"]
    }
  ];

  /****************************************************
   * 1) “NONE / NOT SURE” MUTUALLY EXCLUSIVE
   ****************************************************/
  
  /****************************************************
   * 2) COVERAGE TABLE HELPERS (only show selected columns)
   ****************************************************/
  function insuranceLabel(key) {
    const labels = {
      ramq: "RAMQ",
      other_prov: "Other Provincial",
      bluecross: "Blue Cross",
      ssmu: "SSMU/MCSS"
    };
    return labels[key] || key;
  }

  function getSelectedInsuranceCols(insurance) {
    // Only selected (as you requested)
    if (!insurance || insurance.length === 0) return [];
    if (insurance.includes("none")) return [];
    return insurance.filter(x => x !== "none");
  }

  function buildCoverageTableHTML(location, selectedInsurance) {
    const cols = getSelectedInsuranceCols(selectedInsurance);

    if (cols.length === 0) {
      return `
        <p class="muted">
          <em>No insurance selected (or “None / Not sure”). Select insurance on the first page to see coverage by plan.</em>
        </p>
      `;
    }

    const coverage = location.coverageByService || {};
    const serviceNames = Object.keys(coverage);

    // Fallback: if no coverageByService provided, build from servicesOffered with generic text
    if (serviceNames.length === 0) {
      const offered = Array.isArray(location.servicesOffered) ? location.servicesOffered : [];
      if (offered.length === 0) {
        return `<p class="muted"><em>No services listed yet for this location.</em></p>`;
      }

      let html = `<table class="coverage-table">`;
      html += `<tr>
        <th>Service</th>
        ${cols.map(k => `<th>${insuranceLabel(k)}</th>`).join("")}
      </tr>`;

      offered.forEach(service => {
        html += `<tr>
          <td><strong>${service}</strong></td>
          ${cols.map(() => `<td>Varies / check plan</td>`).join("")}
        </tr>`;
      });

      html += `</table>`;
      return html;
    }

    // Normal: use coverageByService data
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

  /*************************************
   * 3) MAP
   *************************************/
  let serviceMap = null;
  let serviceMarkers = [];
  const geocodeCache = new Map(); // address -> {lat, lng}

  function showMapUI() { document.getElementById("map-wrapper").style.display = "block"; }
  function hideMapUI() { document.getElementById("map-wrapper").style.display = "none"; }

  function initServiceMap() {
    if (serviceMap) return;

    serviceMap = L.map("service-map").setView([MCGILL_CENTER.lat, MCGILL_CENTER.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(serviceMap);

    const mcgillMarker = L.marker([MCGILL_CENTER.lat, MCGILL_CENTER.lng]).addTo(serviceMap);
    mcgillMarker.bindPopup(`<b>${MCGILL_CENTER.name}</b>`);
  }

  function clearMarkers() {
    serviceMarkers.forEach(m => m.remove());
    serviceMarkers = [];
  }

  async function geocodeAddress(address) {
    if (!address) return null;
    if (geocodeCache.has(address)) return geocodeCache.get(address);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
      const resp = await fetch(url, { headers: { "Accept": "application/json" } });
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const result = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
      if (Number.isFinite(result.lat) && Number.isFinite(result.lng)) {
        geocodeCache.set(address, result);
        return result;
      }
      return null;
    } catch (e) {
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

      const marker = L.marker([item.latLng.lat, item.latLng.lng]).addTo(serviceMap);
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
   * 4) “PAGES” (VIEW SWITCHING)
   *************************************/
  const searchView = document.getElementById("search-view");
  const detailsView = document.getElementById("details-view");
  const detailsCard = document.getElementById("details-card");
  const breadcrumb = document.getElementById("details-breadcrumb");
  const backBtn = document.getElementById("back-btn");

  // Saved state from the form (so details knows what user picked)
  let lastUserSelections = null;
  let lastNeedLabel = "";
  let lastProblemLabel = "";

  function openDetailsPage(location, latLng) {
    if (!lastUserSelections) return;

    const directions = (latLng && latLng.lat && latLng.lng) ? getDirectionsUrl(latLng.lat, latLng.lng) : null;

    breadcrumb.textContent =
      lastNeedLabel + (lastProblemLabel ? ` → ${lastProblemLabel}` : "");

    const selectedCols = getSelectedInsuranceCols(lastUserSelections.insurance);
    const selectedBadges = selectedCols.length
      ? selectedCols.map(k => `<span class="pill">${insuranceLabel(k)}</span>`).join("")
      : `<span class="pill">No insurance selected</span>`;

    // Build the table HTML (only selected columns)
    const tableHtml = buildCoverageTableHTML(location, lastUserSelections.insurance);

    detailsCard.innerHTML = `
      <h2 style="margin-top:0;">${location.name}</h2>

      <div>${selectedBadges}</div>

      ${location.address ? `<p><strong>Address:</strong> ${location.address}</p>` : ""}
      ${location.url ? `<p><strong>Website:</strong> <a href="${location.url}" target="_blank" rel="noopener noreferrer">${location.url}</a></p>` : ""}
      ${directions ? `<p><a href="${directions}" target="_blank" rel="noopener noreferrer">Get directions</a></p>` : ""}

      <hr style="border:none;border-top:1px solid #eee;margin:1rem 0;" />

      <h3>Services + Coverage (based on your selections)</h3>
      ${tableHtml}

      <p class="muted" style="margin-top:0.75rem;">
        These are starter placeholders. Coverage can vary by eligibility, provider billing, and plan rules—confirm with the clinic and your plan.
      </p>
    `;

    // switch views
    searchView.style.display = "none";
    detailsView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToResults() {
    detailsView.style.display = "none";
    searchView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  backBtn.addEventListener("click", backToResults);

  /*************************************
   * 5) PROBLEM DROPDOWN
   *************************************/
  const needSelect = document.getElementById("need");
  const problemWrapper = document.getElementById("problem-wrapper");
  const problemSelect = document.getElementById("problem");

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
  updateProblemDropdown();
  needSelect.addEventListener("change", updateProblemDropdown);

  /*************************************
   * 6) SUBMIT HANDLER
   * (No coverage shown on results page)
   *************************************/
  const form = document.getElementById("healthcare-form");
  const resultsDiv = document.getElementById("results");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

const residency = document.getElementById("residency").value;
const need = needSelect.value;

const insurance = [getPrimaryInsuranceFromResidency(residency)];

if (ssmuSelect.value === "yes") {
  insurance.push("ssmu");
}

    // Save for details page
    lastUserSelections = { residency, insurance };
    lastNeedLabel = needSelect.options[needSelect.selectedIndex].text;

    const problem = (problemWrapper.style.display !== "none") ? problemSelect.value : "";
    lastProblemLabel = (need === "general" && problemSelect.options.length)
      ? (problemSelect.options[problemSelect.selectedIndex]?.text || "")
      : "";

    const matchingResources = resources.filter(r => r.needs.includes(need));

    const matchingLocations = locations.filter(l => {
      if (!l.needs.includes(need)) return false;

      if (need === "general") {
        if (!problem) return true;
        if (!l.problems) return true;
        return l.problems.includes(problem);
      }
      return true;
    });

    let html = `<h2>Results</h2>`;
    html += `<p class="muted">Click a resource or location to see details.</p>`;

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
      html += `<h3>Resources</h3>`;
      matchingResources.forEach((r) => {
        html += `
          <div class="card">
            <h3>${r.name}</h3>
            <p>${r.description || ""}</p>
            ${r.url ? `<p><a href="${r.url}" target="_blank" rel="noopener noreferrer">Learn more</a></p>` : ""}
          </div>
        `;
      });
    }

    html += `<h3>Locations</h3>`;
    if (!matchingLocations.length) {
      html += `<p>No locations found for that selection.</p>`;
      resultsDiv.innerHTML = html;
      hideMapUI();
      return;
    }

    resultsDiv.innerHTML = html + `<p class="muted">Loading map and locations…</p>`;
    showMapUI();
    initServiceMap();

    const resolved = await renderLocationsOnMap(matchingLocations, (loc, latLng) => {
      openDetailsPage(loc, latLng);
    });

    let locationsHtml = "";
    resolved.forEach(({ loc, latLng }) => {
      const hasCoords = !!latLng;
      const coordsNote = hasCoords ? "" : `<p class="muted"><em>(Pin not available yet — update the address or add coordinates.)</em></p>`;

      locationsHtml += `
        <div class="card clickable" data-loc-id="${loc.id}">
          <h3>${loc.name}</h3>
          <p>${loc.address || ""}</p>
          ${coordsNote}
          <p class="muted"><em>Click to view details (website, services, coverage).</em></p>
        </div>
      `;
    });

    resultsDiv.innerHTML = html + locationsHtml;

    document.querySelectorAll('[data-loc-id]').forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-loc-id");
        const item = resolved.find(x => x.loc.id === id);
        if (!item) return;
        openDetailsPage(item.loc, item.latLng);
      });
    });
  });

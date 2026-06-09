/* =====================================================
   DOM REFERENCES
===================================================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const loadBtn = document.getElementById("loadBtn");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const loadSaveBtn = document.getElementById("loadSaveBtn");
const cursorCoords = document.getElementById("cursorCoords");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");

const pointModal = document.getElementById("pointModal");
const xmInput = document.getElementById("xmInput");
const ymInput = document.getElementById("ymInput");
const savePointBtn = document.getElementById("savePointBtn");
const cancelPointBtn = document.getElementById("cancelPointBtn");

const tbody = document.querySelector("#pointsTable tbody");

editBtn.classList.add("edit-off");

/* =====================================================
   STATE
===================================================== */
let state = {
    image:  null,
    loaded: false,
    scale:  1,
    points: [],
    edit:   false,
    saved:  false
};

let imgX = 0;
let imgY = 0;

let pan = {
    active:  false,
    startX:  0,
    startY:  0,
    offsetX: 0,
    offsetY: 0
};

let selectedIndex = null;
let hoverIndex    = null;
let pendingPoint  = null;

// HISTORY per Ctrl+Z
let history       = [];
let dragPointIndex = null;
let isDraggingPoint = false;
let pointWasMoved = false;

// Modal per edit Xm/Ym
let editingPointIndex = null;

/* =====================================================
   LOCK
===================================================== */
function isLocked() {
    return state.saved === true;
}

/* =====================================================
   EDIT MODE
===================================================== */
function setEditMode(value) {
    if (isLocked()) return;

    state.edit = value;

    editBtn.innerText = state.edit ? "Edit ON" : "Edit OFF";
    editBtn.classList.remove("edit-on", "edit-off");
    editBtn.classList.add(state.edit ? "edit-on" : "edit-off");
}

function setLockedUI(locked) {
    editBtn.disabled       = locked;
    editBtn.style.opacity  = locked ? "0.45" : "1";
    editBtn.style.cursor   = locked ? "not-allowed" : "pointer";
}

/* =====================================================
   CANVAS RESIZE
===================================================== */
function resizeCanvas() {
    const workspace = document.getElementById("workspace");
    const rect      = workspace.getBoundingClientRect();

    canvas.width  = rect.width;
    canvas.height = rect.height;

    render();
}

window.addEventListener("load",   resizeCanvas);
window.addEventListener("resize", resizeCanvas);

const ro = new ResizeObserver(() => resizeCanvas());
ro.observe(document.getElementById("workspace"));

/* =====================================================
   LOAD IMAGE
===================================================== */
loadBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
        state.image     = new Image();
        state.image.src = event.target.result;

        state.image.onload = () => {
            state.loaded = true;
            state.scale  = 1;
            state.points = [];
            state.saved  = false;
            history      = [];

            pan.offsetX = 0;
            pan.offsetY = 0;

            setEditMode(false);
            setLockedUI(false);
            render();
        };
    };

    reader.readAsDataURL(file);
    fileInput.value = "";
};

/* =====================================================
   RENDER
===================================================== */
function render() {
    drawOnlyCanvas();
    renderTable();
}

/* =====================================================
   CANVAS DRAW
===================================================== */
function drawOnlyCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.loaded || !state.image) return;

    const w = state.image.width  * state.scale;
    const h = state.image.height * state.scale;

    imgX = (canvas.width  - w) / 2 + pan.offsetX;
    imgY = (canvas.height - h) / 2 + pan.offsetY;

    ctx.drawImage(state.image, imgX, imgY, w, h);

    // Draw crosshair for each point
    state.points.forEach((p, i) => {
        const px = imgX + p.x * state.scale;
        const py = imgY + p.y * state.scale;

        const isHover    = hoverIndex    === i;
        const isSelected = selectedIndex === i;

        const status = resolveStatus(p);
        let color = "#facc15"; // default yellow
        if (status === "warning") color = "#fb923c";
        if (status === "incompleto") color = "#f87171";
        if (isHover || isSelected) color = "#ffffff";

        const size      = isHover ? 11 : 7;
        const lineWidth = isHover ? 3 : 1.5;

        ctx.strokeStyle = color;
        ctx.lineWidth   = lineWidth;

        // Horizontal arm
        ctx.beginPath();
        ctx.moveTo(px - size, py);
        ctx.lineTo(px + size, py);
        ctx.stroke();

        // Vertical arm
        ctx.beginPath();
        ctx.moveTo(px, py - size);
        ctx.lineTo(px, py + size);
        ctx.stroke();

        // Label
        ctx.fillStyle = color;
        ctx.font      = "bold 11px monospace";
        ctx.fillText(`#${i + 1}`, px + size + 3, py - size);
    });

    renderDebug();
}

/* =====================================================
   CLICK → ADD POINT
===================================================== */
canvas.addEventListener("click", (e) => {
    if (dragPointIndex !== null) return;
    if (pointWasMoved) {
        pointWasMoved = false;
        return;
    }

    if (!state.loaded || !state.edit || isLocked()) return;

    const rect = canvas.getBoundingClientRect();
    const cx   = e.clientX - rect.left;
    const cy   = e.clientY - rect.top;

    const x = (cx - imgX) / state.scale;
    const y = (cy - imgY) / state.scale;

    if (!isInsideImage(x, y)) return;

    pendingPoint    = { x, y };
    xmInput.value  = "";
    ymInput.value  = "";

    pointModal.classList.remove("hidden");
});

function isInsideImage(x, y) {
    return (
        x >= 0 && y >= 0 &&
        x <= state.image.width &&
        y <= state.image.height
    );
}

function getPointAt(canvasX, canvasY) {
    for (let i = state.points.length - 1; i >= 0; i--) {
        const p = state.points[i];
        const px = imgX + p.x * state.scale;
        const py = imgY + p.y * state.scale;
        const dist = Math.hypot(canvasX - px, canvasY - py);
        if (dist < 10) {
            return i;
        }
    }
    return null;
}

/* =====================================================
   ZOOM
===================================================== */
canvas.addEventListener("wheel", (e) => {
    if (!state.loaded || !state.edit || isLocked()) return;

    e.preventDefault();

    state.scale *= (e.deltaY < 0) ? 1.1 : 0.9;
    state.scale  = Math.max(0.1, Math.min(state.scale, 10));

    clampPan();
    render();
}, { passive: false });

/* =====================================================
   PAN (right mouse button) + DRAG POINTS
===================================================== */
function clampPan() {
    if (!state.loaded || !state.image) return;

    const w = state.image.width  * state.scale;
    const h = state.image.height * state.scale;

    const maxOffsetX = Math.max(w / 2, canvas.width  / 2);
    const maxOffsetY = Math.max(h / 2, canvas.height / 2);

    pan.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, pan.offsetX));
    pan.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, pan.offsetY));
}

canvas.addEventListener("mousedown", (e) => {
    if (!state.loaded || !state.edit || isLocked()) return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Tasto sinistro = sposta punto
    if (e.button === 0) {
        const pointIndex = getPointAt(cx, cy);
        if (pointIndex !== null) {
            dragPointIndex = pointIndex;
            isDraggingPoint = true;
            // Salva posizione corrente in history per undo
            history.push({
                index: pointIndex,
                x: state.points[pointIndex].x,
                y: state.points[pointIndex].y
            });
            console.log(`📌 History salvata: Punto ${pointIndex + 1} a (${state.points[pointIndex].x.toFixed(2)}, ${state.points[pointIndex].y.toFixed(2)}). History length: ${history.length}`);
            return;
        }
    }

    // Tasto destro = pan
    if (e.button === 2) {
        pan.active = true;
        pan.startX = e.clientX;
        pan.startY = e.clientY;
    }
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx   = e.clientX - rect.left;
    const cy   = e.clientY - rect.top;
    const x    = (cx - imgX) / state.scale;
    const y    = (cy - imgY) / state.scale;

    // Drag punto
    if (isDraggingPoint && dragPointIndex !== null) {
        if (isInsideImage(x, y)) {
            state.points[dragPointIndex].x = isPixelMode ? Math.round(x) : x;
            state.points[dragPointIndex].y = isPixelMode ? Math.round(y) : y;
            pointWasMoved = true;
            render();
        }
        return;
    }

    // Pan logic
    if (pan.active && state.edit && !isLocked()) {
        pan.offsetX += e.clientX - pan.startX;
        pan.offsetY += e.clientY - pan.startY;

        pan.startX = e.clientX;
        pan.startY = e.clientY;

        clampPan();
        render();
    }

    // Cursor coords overlay
    if (!state.loaded || !isInsideImage(x, y)) {
        cursorCoords.style.display = "none";
        return;
    }

    cursorCoords.style.display = "block";
    cursorCoords.style.left    = (cx + 16) + "px";
    cursorCoords.style.top     = (cy + 16) + "px";
    cursorCoords.textContent   = `X: ${x.toFixed(2)} | Y: ${y.toFixed(2)}`;
});

canvas.addEventListener("mouseleave", () => {
    cursorCoords.style.display = "none";
    pan.active = false;
});

window.addEventListener("mouseup", () => {
    pan.active = false;
    isDraggingPoint = false;
    dragPointIndex = null;
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

/* =====================================================
   CTRL+Z per UNDO
===================================================== */
window.addEventListener("keydown", (e) => {
    const isCtrlZ = (e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z");
    
    if (isCtrlZ) {
        e.preventDefault();
        
        if (history.length > 0) {
            const lastAction = history.pop();
            
            // Verifica che il punto esista e che l'indice sia valido
            if (lastAction && 
                lastAction.index !== null && 
                lastAction.index !== undefined &&
                state.points[lastAction.index]) {
                
                state.points[lastAction.index].x = lastAction.x;
                state.points[lastAction.index].y = lastAction.y;
                
                console.log(`✅ UNDO: Punto ${lastAction.index + 1} ripristinato a (${lastAction.x.toFixed(2)}, ${lastAction.y.toFixed(2)})`);
                render();
            }
        } else {
            console.log("⚠️ History vuota, niente da fare undo");
        }
    }
}, true); // true = capture phase per catturare l'evento prima

/* =====================================================
   EDIT MODE BUTTON
===================================================== */
editBtn.onclick = () => {
    if (isLocked()) return;
    setEditMode(!state.edit);
};

/* =====================================================
   CLEAR POINTS
===================================================== */
clearBtn.onclick = () => {
    if (isLocked()) return;

    if (state.points.length === 0) return;

    if (!confirm("Eliminare tutti i punti?")) return;

    state.points = [];
    history = [];
    selectedIndex = null;
    hoverIndex    = null;
    render();
};

/* =====================================================
   SAVE  →  save.json
===================================================== */
saveBtn.onclick = () => {
    if (!state.loaded) {
        alert("Nessuna immagine caricata.");
        return;
    }

    const offscreen = document.createElement("canvas");
    offscreen.width  = state.image.width;
    offscreen.height = state.image.height;
    offscreen.getContext("2d").drawImage(state.image, 0, 0);

    const idImmagine = document.getElementById("idImmagine").value.trim();
    const idSetup = document.getElementById("idSetup").value.trim();

    const saveData = {
        version:     "1.0",
        savedAt:     new Date().toISOString(),
        id_immagine: idImmagine,
        id_setup:    idSetup,
        imageBase64: offscreen.toDataURL("image/png"),
        points:      state.points
    };

    const fileName = `img_${idImmagine}_setup_${idSetup}.json`;
    downloadJSON(saveData, fileName);

    state.saved = true;
    setEditMode(false);
    setLockedUI(true);
};

/* =====================================================
   LOAD SAVE
===================================================== */
loadSaveBtn.onclick = () => {
    const input    = document.createElement("input");
    input.type     = "file";
    input.accept   = ".json,application/json";

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (!data.imageBase64 || !Array.isArray(data.points)) {
                    alert("File non valido o corrotto.");
                    return;
                }

                if (data.id_immagine) document.getElementById("idImmagine").value = data.id_immagine;
                if (data.id_setup)    document.getElementById("idSetup").value    = data.id_setup;

                state.image     = new Image();
                state.image.src = data.imageBase64;

                state.image.onload = () => {
                    state.loaded = true;
                    state.scale  = 1;
                    state.points = data.points;
                    state.saved  = false;
                    history = [];

                    pan.offsetX = 0;
                    pan.offsetY = 0;

                    selectedIndex = null;
                    hoverIndex    = null;

                    setEditMode(false);
                    setLockedUI(false);
                    render();
                };

            } catch (err) {
                alert("Errore nella lettura del file: " + err.message);
            }
        };

        reader.readAsText(file);
    };

    input.click();
};

/* =====================================================
   EXPORT JSON
===================================================== */
exportBtn.onclick = () => {
    if (!state.loaded) {
        alert("Nessuna immagine caricata.");
        return;
    }
    if (state.points.length === 0) {
        alert("Nessun punto da esportare.");
        return;
    }

    const idImmagine = document.getElementById("idImmagine").value.trim() || "IMG-UNKNOWN";
    const idSetup    = document.getElementById("idSetup").value.trim()    || "SETUP-UNKNOWN";

    const records = state.points.map((p, i) => buildPointRecord(p, i, idImmagine, idSetup));

    const exportData = {
        export_metadata: {
            exported_at:    new Date().toISOString(),
            id_immagine:    idImmagine,
            id_setup:       idSetup,
            image_size: {
                width:  state.image.width,
                height: state.image.height
            },
            total_points:   records.length,
            points_ok:      records.filter(r => r.stato_elaborazione === "completo").length,
            points_warning: records.filter(r => r.stato_elaborazione === "warning").length,
            points_error:   records.filter(r => r.stato_elaborazione === "incompleto").length
        },
        points: records
    };

    downloadJSON(exportData, `export_${idImmagine}_${idSetup}.json`);
};

/* =====================================================
   POINT RECORD BUILDER
===================================================== */
function buildPointRecord(p, i, idImmagine, idSetup) {
    const warnings = resolveWarnings(p, i);
    const stato    = resolveStatus(p, warnings);

    return {
        id:          i + 1,
        id_immagine: idImmagine,
        id_setup:    idSetup,

        posizione_pixel: {
            x: parseFloat(p.x.toFixed(4)),
            y: parseFloat(p.y.toFixed(4))
        },

        posizione_reale_misurata: {
            xm: p.xm ?? null,
            ym: p.ym ?? null
        },

        posizione_reale_stimata: resolveEstimatedPosition(p),

        warning:            warnings,
        stato_elaborazione: stato
    };
}

/* =====================================================
   WARNINGS
===================================================== */
function resolveWarnings(p, i) {
    const warnings = [];
    const EDGE_MARGIN = 10;

    if (p.xm == null || p.ym == null) {
        warnings.push("MISSING_REAL_COORDS: Xm o Ym non definiti");
    }

    if (p.xm != null && p.xm <= 0) {
        warnings.push("INVALID_XM: Xm deve essere > 0");
    }
    if (p.ym != null && p.ym <= 0) {
        warnings.push("INVALID_YM: Ym deve essere > 0");
    }

    if (
        p.x < EDGE_MARGIN ||
        p.y < EDGE_MARGIN ||
        p.x > state.image.width  - EDGE_MARGIN ||
        p.y > state.image.height - EDGE_MARGIN
    ) {
        warnings.push(`NEAR_EDGE: Punto vicino al bordo (< ${EDGE_MARGIN}px)`);
    }

    const isDuplicate = state.points.some((other, j) => {
        if (j === i) return false;
        return Math.abs(other.x - p.x) < 1 && Math.abs(other.y - p.y) < 1;
    });
    if (isDuplicate) {
        warnings.push("DUPLICATE_POINT: Coordinate pixel identiche a un altro punto");
    }

    return warnings;
}

/* =====================================================
   STATUS
===================================================== */
function resolveStatus(p, warnings) {
    const w = warnings ?? resolveWarnings(p, state.points.indexOf(p));
    if (p.xm == null || p.ym == null) return "incompleto";
    if (w.length > 0)                 return "warning";
    return "completo";
}

/* =====================================================
   ESTIMATED POSITION (mock)
===================================================== */
function resolveEstimatedPosition(p) {
    if (p.xm == null || p.ym == null) {
        return { x_est: null, y_est: null, note: "Stima non disponibile: dati reali mancanti" };
    }

    const scaleX = p.xm / p.x;
    const scaleY = p.ym / p.y;

    return {
        x_est: parseFloat((p.x * scaleX).toFixed(4)),
        y_est: parseFloat((p.y * scaleY).toFixed(4)),
        note:  "Stima lineare mock — sostituire con modello calibrato"
    };
}

/* =====================================================
   TABLE
===================================================== */
function renderTable() {
    tbody.innerHTML = "";

    state.points.forEach((p, i) => {
        const row    = document.createElement("tr");
        const status = resolveStatus(p);

        const badgeClass = status === "completo"   ? "badge-ok"
                         : status === "warning"    ? "badge-warning"
                         :                           "badge-error";

        const badgeLabel = status === "completo"   ? "OK"
                         : status === "warning"    ? "WARN"
                         :                           "ERR";

        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${p.x.toFixed(1)}</td>
            <td>${p.y.toFixed(1)}</td>
            <td>${p.xm ?? "—"}</td>
            <td>${p.ym ?? "—"}</td>
            <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
        `;

        row.addEventListener("mouseenter", () => {
            hoverIndex = i;
            drawOnlyCanvas();
        });

        row.addEventListener("mouseleave", () => {
            hoverIndex = null;
            drawOnlyCanvas();
        });

        row.addEventListener("click", () => {
            selectedIndex    = i;
            hoverIndex       = null;
            modalText.textContent = `Punto #${i + 1} — X: ${p.x.toFixed(2)}, Y: ${p.y.toFixed(2)}`;
            modal.classList.remove("hidden");
            drawOnlyCanvas();
        });

        // Double-click per editare Xm/Ym
        row.addEventListener("dblclick", () => {
            editingPointIndex = i;
            xmInput.value  = p.xm ?? "";
            ymInput.value  = p.ym ?? "";
            modal.classList.add("hidden");
            pointModal.classList.remove("hidden");
        });

        tbody.appendChild(row);
    });
}

/* =====================================================
   MODAL DELETE
===================================================== */
cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    selectedIndex = null;
    drawOnlyCanvas();
};

deleteBtn.onclick = () => {
    if (selectedIndex !== null && !isLocked()) {
        state.points.splice(selectedIndex, 1);
        history = [];
        selectedIndex = null;
        render();
    }
    modal.classList.add("hidden");
};

/* =====================================================
   MODAL NEW/EDIT POINT
===================================================== */
savePointBtn.addEventListener("click", () => {
    const xm = xmInput.value.trim();
    const ym = ymInput.value.trim();

    if (xm === "" || ym === "") {
        showError("Inserisci sia Xm che Ym.");
        return;
    }
    if (Number(xm) <= 0 || Number(ym) <= 0) {
        showError("Xm e Ym devono essere maggiori di 0.");
        return;
    }

    // Se sta editando un punto esistente
    if (editingPointIndex !== null) {
        state.points[editingPointIndex].xm = Number(xm);
        state.points[editingPointIndex].ym = Number(ym);
        editingPointIndex = null;
    } 
    // Altrimenti crea un nuovo punto
    else if (pendingPoint) {
        state.points.push({
           x:  isPixelMode ? Math.round(pendingPoint.x) : pendingPoint.x,
           y:  isPixelMode ? Math.round(pendingPoint.y) : pendingPoint.y,
           xm: Number(xm),
           ym: Number(ym)
        });
        pendingPoint = null;
    }

    pointModal.classList.add("hidden");
    render();
});

cancelPointBtn.addEventListener("click", () => {
    pendingPoint = null;
    editingPointIndex = null;
    pointModal.classList.add("hidden");
});

/* =====================================================
   ERROR POPUP
===================================================== */
function showError(msg) {
    const el = document.getElementById("errorPopup");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.add("hidden"), 3000);
}

/* =====================================================
   DEBUG OVERLAY
===================================================== */
function renderDebug() {
    document.getElementById("debug").innerText =
`punti:  ${state.points.length}
scala:  ${state.scale.toFixed(2)}
edit:   ${state.edit}
saved:  ${state.saved}`;
}

/* =====================================================
   UTILITY: JSON DOWNLOAD
===================================================== */
function downloadJSON(data, filename) {
    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}   
/* =========================
   EXPORT CSV
========================= */
const exportCsvBtn = document.getElementById("exportCsvBtn");

exportCsvBtn.onclick = () => {
    if (state.points.length === 0) {
        alert("Nessun punto da esportare.");
        return;
    }

    const headers = ["id", "x_pixel", "y_pixel", "x_reale", "y_reale"];

const rows = state.points.map((p, i) => [
    i + 1,
    String(p.x.toFixed(2)).replace(".", ","),
    String(p.y.toFixed(2)).replace(".", ","),
    p.xm ?? "",
    p.ym ?? ""
]);

const csvContent = [headers, ...rows]
    .map(row => row.join(";"))
    .join("\n");

    const idImmagine = document.getElementById("idImmagine")?.value.trim();
    const filename = idImmagine ? `${idImmagine}_points.csv` : "points.csv";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");

    a.href     = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
};

/* =====================================================
   MODE BUTTON (Pixel / Reale)
===================================================== */
const modeBtn = document.getElementById("modeBtn");
let isPixelMode = true;

modeBtn.onclick = () => {
    isPixelMode = !isPixelMode;
    modeBtn.innerText = isPixelMode ? "📐 Modalità: Pixel" : "📐 Modalità: Reale";

    if (isPixelMode) {
        xmInput.step        = "1";
        xmInput.placeholder = "es. 320";
        ymInput.step        = "1";
        ymInput.placeholder = "es. 240";
        document.getElementById("labelXm").innerText = "Xm — coordinata pixel (intero)";
        document.getElementById("labelYm").innerText = "Ym — coordinata pixel (intero)";
    } else {
        xmInput.step        = "0.0001";
        xmInput.placeholder = "es. 12.345";
        ymInput.step        = "0.0001";
        ymInput.placeholder = "es. 8.720";
        document.getElementById("labelXm").innerText = "Xm — coordinata reale (decimale)";
        document.getElementById("labelYm").innerText = "Ym — coordinata reale (decimale)";
    }
};

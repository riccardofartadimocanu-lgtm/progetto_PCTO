const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const loadBtn = document.getElementById("loadBtn");
const editBtn = document.getElementById("editBtn");
editBtn.innerText = "Edit OFF";
editBtn.classList.add("edit-off");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const loadSaveBtn = document.getElementById("loadSaveBtn");

const cursorCoords = document.getElementById("cursorCoords");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");

const tbody = document.querySelector("#pointsTable tbody");

const pointModal = document.getElementById("pointModal");
const xmInput = document.getElementById("xmInput");
const ymInput = document.getElementById("ymInput");
const savePointBtn = document.getElementById("savePointBtn");
const cancelPointBtn = document.getElementById("cancelPointBtn");

let state = {
    image: null,
    loaded: false,
    scale: 1,
    points: [],
    edit: false,
    saved: false
};

let imgX = 0;
let imgY = 0;

let pan = {
    active: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
};

let selectedPointId = null;
let draggingPoint = null;
let hoverPointId = null;
let pendingPoint = null;
let editingPointId = null;

/* =========================
   LOCK
========================= */
function isLocked() {
    return state.saved;
}

/* =========================
   EDIT MODE
========================= */
function setEditMode(v) {
    if (isLocked()) return;

    state.edit = v;

    editBtn.innerText = state.edit ? "Edit ON" : "Edit OFF";

    editBtn.classList.remove("edit-on", "edit-off");
    editBtn.classList.add(state.edit ? "edit-on" : "edit-off");
}

/* =========================
   RESIZE
========================= */
function resizeCanvas() {
    const ws = document.getElementById("workspace");
    const r = ws.getBoundingClientRect();

    canvas.width = r.width;
    canvas.height = r.height;

    draw();
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
new ResizeObserver(resizeCanvas).observe(document.getElementById("workspace"));

/* =========================
   IMAGE LOAD
========================= */
loadBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
        state.image = new Image();
        state.image.src = ev.target.result;

        state.image.onload = () => {
            state.loaded = true;
            state.scale = 1;
            state.points = [];
            state.saved = false;

            setEditMode(false);
            renderTable();
            draw();
        };
    };

    reader.readAsDataURL(file);
};

/* =========================
   TABLE
========================= */
function renderTable() {
    tbody.innerHTML = "";

    state.points.forEach((p) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.x.toFixed(2)}</td>
            <td>${p.y.toFixed(2)}</td>
            <td>${p.xm ?? ""}</td>
            <td>${p.ym ?? ""}</td>
        `;

        row.onclick = () => {
            selectedPointId = p.id;

            modalText.textContent = `X: ${p.x.toFixed(2)}, Y: ${p.y.toFixed(2)}`;
            modal.classList.remove("hidden");

            hoverPointId = p.id; 
            draw();
        };

        row.onmouseenter = () => {
            hoverPointId = p.id;
            render();
        };

        row.onmouseleave = () => {
            hoverPointId = null;
            draw();
        };

        tbody.appendChild(row);
    });
}
/* =========================
   ADD POINT
========================= */
canvas.addEventListener("click", (e) => {
    if (!state.loaded || !state.edit || isLocked()) return;
    if (editingPointId) return;

    const r = canvas.getBoundingClientRect();

    const x = (e.clientX - r.left - imgX) / state.scale;
    const y = (e.clientY - r.top - imgY) / state.scale;

    if (!inside(x, y)) return;

    pendingPoint = { x, y };

    xmInput.value = "";
    ymInput.value = "";

    pointModal.classList.remove("hidden");
});

function inside(x, y) {
    return state.image &&
        x >= 0 && y >= 0 &&
        x <= state.image.width &&
        y <= state.image.height;
}

/* =========================
   SAVE POINT
========================= */
savePointBtn.onclick = () => {
    if (!pendingPoint) return;

    const xm = Number(xmInput.value);
    const ym = Number(ymInput.value);

    if (!xm || !ym) return;

    state.points.push({
        id: crypto.randomUUID(),
        x: pendingPoint.x,
        y: pendingPoint.y,
        xm,
        ym
    });

    pendingPoint = null;
    pointModal.classList.add("hidden");

    renderTable();
    draw();
};

cancelPointBtn.onclick = () => {
    pendingPoint = null;
    pointModal.classList.add("hidden");
};

/* =========================
   DELETE
========================= */
deleteBtn.onclick = () => {
    if (!selectedPointId) return;

    state.points = state.points.filter(p => p.id !== selectedPointId);

    selectedPointId = null;
    modal.classList.add("hidden");

    renderTable();
    draw();
};

cancelBtn.onclick = () => modal.classList.add("hidden");

/* =========================
   ZOOM
========================= */
canvas.addEventListener("wheel", (e) => {
    if (!state.loaded || !state.edit || isLocked()) return;

    state.scale *= (e.deltaY < 0) ? 1.1 : 0.9;
    state.scale = Math.max(0.1, Math.min(10, state.scale));

    draw();
});

/* =========================
   PAN
========================= */
canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 2) return;
    if (!state.edit) return;

    pan.active = true;
    pan.startX = e.clientX;
    pan.startY = e.clientY;
});

// DOPO (corretto)
canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left - imgX) / state.scale;
    const y = (e.clientY - r.top - imgY) / state.scale;

    if (editingPointId) {
        const p = state.points.find(pt => pt.id === editingPointId);
        if (p) {
            p.x = x;
            p.y = y;
            renderTable();
            draw();
        }
    }

    // PAN
    if (pan.active) {
        pan.offsetX += e.clientX - pan.startX;
        pan.offsetY += e.clientY - pan.startY;
        pan.startX = e.clientX;
        pan.startY = e.clientY;
        clampPan();
        draw();
    }

    // CURSORE
    if (state.image &&
        x >= 0 && y >= 0 &&
        x <= state.image.width &&
        y <= state.image.height) {
        cursorCoords.style.display = "block";
        cursorCoords.style.left = e.clientX + 15 + "px";
        cursorCoords.style.top = e.clientY + 15 + "px";
        cursorCoords.textContent = `X:${x.toFixed(2)} Y:${y.toFixed(2)}`;
    } else {
        cursorCoords.style.display = "none";
    }
});   // ← la } va QUI

window.addEventListener("mouseup", () => {
    pan.active = false;
    editingPointId = null;
});

/* =========================
   CLAMP PAN (FIX IMPORTANTE)
========================= */
function clampPan() {
    if (!state.image) return;

    const w = state.image.width * state.scale;
    const h = state.image.height * state.scale;

    const maxX = Math.max(w / 2, canvas.width / 2);
    const maxY = Math.max(h / 2, canvas.height / 2);

    pan.offsetX = Math.max(-maxX, Math.min(maxX, pan.offsetX));
    pan.offsetY = Math.max(-maxY, Math.min(maxY, pan.offsetY));
}

/* =========================
   DRAW
========================= */
function draw() {
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (!state.loaded) return;

    const w = state.image.width * state.scale;
    const h = state.image.height * state.scale;

    imgX = (canvas.width - w)/2 + pan.offsetX;
    imgY = (canvas.height - h)/2 + pan.offsetY;

    ctx.drawImage(state.image, imgX, imgY, w, h);

    state.points.forEach(p => {
        const px = imgX + p.x * state.scale;
        const py = imgY + p.y * state.scale;

        const hover = hoverPointId === p.id;

        ctx.strokeStyle = hover ? "red" : "yellow";
        ctx.lineWidth = hover ? 4 : 2;

        const s = hover ? 10 : 6;

        ctx.beginPath();
        ctx.moveTo(px - s, py);
        ctx.lineTo(px + s, py);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px, py - s);
        ctx.lineTo(px, py + s);
        ctx.stroke();
    });
    renderDebug();
}

/* =========================
   SAVE / EDIT
========================= */
saveBtn.onclick = () => {
    state.saved = true;
    setEditMode(false);
    alert("Saved");
};

editBtn.onclick = () => {
    if (state.saved) return;

    state.edit = !state.edit;

    editBtn.innerText = state.edit ? "Edit ON" : "Edit OFF";
    editBtn.className = state.edit ? "edit-on" : "edit-off";

    render();
};

clearBtn.onclick = () => {
    if (isLocked()) return;
    state.points = [];
    renderTable();
    draw();
};

editPointBtn.onclick = () => {
    if (!selectedPointId) return;

    editingPointId = selectedPointId;
    modal.classList.add("hidden");
};


function renderDebug() {
    const el = document.getElementById("debug");
    if (!el) return;

    el.innerText =
`points: ${state.points.length}
scale: ${state.scale.toFixed(2)}
edit: ${state.edit}
saved: ${state.saved}`;
}
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const loadBtn = document.getElementById("loadBtn");
const editBtn = document.getElementById("editBtn");
editBtn.classList.add("edit-off");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const loadSaveBtn = document.getElementById("loadSaveBtn");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");
const tbody = document.querySelector("#pointsTable tbody");

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
let selectedIndex = null;

/* =========================
   LOCK SYSTEM (IMPORTANT)
========================= */
function isLocked() {
    return state.saved === true;
}

/* =========================
   EDIT MODE CONTROL
========================= */
function setEditMode(value) {
    if (isLocked()) return;

    state.edit = value;

    editBtn.innerText = state.edit ? "Edit ON" : "Edit OFF";

    editBtn.classList.remove("edit-on", "edit-off");

    if (state.edit) {
        editBtn.classList.add("edit-on");
    } else {
        editBtn.classList.add("edit-off");
    }
}

function setLockedUI(locked) {
    editBtn.disabled = locked;
    editBtn.style.opacity = locked ? "0.5" : "1";
    editBtn.style.cursor = locked ? "not-allowed" : "pointer";
}

/* =========================
   RESIZE CANVAS
========================= */
function resizeCanvas() {
    const workspace = document.getElementById("workspace");
    const rect = workspace.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    render();
}

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

const ro = new ResizeObserver(() => resizeCanvas());
ro.observe(document.getElementById("workspace"));

/* =========================
   LOAD IMAGE (RESET STATE)
========================= */
loadBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
        state.image = new Image();
        state.image.src = event.target.result;

        state.image.onload = () => {
            state.loaded = true;
            state.scale = 1;
            state.points = [];

            state.saved = false;
            setEditMode(false);
            setLockedUI(false);

            render();
        };
    };

    reader.readAsDataURL(file);
};

/* =========================
   RENDER
========================= */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.loaded || !state.image) return;

    const w = state.image.width * state.scale;
    const h = state.image.height * state.scale;

    imgX = (canvas.width - w) / 2 + pan.offsetX;
    imgY = (canvas.height - h) / 2 + pan.offsetY;

    ctx.drawImage(state.image, imgX, imgY, w, h);

state.points.forEach(p => {
    const px = imgX + p.x * state.scale;
    const py = imgY + p.y * state.scale;

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;

    // linea orizzontale
    ctx.beginPath();
    ctx.moveTo(px - 6, py);
    ctx.lineTo(px + 6, py);
    ctx.stroke();

    // linea verticale
    ctx.beginPath();
    ctx.moveTo(px, py - 6);
    ctx.lineTo(px, py + 6);
    ctx.stroke();
});

    renderTable();
    renderDebug();
}

/* =========================
   ADD POINT (CLICK)
========================= */
canvas.addEventListener("click", (e) => {
    if (!state.loaded || !state.edit || isLocked()) return;

    const rect = canvas.getBoundingClientRect();

    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const x = (cx - imgX) / state.scale;
    const y = (cy - imgY) / state.scale;

    if (!isInsideImage(x, y)) return;

    state.points.push({ x, y });

    render();
});

function isInsideImage(x, y) {
    return (
        x >= 0 &&
        y >= 0 &&
        x <= state.image.width &&
        y <= state.image.height
    );
}

/* =========================
   ZOOM
========================= */
canvas.addEventListener("wheel", (e) => {
    if (!state.loaded || !state.edit || isLocked()) return;

    state.scale *= (e.deltaY < 0) ? 1.1 : 0.9;
    state.scale = Math.max(0.1, Math.min(state.scale, 10));

    render();
});

/* =========================
   CLEAR ALL POINTS
========================= */
clearBtn.onclick = () => {
    if (isLocked()) return;

    state.points = [];
    render();
};

/*=========================
    LOAD BUTTON
===========================*/
loadSaveBtn.onclick = () => {
    // PROTOTIPO FUTURO
};

/* =========================
   EDIT BUTTON
========================= */
editBtn.onclick = () => {
    if (isLocked()) return;
    setEditMode(!state.edit);
};

/* =========================
   SAVE (FULL LOCK)
========================= */
saveBtn.onclick = () => {
    state.saved = true;
    setEditMode(false);
    setLockedUI(true);

    console.log("SAVED POINTS:", state.points);
    alert("Saved (mock)");
};

/* =========================
   TABLE
========================= */
function renderTable() {
    tbody.innerHTML = "";

    state.points.forEach((p, i) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.x.toFixed(2)}</td>
            <td>${p.y.toFixed(2)}</td>
        `;

        row.onclick = () => {
            selectedIndex = i;
            modalText.textContent = `X: ${p.x}, Y: ${p.y}`;
            modal.classList.remove("hidden");
        };

        tbody.appendChild(row);
    });
}

/* =========================
   MODAL DELETE
========================= */
cancelBtn.onclick = () => modal.classList.add("hidden");

deleteBtn.onclick = () => {
    if (selectedIndex !== null && !isLocked()) {
        state.points.splice(selectedIndex, 1);
        render();
    }
    modal.classList.add("hidden");
};

//PAN
canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 2) return;
    if (!state.loaded || !state.edit || isLocked()) return;

    pan.active = true;
    
    pan.startX = e.clientX;
    pan.startY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
    if (!pan.active || !state.edit || isLocked()) return;

    const dx = e.clientX - pan.startX;
    const dy = e.clientY - pan.startY;

    pan.offsetX += dx;
    pan.offsetY += dy;

    pan.startX = e.clientX;
    pan.startY = e.clientY;

    render();
});

//STOP PAN
window.addEventListener("mouseup", () => {
    pan.active = false;
});

//BLOCK DEFAULT R_CLICK
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

/* =========================
   DEBUG
========================= */
function renderDebug() {
    document.getElementById("debug").innerText =
`points: ${state.points.length}
scale: ${state.scale.toFixed(2)}
edit: ${state.edit}
saved: ${state.saved}`;
}
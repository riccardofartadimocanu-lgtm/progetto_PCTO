const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const loadBtn = document.getElementById("loadBtn");
const editBtn = document.getElementById("editBtn");
editBtn.classList.add("edit-off");
const cursorCoords = document.getElementById("cursorCoords");

const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const loadSaveBtn = document.getElementById("loadSaveBtn");

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

let pendingPoint = null;

/* =========================
   STATE
========================= */
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
let hoverIndex = null;

/* =========================
   LOCK SYSTEM
========================= */
function isLocked() {
    return state.saved === true;
}

/* =========================
   EDIT MODE
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
   LOAD IMAGE
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
    drawOnlyCanvas();
    renderTable();
}

/* =========================
   CLICK TO ADD POINT
========================= */
canvas.addEventListener("click", (e) => {
    if (!state.loaded || !state.edit || isLocked()) return;

    const rect = canvas.getBoundingClientRect();

    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const x = (cx - imgX) / state.scale;
    const y = (cy - imgY) / state.scale;

    if (!isInsideImage(x, y)) return;

    pendingPoint = { x, y };

    xmInput.value = "";
    ymInput.value = "";

    pointModal.classList.remove("hidden");
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
   CLEAR POINTS
========================= */
clearBtn.onclick = () => {
    if (isLocked()) return;

    state.points = [];
    render();
};

/* =========================
   LOAD SAVE (PROTOTYPE)
========================= */
loadSaveBtn.onclick = () => {
    // futuro
};

/* =========================
   EDIT BUTTON
========================= */
editBtn.onclick = () => {
    if (isLocked()) return;
    setEditMode(!state.edit);
};

/* =========================
   SAVE
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
    <td>${p.xm ?? ""}</td>
    <td>${p.ym ?? ""}</td>
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
            selectedIndex = i;
            hoverIndex = null;

            modalText.textContent = `X: ${p.x}, Y: ${p.y}`;
            modal.classList.remove("hidden");

            drawOnlyCanvas();
        });

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

/* =========================
   PAN
========================= */
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
canvas.addEventListener("mousemove", (e) => {

    if (!state.loaded) {
        cursorCoords.style.display = "none";
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const x = (cx - imgX) / state.scale;
    const y = (cy - imgY) / state.scale;

    if (!isInsideImage(x, y)) {
        cursorCoords.style.display = "none";
        return;
    }

    cursorCoords.style.display = "block";

    cursorCoords.style.left = (cx + 15) + "px";
    cursorCoords.style.top = (cy + 15) + "px";

    cursorCoords.textContent =
        `X: ${x.toFixed(2)} | Y: ${y.toFixed(2)}`;
});

canvas.addEventListener("mouseleave", () => {
    cursorCoords.style.display = "none";
});

window.addEventListener("mouseup", () => {
    pan.active = false;
});

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

function drawOnlyCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.loaded || !state.image) return;

    const w = state.image.width * state.scale;
    const h = state.image.height * state.scale;

    imgX = (canvas.width - w) / 2 + pan.offsetX;
    imgY = (canvas.height - h) / 2 + pan.offsetY;

    ctx.drawImage(state.image, imgX, imgY, w, h);

    state.points.forEach((p, i) => {
        const px = imgX + p.x * state.scale;
        const py = imgY + p.y * state.scale;

        const isHover = hoverIndex === i;

        ctx.strokeStyle = isHover ? "red" : "yellow";
        ctx.lineWidth = isHover ? 4 : 2;

        const size = isHover ? 10 : 6;

        ctx.beginPath();
        ctx.moveTo(px - size, py);
        ctx.lineTo(px + size, py);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px, py - size);
        ctx.lineTo(px, py + size);
        ctx.stroke();
    });

    renderDebug();
}
savePointBtn.addEventListener("click", () => {
    if (!pendingPoint) return;

    state.points.push({
        x: pendingPoint.x,
        y: pendingPoint.y,
        xm: Number(xmInput.value),
        ym: Number(ymInput.value)
    });

    pendingPoint = null;

    pointModal.classList.add("hidden");

    render();
});
cancelPointBtn.addEventListener("click", () => {
    pendingPoint = null;
    pointModal.classList.add("hidden");
});
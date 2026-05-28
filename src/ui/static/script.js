const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const loadBtn = document.getElementById("loadBtn");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

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
let selectedIndex = null;

/* =========================
   FIX CANVAS SIZE (CRUCIALE)
========================= */
function resizeCanvas() {
    const workspace = document.getElementById("workspace");
    const rect = workspace.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    render();
}

window.addEventListener("load", () => {
    resizeCanvas();
});

window.addEventListener("resize", resizeCanvas);

/* extra safety */
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

    imgX = (canvas.width - w) / 2;
    imgY = (canvas.height - h) / 2;

    ctx.drawImage(state.image, imgX, imgY, w, h);

    state.points.forEach(p => {
        const px = imgX + p.x * state.scale;
        const py = imgY + p.y * state.scale;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    renderTable();
    renderDebug();
}

/* =========================
   CLICK ADD POINT
========================= */
canvas.addEventListener("click", (e) => {
    if (!state.loaded || !state.edit) return;

    const rect = canvas.getBoundingClientRect();

    // coordinate nel canvas
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // coordinate relative all'immagine (IMPORTANTISSIMO)
    const x = (cx - imgX) / state.scale;
    const y = (cy - imgY) / state.scale;

    // ❌ fuori immagine → blocca
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
    if (!state.loaded || !state.edit) return;

    state.scale *= (e.deltaY < 0) ? 1.1 : 0.9;
    state.scale = Math.max(0.2, Math.min(state.scale, 5));

    render();
});

/* =========================
   EDIT
========================= */
editBtn.onclick = () => {
    state.edit = !state.edit;
    editBtn.innerText = state.edit ? "Edit ON" : "Edit OFF";
};

/* =========================
   SAVE
========================= */
saveBtn.onclick = () => {
    state.edit = false;
    console.log(state.points);
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
   MODAL
========================= */
cancelBtn.onclick = () => modal.classList.add("hidden");

deleteBtn.onclick = () => {
    if (selectedIndex !== null) {
        state.points.splice(selectedIndex, 1);
        render();
    }
    modal.classList.add("hidden");
};

/* =========================
   DEBUG
========================= */
function renderDebug() {
    document.getElementById("debug").innerText =
`points: ${state.points.length}
scale: ${state.scale.toFixed(2)}
edit: ${state.edit}`;
}
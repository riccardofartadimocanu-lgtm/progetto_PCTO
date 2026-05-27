const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const loadBtn = document.getElementById("loadBtn");
const editBtn = document.getElementById("editBtn");

let state = {
    image: null,
    loaded: false,
    scale: 1,
    points: [],
    edit: false
};

let imgX = 0;
let imgY = 0;

// =====================
// RESIZE CANVAS (FIX SFASAMENTO)
// =====================
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// =====================
// LOAD IMAGE
// =====================
loadBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
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

// =====================
// RENDER PIPELINE
// =====================
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.loaded) return;

    const w = state.image.width * state.scale;
    const h = state.image.height * state.scale;

    imgX = (canvas.width - w) / 2;
    imgY = (canvas.height - h) / 2;

    // immagine
    ctx.drawImage(state.image, imgX, imgY, w, h);

    // punti
    state.points.forEach(p => {
        const px = imgX + p.x * state.scale;
        const py = imgY + p.y * state.scale;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    renderDebug();
}

// =====================
// CLICK → ADD POINT (FIX COORDINATE)
// =====================
canvas.addEventListener("click", (e) => {
    if (!state.loaded || !state.edit) return;

    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX - rect.left - imgX) / state.scale;
    const y = (e.clientY - rect.top - imgY) / state.scale;

    state.points.push({ x, y });

    render();
});

// =====================
// ZOOM
// =====================
canvas.addEventListener("wheel", (e) => {
    if (!state.loaded || !state.edit) return;

    if (e.deltaY < 0) state.scale *= 1.1;
    else state.scale *= 0.9;

    state.scale = Math.max(0.2, Math.min(state.scale, 5));

    render();
});

// =====================
// EDIT MODE
// =====================
editBtn.onclick = () => {
    state.edit = !state.edit;
    editBtn.innerText = state.edit ? "Edit ON" : "Edit OFF";
};

// =====================
// DEBUG PIPELINE
// =====================
function renderDebug() {
    document.getElementById("debug").innerText =
        `PIPELINE STATE
-----------------
points: ${state.points.length}
scale: ${state.scale.toFixed(2)}
edit: ${state.edit}`;
}
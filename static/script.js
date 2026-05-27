console.log("JS caricato correttamente");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("fileInput");
const loadBtn = document.getElementById("loadBtn");
const editBtn = document.getElementById("editBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let img = new Image();
let scale = 1;
let editMode = false;
let imgX = 0;
let imgY = 0;

loadBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        img.src = event.target.result;

        img.onload = () => {
            draw();
        }
    }

    reader.readAsDataURL(file);
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = img.width * scale;
    const h = img.height * scale;

    imgX = (canvas.width - w) / 2;
    imgY = (canvas.height - h) / 2;

    ctx.drawImage(img, imgX, imgY, w, h);
}

canvas.addEventListener("click", (e) => {
    if (!editMode) return;

    const x = e.clientX;
    const y = e.clientY;

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
});

canvas.addEventListener("wheel", (e) => {
    if (!img.src) return;

    if (e.deltaY < 0) scale *= 1.1;
    else scale *= 0.9;

    scale = Math.max(0.2, Math.min(scale, 5));

    draw();
});

editBtn.onclick = () => {
    editMode = !editMode;
    editBtn.innerText = editMode ? "Edit: ON" : "Edit: OFF";
};

document.addEventListener("DOMContentLoaded", () => {

    let points = [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 60 }
    ];

    const modal = document.getElementById("modal");
    const modalText = document.getElementById("modal-text");
    const cancelBtn = document.getElementById("cancelBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    let selectedIndex = null;

    function renderTable() {
        const tbody = document.querySelector("#pointsTable tbody");
        tbody.innerHTML = "";

        points.forEach((p, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${p.x}</td>
                <td>${p.y}</td>
            `;

            row.onclick = () => openModal(index);

            tbody.appendChild(row);
        });
    }

    function openModal(index) {
        selectedIndex = index;

        const p = points[index];
        modalText.textContent = `X: ${p.x}, Y: ${p.y}`;

        modal.classList.remove("hidden");
    }

    function closeModal() {
        modal.classList.add("hidden");
        selectedIndex = null;
    }

    cancelBtn.onclick = closeModal;

    deleteBtn.onclick = () => {
        if (selectedIndex !== null) {
            points.splice(selectedIndex, 1);
            renderTable();
        }
        closeModal();
    };

    renderTable();
});
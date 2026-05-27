import customtkinter as ctk
from tkinter import filedialog
import tkinter as tk
from PIL import Image, ImageTk

# =====================
# CONFIG UI
# =====================
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

root = ctk.CTk()
root.geometry("1920x1080")

# =====================
# CANVAS
# =====================
canvas = tk.Canvas(root, bg="black", highlightthickness=0)
canvas.pack(fill="both", expand=True)

# =====================
# VARIABILI GLOBALI
# =====================
img_original = None
img_tk = None
img_bbox = None
scale = 1.0
edit_mode = False

# =====================
# RIDISEGNO IMMAGINE
# =====================
def ridisegna():

    global img_tk, img_bbox

    if img_original:

        w, h = img_original.size

        new_size = (int(w * scale), int(h * scale))

        img_resized = img_original.resize(new_size)

        img_tk = ImageTk.PhotoImage(img_resized)

        canvas.delete("all")

        cx, cy = 960, 540

        canvas.create_image(cx, cy, image=img_tk)

        # bounding box immagine
        img_bbox = (
            cx - new_size[0] // 2,
            cy - new_size[1] // 2,
            cx + new_size[0] // 2,
            cy + new_size[1] // 2
        )

# =====================
# CARICA IMMAGINE
# =====================
def carica():

    global img_original, scale

    path = filedialog.askopenfilename(
        filetypes=[("Immagini", "*.png *.jpg *.jpeg")]
    )

    if path:

        img_original = Image.open(path)

        scale = 1.0

        ridisegna()

# =====================
# CLICK (PUNTI)
# =====================
def click(event):

    global edit_mode, img_bbox

    if not edit_mode:
        return

    if img_bbox is None:
        return

    x, y = event.x, event.y

    x1, y1, x2, y2 = img_bbox

    # solo dentro immagine
    if not (x1 <= x <= x2 and y1 <= y <= y2):
        return

    canvas.create_oval(
        x-4, y-4,
        x+4, y+4,
        fill="red"
    )

# =====================
# ZOOM CON ROTELLA
# =====================
def zoom(event):

    global scale

    if img_original is None:
        return

    if event.delta > 0:
        scale *= 1.1
    else:
        scale *= 0.9

    scale = max(0.2, min(scale, 5))

    ridisegna()

# =====================
# TOGGLE EDIT MODE
# =====================
def toggle_edit():

    global edit_mode

    edit_mode = not edit_mode

    if edit_mode:
        btn_edit.configure(text="Edit: ON")
    else:
        btn_edit.configure(text="Edit: OFF")

# =====================
# UI BUTTONS
# =====================
btn_load = ctk.CTkButton(root, text="Carica immagine", command=carica)
btn_load.place(x=20, y=20)

btn_edit = ctk.CTkButton(root, text="Edit: OFF", command=toggle_edit)
btn_edit.place(x=200, y=20)

# =====================
# BIND EVENTS
# =====================
canvas.bind("<Button-1>", click)
canvas.bind("<MouseWheel>", zoom)

root.bind("<Escape>", lambda e: root.destroy())

root.mainloop()
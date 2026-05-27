import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk

root = tk.Tk()
root.attributes("-fullscreen",True)
root.resizable(False,False)

label = tk.Label(root)
label.pack(expand=True)

def carica():

    path = filedialog.askopenfilename(
        filetypes=[("Immagini", "*.png *.jpg *.jpeg")]
    )

    if path:

        img = Image.open(path)

        print("Dimensione originale:", img.size)

        img.thumbnail((400, 400))

        print("Dopo thumbnail:", img.size)

        foto = ImageTk.PhotoImage(img)

        label.config(image=foto)
        label.image = foto  

bottone = tk.Button(root, text="Carica immagine", command=carica)
bottone.pack()


#per chiudere con esc
root.bind("<Escape>", lambda e: root.destroy())


root.mainloop()
import tkinter as tk
from tkinter import messagebox

def azione():
    testo = nome.get()
    messagebox.showinfo("Messaggio inserito",testo)
    return


root = tk.Tk()
root.title("Form Python")
root.geometry("1920x1080")

label_nome = tk.Label(root, text="Nome")
label_nome.place(x=100, y=80)

nome = tk.Entry(root)
nome.place(x=100, y = 100)

button = tk.Button(root, text="Button", command=azione)
button.place(x=100, y=120)

root.mainloop()
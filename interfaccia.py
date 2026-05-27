import tkinter as tk
import json
import os

FILE = "tasks.json"


class KanbanApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Kanban Board")
        self.root.geometry("900x500")

        self.tasks = []
        self.next_id = 1

        self.create_ui()
        self.load_tasks()

    # ---------------- UI ----------------
    def create_ui(self):
        top = tk.Frame(self.root)
        top.pack(fill="x")

        self.entry = tk.Entry(top)
        self.entry.pack(side="left", fill="x", expand=True, padx=5, pady=5)

        tk.Button(top, text="➕ Add Task", command=self.add_task).pack(side="left")

        self.board = tk.Frame(self.root)
        self.board.pack(fill="both", expand=True)

        self.board.columnconfigure((0, 1, 2, 3), weight=1)
        self.board.rowconfigure(0, weight=1)

        self.frames = {
            "backlog": self.make_column("BACKLOG", 0, "lightgray"),
            "todo": self.make_column("TO DO", 1, "white"),
            "progress": self.make_column("IN PROGRESS", 2, "lightyellow"),
            "done": self.make_column("DONE", 3, "lightgreen"),
        }

    def make_column(self, title, col, color):
        frame = tk.Frame(self.board, bg=color, bd=2, relief="groove")
        frame.grid(row=0, column=col, sticky="nsew")

        tk.Label(
            frame,
            text=title,
            bg=color,
            font=("Arial", 12, "bold")
        ).pack(pady=5)

        return frame

    # ---------------- TASK ----------------
    def add_task(self):
        text = self.entry.get().strip()
        if not text:
            return

        self.tasks.append({
            "id": self.next_id,
            "text": text,
            "status": "backlog"
        })

        self.next_id += 1
        self.entry.delete(0, tk.END)

        self.save_tasks()
        self.render()

    def move_task(self, task_id):
        order = ["backlog", "todo", "progress", "done"]

        for task in self.tasks:
            if task["id"] == task_id:
                idx = order.index(task["status"])
                task["status"] = order[(idx + 1) % len(order)]
                break

        self.save_tasks()
        self.render()

    def delete_task(self, task_id):
        self.tasks = [t for t in self.tasks if t["id"] != task_id]
        self.save_tasks()
        self.render()

    # ---------------- RENDER ----------------
    def render(self):
        # pulizia colonne
        for status, frame in self.frames.items():
            for widget in frame.winfo_children():
                widget.destroy()

            titles = {
                "backlog": "BACKLOG",
                "todo": "TO DO",
                "progress": "IN PROGRESS",
                "done": "DONE"
            }

            tk.Label(
                frame,
                text=titles[status],
                bg=frame.cget("bg"),
                font=("Arial", 12, "bold")
            ).pack(pady=5)

        # task
        for task in self.tasks:
            frame = self.frames[task["status"]]

            btn = tk.Button(
                frame,
                text=task["text"],
                bg="white",
                command=lambda tid=task["id"]: self.move_task(tid)
            )

            # click destro = elimina
            btn.bind(
                "<Button-3>",
                lambda e, tid=task["id"]: self.delete_task(tid)
            )

            btn.pack(pady=5, fill="x", padx=5)

    # ---------------- SAVE / LOAD ----------------
    def save_tasks(self):
        with open(FILE, "w") as f:
            json.dump({
                "next_id": self.next_id,
                "tasks": self.tasks
            }, f, indent=2)

    def load_tasks(self):
        if not os.path.exists(FILE):
            self.render()
            return

        with open(FILE, "r") as f:
            data = json.load(f)

        self.tasks = data.get("tasks", [])
        self.next_id = data.get("next_id", 1)

        self.render()


# ---------------- RUN ----------------
root = tk.Tk()
app = KanbanApp(root)
root.mainloop()
import sqlite3
import tkinter as tk
from tkinter import messagebox, ttk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

# دروستکردن یان بەستنەوە بە داتابەیس
def init_db():
    conn = sqlite3.connect("parties_data.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS parties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            party_name TEXT NOT NULL,
            votes INTEGER NOT NULL,
            color TEXT NOT NULL
        )
    """
    )
    conn.commit()
    conn.close()


class PartyApp:

    def __init__(self, root):
        self.root = root
        self.root.title("سیستەمی تۆمارکردن و چارتی لایەنە سیاسیەکان")
        self.root.geometry("900x650")
        self.root.config(bg="#f0f0f0")

        init_db()

        # بەشی سەرەوە: داخڵکردنی داتا
        input_frame = tk.LabelFrame(
            root,
            text=" داخڵکردنی داتای لایەنەکان ",
            font=("Arial", 12, "bold"),
            bg="#f0f0f0",
        )
        input_frame.pack(fill="x", padx=10, pady=10)

        tk.Label(
            input_frame, text="ناوی لایەن:", font=("Arial", 10), bg="#f0f0f0"
        ).grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.party_entry = tk.Entry(input_frame, font=("Arial", 10), width=15)
        self.party_entry.grid(row=0, column=1, padx=5, pady=5)

        tk.Label(
            input_frame, text="ژمارەی دەنگ:", font=("Arial", 10), bg="#f0f0f0"
        ).grid(row=0, column=2, padx=5, pady=5, sticky="w")
        self.votes_entry = tk.Entry(input_frame, font=("Arial", 10), width=15)
        self.votes_entry.grid(row=0, column=3, padx=5, pady=5)

        tk.Label(
            input_frame,
            text="ڕەنگ (نموونە: red, blue یا #ff0000):",
            font=("Arial", 10),
            bg="#f0f0f0",
        ).grid(row=0, column=4, padx=5, pady=5, sticky="w")
        self.color_entry = tk.Entry(input_frame, font=("Arial", 10), width=12)
        self.color_entry.grid(row=0, column=5, padx=5, pady=5)
        self.color_entry.insert(0, "blue")

        add_btn = tk.Button(
            input_frame,
            text="تۆمارکردن",
            bg="#4CAF50",
            fg="white",
            font=("Arial", 10, "bold"),
            command=self.add_party,
        )
        add_btn.grid(row=0, column=6, padx=10, pady=5)

        # بەشی ناوەڕاست: هەڵبژاردنی جۆری چارت و نیشاندانی داتا
        control_frame = tk.Frame(root, bg="#f0f0f0")
        control_frame.pack(fill="x", padx=10, pady=5)

        tk.Label(
            control_frame,
            text="جۆری چارت:",
            font=("Arial", 10, "bold"),
            bg="#f0f0f0",
        ).pack(side="left", padx=5)
        self.chart_type_var = tk.StringVar(value="Bar")
        chart_combo = ttk.Combobox(
            control_frame,
            textvariable=self.chart_type_var,
            values=["Bar", "Pie"],
            state="readonly",
            width=10,
        )
        chart_combo.pack(side="left", padx=5)
        chart_combo.bind("<<ComboboxSelected>>", lambda e: self.update_chart())

        refresh_btn = tk.Button(
            control_frame,
            text="نوێکردنەوەی چارت",
            bg="#2196F3",
            fg="white",
            font=("Arial", 10),
            command=self.update_chart,
        )
        refresh_btn.pack(side="left", padx=10)

        delete_btn = tk.Button(
            control_frame,
            text="سڕینەوەی هەڵبژاردە",
            bg="#f44336",
            fg="white",
            font=("Arial", 10),
            command=self.delete_party,
        )
        delete_btn.pack(side="right", padx=10)

        # خشتەی نیشاندانی داتا
        table_frame = tk.Frame(root)
        table_frame.pack(fill="both", expand=True, padx=10, pady=5)

        self.tree = ttk.Treeview(
            table_frame,
            columns=("ID", "Party", "Votes", "Color"),
            show="headings",
            height=5,
        )
        self.tree.heading("ID", text="کۆد")
        self.tree.heading("Party", text="ناوی لایەن")
        self.tree.heading("Votes", text="ژمارەی دەنگ")
        self.tree.heading("Color", text="ڕەنگ")

        self.tree.column("ID", width=50, anchor="center")
        self.tree.column("Party", width=200, anchor="center")
        self.tree.column("Votes", width=150, anchor="center")
        self.tree.column("Color", width=100, anchor="center")
        self.tree.pack(fill="both", expand=True)

        # بەشی خوارەوە: چارتی ماتپڵۆتلایب
        self.chart_frame = tk.Frame(root)
        self.chart_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # بارکردنی داتا لە داتابەیسەوە بۆ سەرەتا
        self.load_data()

    def add_party(self):
        name = self.party_entry.get().strip()
        votes = self.votes_entry.get().strip()
        color = self.color_entry.get().strip()

        if not name or not votes or not color:
            messagebox.showerror("هەڵە", "تکایە هەموو خانەکان پڕبکەرەوە!")
            return

        try:
            votes_int = int(votes)
        except ValueError:
            messagebox.showerror("هەڵە", "ژمارەی دەنگ دەبێت تەنها ژمارە بێت!")
            return

        # پاشەکەوتکردن لە داتابەیسی SQLite بە شێوەیەکی هەمیشەیی
        conn = sqlite3.connect("parties_data.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO parties (party_name, votes, color) VALUES (?, ?, ?)",
            (name, votes_int, color),
        )
        conn.commit()
        conn.close()

        # پاککردنەوەی خانەکانی نوسین
        self.party_entry.delete(0, tk.END)
        self.votes_entry.delete(0, tk.END)

        # نوێکردنەوەی خشتە و چارت
        self.load_data()
        messagebox.सर्كات("سەرکەوتوو", "داتاکە بە سەرکەوتوویی پاشەکەوت کرا!")

    def load_data(self):
        # پاککردنەوەی خشتە پێش بارکردنەوە
        for item in self.tree.get_children():
            self.tree.delete(item)

        conn = sqlite3.connect("parties_data.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM parties")
        rows = cursor.fetchall()
        conn.close()

        for row in rows:
            self.tree.insert("", tk.END, values=row)

        self.update_chart()

    def delete_party(self):
        selected_item = self.tree.selection()
        if not selected_item:
            messagebox.showwarning(
                ئاگاداری, "تکایە ئەو لایەنە دیاری بکە کە دەتەوێت بسرێتەوە!"
            )
            return

        item_data = self.tree.item(selected_item)
        party_id = item_data["values"][0]

        conn = sqlite3.connect("parties_data.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM parties WHERE id = ?", (party_id,))
        conn.commit()
        conn.close()

        self.load_data()

    def update_chart(self):
        for widget in self.chart_frame.winfo_children():
            widget.destroy()

        conn = sqlite3.connect("parties_data.db")
        cursor = conn.cursor()
        cursor.execute("SELECT party_name, votes, color FROM parties")
        data = cursor.fetchall()
        conn.close()

        if not data:
            return

        parties = [row[0] for row in data]
        votes = [row[1] for row in data]
        colors = [row[2] for row in data]

        fig, ax = plt.subplots(figsize=(8, 3.5))
        chart_type = self.chart_type_var.get()

        if chart_type == "Bar":
            ax.bar(parties, votes, color=colors)
            ax.set_ylabel("ژمارەی دەنگ")
            ax.set_title("چارتی ستوونی دەنگی لایەنەکان")
        elif chart_type == "Pie":
            ax.pie(
                votes,
                labels=parties,
                colors=colors,
                autopct="%1.1f%%",
                startangle=140,
            )
            ax.set_title("چارتی بازنەیی دەنگی لایەنەکان")

        canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)


if __name__ == "__main__":
    root = tk.Tk()
    app = PartyApp(root)
    root.mainloop()
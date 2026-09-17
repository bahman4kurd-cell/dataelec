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
            cycle TEXT NOT NULL,
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
        self.root.geometry("950x750")
        self.root.config(bg="#f0f0f0")

        init_db()

        # بەشی سەرەوە: داخڵکردنی داتا و خول
        input_frame = tk.LabelFrame(
            root,
            text=" داخڵکردنی داتای لایەنەکان ",
            font=("Arial", 12, "bold"),
            bg="#f0f0f0",
        )
        input_frame.pack(fill="x", padx=10, pady=10)

        tk.Label(
            input_frame, text="حکومی / جۆر:", font=("Arial", 10), bg="#f0f0f0"
        ).grid(row=0, column=0, padx=5, pady=5, sticky="w")
        
        self.cycle_entry = ttk.Combobox(
            input_frame,
            values=["حکومی", "پەرلەمانی کوردستان", "پەرلەمانی عێراق"],
            width=20,
            state="readonly"
        )
        self.cycle_entry.grid(row=0, column=1, padx=5, pady=5)
        self.cycle_entry.set("حکومی")

        tk.Label(
            input_frame, text="ناوی لایەن:", font=("Arial", 10), bg="#f0f0f0"
        ).grid(row=0, column=2, padx=5, pady=5, sticky="w")
        self.party_entry = tk.Entry(input_frame, font=("Arial", 10), width=15)
        self.party_entry.grid(row=0, column=3, padx=5, pady=5)

        tk.Label(
            input_frame, text="ژمارەی دەنگ:", font=("Arial", 10), bg="#f0f0f0"
        ).grid(row=0, column=4, padx=5, pady=5, sticky="w")
        self.votes_entry = tk.Entry(input_frame, font=("Arial", 10), width=10)
        self.votes_entry.grid(row=0, column=5, padx=5, pady=5)

        tk.Label(
            input_frame,
            text="ڕەنگ:",
            font=("Arial", 10),
            bg="#f0f0f0",
        ).grid(row=0, column=6, padx=5, pady=5, sticky="w")
        self.color_entry = tk.Entry(input_frame, font=("Arial", 10), width=10)
        self.color_entry.grid(row=0, column=7, padx=5, pady=5)
        self.color_entry.insert(0, "blue")

        add_btn = tk.Button(
            input_frame,
            text="تۆمارکردن",
            bg="#4CAF50",
            fg="white",
            font=("Arial", 10, "bold"),
            command=self.add_party,
        )
        add_btn.grid(row=0, column=8, padx=10, pady=5)

        # نیشاندانی ناوی دروستکەر لە فۆرمەکەدا
        lbl_credit = tk.Label(
            input_frame,
            text="دروستکردنی: بەهمەن دەروێش علی",
            font=("Arial", 9, "italic"),
            fg="gray",
            bg="#f0f0f0"
        )
        lbl_credit.grid(row=1, column=0, columnspan=9, pady=5)

        # بەشی ناوەڕاست: ڕوکار و چارتەکان (پای و دۆنەت) لە ناو بەشی ئەنجامدا
        chart_control_frame = tk.LabelFrame(
            root,
            text=" بەشی شیکاری و ئەنجامی چارتەکان ",
            font=("Arial", 11, "bold"),
            bg="#f0f0f0"
        )
        chart_control_frame.pack(fill="x", padx=10, pady=5)

        tk.Label(
            chart_control_frame,
            text="ڕوکار:",
            font=("Arial", 10, "bold"),
            bg="#f0f0f0",
        ).pack(side="left", padx=5)

        self.filter_cycle_var = tk.StringVar(value="حکومی")
        filter_cycle_combo = ttk.Combobox(
            chart_control_frame,
            textvariable=self.filter_cycle_var,
            values=["حکومی", "پەرلەمانی کوردستان", "پەرلەمانی عێراق"],
            state="readonly",
            width=20,
        )
        filter_cycle_combo.pack(side="left", padx=5)
        filter_cycle_combo.bind("<<ComboboxSelected>>", lambda e: self.update_chart())

        tk.Label(
            chart_control_frame,
            text="جۆری چارت:",
            font=("Arial", 10, "bold"),
            bg="#f0f0f0",
        ).pack(side="left", padx=10)

        self.chart_type_var = tk.StringVar(value="Pie")
        chart_combo = ttk.Combobox(
            chart_control_frame,
            textvariable=self.chart_type_var,
            values=["Pie", "Donut"],
            state="readonly",
            width=10,
        )
        chart_combo.pack(side="left", padx=5)
        chart_combo.bind("<<ComboboxSelected>>", lambda e: self.update_chart())

        refresh_btn = tk.Button(
            chart_control_frame,
            text="نوێکردنەوە",
            bg="#2196F3",
            fg="white",
            font=("Arial", 9),
            command=self.update_chart,
        )
        refresh_btn.pack(side="left", padx=10)

        delete_btn = tk.Button(
            chart_control_frame,
            text="سڕینەوەی هەڵبژاردە",
            bg="#f44336",
            fg="white",
            font=("Arial", 9),
            command=self.delete_party,
        )
        delete_btn.pack(side="right", padx=10)

        # خشتەی نیشاندانی داتا
        table_frame = tk.Frame(root)
        table_frame.pack(fill="both", expand=True, padx=10, pady=5)

        self.tree = ttk.Treeview(
            table_frame,
            columns=("ID", "Cycle", "Party", "Votes", "Color"),
            show="headings",
            height=5,
        )
        self.tree.heading("ID", text="کۆد")
        self.tree.heading("Cycle", text="ڕوکار / جۆر")
        self.tree.heading("Party", text="ناوی لایەن")
        self.tree.heading("Votes", text="ژمارەی دەنگ")
        self.tree.heading("Color", text="ڕەنگ")

        self.tree.column("ID", width=40, anchor="center")
        self.tree.column("Cycle", width=180, anchor="center")
        self.tree.column("Party", width=180, anchor="center")
        self.tree.column("Votes", width=100, anchor="center")
        self.tree.column("Color", width=80, anchor="center")
        self.tree.pack(fill="both", expand=True)

        # بەشی خوارەوە: چارتی ماتپڵۆتلایب (پای و دۆنەت)
        self.chart_frame = tk.Frame(root)
        self.chart_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # بارکردنی داتا لە داتابەیسەوە بۆ سەرەتا
        self.load_data()

    def add_party(self):
        cycle = self.cycle_entry.get().strip()
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
            "INSERT INTO parties (cycle, party_name, votes, color) VALUES (?, ?, ?, ?)",
            (cycle, name, votes_int, color),
        )
        conn.commit()
        conn.close()

        # پاککردنەوەی خانەکانی نوسین
        self.party_entry.delete(0, tk.END)
        self.votes_entry.delete(0, tk.END)

        # نوێکردنەوەی خشتە و چارت
        self.load_data()
        messagebox.showinfo("سەرکەوتوو", "داتاکە بە سەرکەوتوویی پاشەکەوت کرا!")

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
                "ئاگاداری", "تکایە ئەو لایەنە دیاری بکە کە دەتەوێت بسرێتەوە!"
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

        selected_cycle = self.filter_cycle_var.get()

        conn = sqlite3.connect("parties_data.db")
        cursor = conn.cursor()
        # لێرەدا داتاکە بەپێی ژمارەی دەنگەکان لە زۆرترینەوە ڕیز دەکرێت بۆ چارتەکە
        cursor.execute(
            "SELECT party_name, votes, color FROM parties WHERE cycle = ? ORDER BY votes DESC", 
            (selected_cycle,)
        )
        data = cursor.fetchall()
        conn.close()

        fig, ax = plt.subplots(figsize=(8, 3.2))

        if not data:
            ax.text(0.5, 0.5, f"هیچ داتایەک تۆمار نەکراوە بۆ {selected_cycle}", horizontalalignment='center', verticalalignment='center', fontsize=12)
            ax.axis('off')
            canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)
            return

        parties = [row[0] for row in data]
        votes = [row[1] for row in data]
        colors = [row[2] for row in data]

        chart_type = self.chart_type_var.get()

        if chart_type == "Pie":
            ax.pie(
                votes,
                labels=parties,
                colors=colors,
                autopct="%1.1f%%",
                startangle=140,
            )
            ax.set_title(f"چارتی پای (ڕێژەی دەنگەکان) - {selected_cycle}")
        elif chart_type == "Donut":
            ax.pie(
                votes,
                labels=parties,
                colors=colors,
                autopct="%1.1f%%",
                startangle=140,
                wedgeprops=dict(width=0.4, edgecolor='w')
            )
            ax.set_title(f"چارتی دۆنەت (ڕێژەی دەنگەکان) - {selected_cycle}")

        fig.tight_layout()
        canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)


if __name__ == "__main__":
    root = tk.Tk()
    app = PartyApp(root)
    root.mainloop()
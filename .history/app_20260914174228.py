import os
import sqlite3
from tkinter import messagebox
import tkinter as tk
from tkinter import ttk
import customtkinter as ctk

# ڕێکخستنی سەرەتایی ڕووکار
ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")

class ElectionApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("سیستەمی بەڕێوەبردنی هەڵبژاردن")
        self.geometry("1000x650")
        
        # دروستکردنی داتابەیسی هەڵبژاردن
        self.init_db()

        # دروستکردنی لاپەڕەکان و ڕووکار
        self.create_widgets()
        self.load_data()

    def init_db(self):
        self.conn = sqlite3.connect("election.db")
        self.cursor = self.conn.cursor()
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                party TEXT,
                votes INTEGER DEFAULT 0
            )
        ''')
        self.conn.commit()

    def create_widgets(self):
        # فۆرمی داخلکردن (لای چەپ)
        self.frame_form = ctk.CTkFrame(self, width=320)
        self.frame_form.pack(side="left", fill="y", padx=10, pady=10)

        ctk.CTkLabel(self.frame_form, text="تۆمارکردنی کاندیدی نوێ", font=("Arial", 16, "bold")).pack(pady=15)

        ctk.CTkLabel(self.frame_form, text="ناوی کاندید:").pack(anchor="w", padx=10)
        self.entry_name = ctk.CTkEntry(self.frame_form)
        self.entry_name.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="قەوارە / حیزب:").pack(anchor="w", padx=10)
        self.entry_party = ctk.CTkEntry(self.frame_form)
        self.entry_party.pack(fill="x", padx=10, pady=5)

        self.btn_add = ctk.CTkButton(self.frame_form, text="زیادکردنی کاندید", fg_color="green", hover_color="darkgreen", command=self.add_candidate)
        self.btn_add.pack(fill="x", padx=10, pady=15)

        self.btn_vote = ctk.CTkButton(self.frame_form, text="دەنگدان بۆ کاندیدی هەڵبژێردراو", fg_color="blue", hover_color="darkblue", command=self.cast_vote)
        self.btn_vote.pack(fill="x", padx=10, pady=5)

        # نیشاندانی ناوی دروستکەر لە کۆتایی فۆرمەکە
        self.lbl_credit = ctk.CTkLabel(self.frame_form, text="دروستکردنی:بەهمەن دەروێش علی", font=("Arial", 11, "italic"), text_color="gray")
        self.lbl_credit.pack(side="bottom", pady=15)

        # بەشی پیشاندانی خشتە (لای ڕاست)
        self.frame_view = ctk.CTkFrame(self)
        self.frame_view.pack(side="right", fill="both", expand=True, padx=10, pady=10)

        ctk.CTkLabel(self.frame_view, text="خشتەی کاندیدەکان و ئەنجامی دەنگەکان", font=("Arial", 16, "bold")).pack(pady=10)

        self.tree_frame = ctk.CTkFrame(self.frame_view)
        self.tree_frame.pack(fill="both", expand=True, padx=5, pady=5)

        columns = ("ID", "ناوی کاندید", "قەوارە / حیزب", "کۆی دەنگەکان")
        self.tree = ttk.Treeview(self.tree_frame, columns=columns, show="headings")

        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150)

        self.tree.pack(side="left", fill="both", expand=True)

        self.scrollbar = ttk.Scrollbar(self.tree_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=self.scrollbar.set)
        self.scrollbar.pack(side="right", fill="y")

    def add_candidate(self):
        name = self.entry_name.get()
        party = self.entry_party.get()

        if not name or not party:
            messagebox.showerror("هەڵە", "تکایە ناو و قەوارەی کاندید پڕبکەرەوە!")
            return

        self.cursor.execute("INSERT INTO candidates (name, party, votes) VALUES (?, ?, 0)", (name, party))
        self.conn.commit()

        messagebox.showinfo("سەرکەوتوو بوو", "کاندیدەکە بە سەرکەوتوویی زیادکرا.")
        self.load_data()
        self.entry_name.delete(0, "end")
        self.entry_party.delete(0, "end")

    def cast_vote(self):
        selected_item = self.tree.selection()
        if not selected_item:
            messagebox.showwarning("ئاگاداری", "تکایە کاندیدێک لە خشتەکە هەڵبژێرە بۆ دەنگدان!")
            return

        item_data = self.tree.item(selected_item)
        candidate_id = item_data['values'][0]

        self.cursor.execute("UPDATE candidates SET votes = votes + 1 WHERE id = ?", (candidate_id,))
        self.conn.commit()

        messagebox.showinfo("سەرکەوتوو بوو", "دەنگەکە بە سەرکەوتوویی تۆمارکرا!")
        self.load_data()

    def load_data(self):
        for row in self.tree.get_children():
            self.tree.delete(row)

        self.cursor.execute("SELECT id, name, party, votes FROM candidates")
        for row in self.cursor.fetchall():
            self.tree.insert("", "end", values=row)

if __name__ == "__main__":
    app = ElectionApp()
    app.mainloop()
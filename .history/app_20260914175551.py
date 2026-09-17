import os
import sqlite3
from datetime import datetime
from tkinter import messagebox, filedialog
import tkinter as ttk_tk
from tkinter import ttk
import customtkinter as ctk
import pandas as pd
import matplotlib.pyplot as plt

# ڕێکخستنی سەرەتایی ڕووکار
ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")

class ElectionAnalysisApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("سیستەمی شیکاری ئەنجامی هەڵبژاردن و دەنگی لایەنەکان")
        self.geometry("1100x750")
        
        # دروستکردنی داتابەیس
        self.init_db()

        # دروستکردنی پێکهاتە و ڕووکار
        self.create_widgets()
        self.load_data()

    def init_db(self):
        self.conn = sqlite3.connect("election_analysis.db")
        self.cursor = self.conn.cursor()
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS election_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cycle TEXT,
                branch TEXT,
                region TEXT,
                party_name TEXT,
                votes INTEGER
            )
        ''')
        self.conn.commit()

    def create_widgets(self):
        # فۆرمی داخلکردن و کۆنتڕۆڵ (لای چەپ)
        self.frame_form = ctk.CTkFrame(self, width=360)
        self.frame_form.pack(side="left", fill="y", padx=10, pady=10)

        ctk.CTkLabel(self.frame_form, text="تۆمارکردنی ئەنجامی دەنگەکان", font=("Arial", 16, "bold")).pack(pady=10)

        ctk.CTkLabel(self.frame_form, text="خولی هەڵبژاردن:").pack(anchor="w", padx=10)
        self.combo_cycle = ctk.CTkComboBox(self.frame_form, values=["خولی یەکەم", "خولی دووەم", "خولی سێیەم", "خولی چوارەم", "خولی پێنجەم"])
        self.combo_cycle.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="لق / بازنە:").pack(anchor="w", padx=10)
        self.entry_branch = ctk.CTkEntry(self.frame_form, placeholder_text="بۆ نموونە: لقی سلێمانی")
        self.entry_branch.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="ناوچە / وێستگە:").pack(anchor="w", padx=10)
        self.entry_region = ctk.CTkEntry(self.frame_form, placeholder_text="بۆ نموونە: ناوچەی ڕزگاری")
        self.entry_region.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="ناوی لایەن / قەوارە:").pack(anchor="w", padx=10)
        self.entry_party = ctk.CTkEntry(self.frame_form)
        self.entry_party.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="ژمارەی دەنگەکان:").pack(anchor="w", padx=10)
        self.entry_votes = ctk.CTkEntry(self.frame_form)
        self.entry_votes.pack(fill="x", padx=10, pady=5)

        self.btn_save = ctk.CTkButton(self.frame_form, text="تۆمارکردنی زانیاری", fg_color="green", hover_color="darkgreen", command=self.save_record)
        self.btn_save.pack(fill="x", padx=10, pady=12)

        self.btn_chart = ctk.CTkButton(self.frame_form, text="پیشاندانی گرافیکی دەنگەکان", fg_color="purple", hover_color="indigo", command=self.show_chart)
        self.btn_chart.pack(fill="x", padx=10, pady=5)

        self.btn_excel = ctk.CTkButton(self.frame_form, text="هەناردن بۆ اکسڵ (Excel)", fg_color="teal", hover_color="darkcyan", command=self.export_excel)
        self.btn_excel.pack(fill="x", padx=10, pady=5)

        # نیشاندانی ناوی دروستکەر لە کۆتایی فۆرمەکەدا
        self.lbl_credit = ctk.CTkLabel(self.frame_form, text="دروستکردنی:بەهمەن دەروێش علی", font=("Arial", 11, "italic"), text_color="gray")
        self.lbl_credit.pack(side="bottom", pady=15)

        # بەشی پیشاندان و گەڕان (لای ڕاست)
        self.frame_view = ctk.CTkFrame(self)
        self.frame_view.pack(side="right", fill="both", expand=True, padx=10, pady=10)

        self.frame_top = ctk.CTkFrame(self.frame_view, fg_color="transparent")
        self.frame_top.pack(fill="x", padx=5, pady=5)

        self.entry_search = ctk.CTkEntry(self.frame_top, placeholder_text="گەڕان بەدوای لایەن یان ناوچە...", width=280)
        self.entry_search.pack(side="left", padx=5)
        
        self.btn_search = ctk.CTkButton(self.frame_top, text="گەڕان", width=90, command=self.search_data)
        self.btn_search.pack(side="left", padx=5)

        self.btn_reset = ctk.CTkButton(self.frame_top, text="پیشاندانی هەمووی", width=110, fg_color="gray", command=self.load_data)
        self.btn_reset.pack(side="left", padx=5)

        # خشتەی نیشاندانی زانیارییەکان (Treeview)
        self.tree_frame = ctk.CTkFrame(self.frame_view)
        self.tree_frame.pack(fill="both", expand=True, padx=5, pady=5)

        columns = ("ID", "خولی هەڵبژاردن", "لق / بازنە", "ناوچە", "لایەنی سیاسی", "ژمارەی دەنگەکان")
        self.tree = ttk.Treeview(self.tree_frame, columns=columns, show="headings")

        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120)

        self.tree.pack(side="left", fill="both", expand=True)

        self.scrollbar = ttk.Scrollbar(self.tree_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=self.scrollbar.set)
        self.scrollbar.pack(side="right", fill="y")

    def save_record(self):
        cycle = self.combo_cycle.get()
        branch = self.entry_branch.get()
        region = self.entry_region.get()
        party_name = self.entry_party.get()
        votes_str = self.entry_votes.get()

        if not branch or not region or not party_name or not votes_str:
            messagebox.showerror("هەڵە", "تکایە سەرجەم خانەکان پڕبکەرەوە!")
            return

        try:
            votes = int(votes_str)
        except ValueError:
            messagebox.showerror("هەڵە", "ژمارەی دەنگەکان دەبێت تەنها ژمارە بێت!")
            return

        self.cursor.execute('''
            INSERT INTO election_results (cycle, branch, region, party_name, votes)
            VALUES (?, ?, ?, ?, ?)
        ''', (cycle, branch, region, party_name, votes))
        self.conn.commit()

        messagebox.showinfo("سەرکەوتوو بوو", "ئەنجامەکە بە سەرکەوتوویی تۆمارکرا.")
        self.load_data()
        self.clear_form()

    def load_data(self):
        for row in self.tree.get_children():
            self.tree.delete(row)

        self.cursor.execute("SELECT * FROM election_results")
        for row in self.cursor.fetchall():
            self.tree.insert("", "end", values=row)

    def search_data(self):
        query = self.entry_search.get()
        for row in self.tree.get_children():
            self.tree.delete(row)

        self.cursor.execute("SELECT * FROM election_results WHERE party_name LIKE ? OR region LIKE ? OR branch LIKE ?", 
                            (f"%{query}%", f"%{query}%", f"%{query}%"))
        for row in self.cursor.fetchall():
            self.tree.insert("", "end", values=row)

    def show_chart(self):
        self.cursor.execute("SELECT party_name, SUM(votes) FROM election_results GROUP BY party_name")
        data = self.cursor.fetchall()
        
        if not data:
            messagebox.showwarning("ئاگاداری", "هیچ داتایەک نییە بۆ دروستکردنی گرافیک!")
            return

        parties = [row[0] for row in data]
        votes = [row[1] for row in data]

        plt.figure(figsize=(8, 5))
        plt.bar(parties, votes, color='royalblue')
        plt.xlabel("لایەنە سیاسییەکان")
        plt.ylabel("کۆی دەنگەکان")
        plt.title("شیکاری دەنگی لایەنەکان لە هەڵبژاردن")
        plt.xticks(rotation=30)
        plt.tight_layout()
        plt.show()

    def export_excel(self):
        self.cursor.execute("SELECT id, cycle, branch, region, party_name, votes FROM election_results")
        data = self.cursor.fetchall()
        if not data:
            messagebox.showwarning("ئاگاداری", "هیچ زانیارییەک نییە بۆ هەناردەکردن بۆ اکسڵ!")
            return

        df = pd.DataFrame(data, columns=["ID", "خولی هەڵبژاردن", "لق / بازنە", "ناوچە", "لایەنی سیاسی", "ژمارەی دەنگەکان"])
        file_path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx")])
        if file_path:
            df.to_excel(file_path, index=False)
            messagebox.showinfo("سەرکەوتوو بوو", "پەڕگەی اکسڵ بە سەرکەوتوویی پاشەکەوتکرا.")

    def clear_form(self):
        self.entry_branch.delete(0, "end")
        self.entry_region.delete(0, "end")
        self.entry_party.delete(0, "end")
        self.entry_votes.delete(0, "end")

if __name__ == "__main__":
    app = ElectionAnalysisApp()
    app.mainloop()
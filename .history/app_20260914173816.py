import os
import shutil
import sqlite3
from datetime import datetime
from tkinter import messagebox, filedialog
import tkinter as tk
from tkinter import ttk
import customtkinter as ctk
import pandas as pd

# ڕێکخستنی سەرەتایی ڕووکار
ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")

class DocumentApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("سیستەمی بەڕێوەبردنی نوسراوی فەرمی")
        self.geometry("1050x700")
        
        try:
            # دروستکردنی داتابەیس
            self.init_db()

            # دروستکردنی لاپەڕەکان و ڕووکار
            self.create_widgets()
            self.load_data()
        except Exception as e:
            messagebox.showerror("هەڵە لە دەستپێکدا", str(e))
            print(f"Error: {e} - app.py:31")

    def init_db(self):
        self.conn = sqlite3.connect("documents.db")
        self.cursor = self.conn.cursor()
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS docs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_type TEXT,
                doc_number TEXT,
                doc_date TEXT,
                subject TEXT,
                party TEXT,
                notes TEXT
            )
        ''')
        self.conn.commit()

    def create_widgets(self):
        # فۆرمی داخلکردن (لای چەپ)
        self.frame_form = ctk.CTkFrame(self, width=350)
        self.frame_form.pack(side="left", fill="y", padx=10, pady=10)

        ctk.CTkLabel(self.frame_form, text="تۆمارکردنی نوسراوی نوێ", font=("Arial", 16, "bold")).pack(pady=10)

        ctk.CTkLabel(self.frame_form, text="جۆری نوسراو:").pack(anchor="w", padx=10)
        self.combo_type = ctk.CTkComboBox(self.frame_form, values=["هاتو", "ڕۆشتو"])
        self.combo_type.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="ژمارەی نوسراو:").pack(anchor="w", padx=10)
        self.entry_number = ctk.CTkEntry(self.frame_form)
        self.entry_number.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="بەڕێکەوت / بەسەرچوون (بەروار):").pack(anchor="w", padx=10)
        self.entry_date = ctk.CTkEntry(self.frame_form, placeholder_text="YYYY-MM-DD")
        self.entry_date.insert(0, datetime.now().strftime("%Y-%m-%d"))
        self.entry_date.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="بابەت:").pack(anchor="w", padx=10)
        self.entry_subject = ctk.CTkEntry(self.frame_form)
        self.entry_subject.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="لایەنی هاتوو / نێردراو بۆ:").pack(anchor="w", padx=10)
        self.entry_party = ctk.CTkEntry(self.frame_form)
        self.entry_party.pack(fill="x", padx=10, pady=5)

        ctk.CTkLabel(self.frame_form, text="تێبینی:").pack(anchor="w", padx=10)
        self.entry_notes = ctk.CTkTextbox(self.frame_form, height=80)
        self.entry_notes.pack(fill="x", padx=10, pady=5)

        self.btn_save = ctk.CTkButton(self.frame_form, text="تۆمارکردن", fg_color="green", hover_color="darkgreen", command=self.save_document)
        self.btn_save.pack(fill="x", padx=10, pady=15)

        self.btn_backup = ctk.CTkButton(self.frame_form, text="دروستکردنی کۆپی یەدەگ (Backup)", command=self.make_backup)
        self.btn_backup.pack(fill="x", padx=10, pady=5)

        # نیشاندانی ناوی دروستکەر لە کۆتایی فۆرمەکە
        self.lbl_credit = ctk.CTkLabel(self.frame_form, text="دروستکردنی:بەهمەن دەروێش علی", font=("Arial", 11, "italic"), text_color="gray")
        self.lbl_credit.pack(side="bottom", pady=10)

        # بەشی پیشاندان و گەڕان (لای ڕاست)
        self.frame_view = ctk.CTkFrame(self)
        self.frame_view.pack(side="right", fill="both", expand=True, padx=10, pady=10)

        self.frame_top = ctk.CTkFrame(self.frame_view, fg_color="transparent")
        self.frame_top.pack(fill="x", padx=5, pady=5)

        self.entry_search = ctk.CTkEntry(self.frame_top, placeholder_text="گەڕان بەدوای بابەت یان ژمارە...", width=250)
        self.entry_search.pack(side="left", padx=5)
        
        self.btn_search = ctk.CTkButton(self.frame_top, text="گەڕان", width=80, command=self.search_data)
        self.btn_search.pack(side="left", padx=5)

        self.btn_excel = ctk.CTkButton(self.frame_top, text="هەناردن بۆ Excel", fg_color="teal", hover_color="darkcyan", command=self.export_excel)
        self.btn_excel.pack(side="right", padx=5)

        # خشتەی نیشاندانی زانیارییەکان (Treeview)
        self.tree_frame = ctk.CTkFrame(self.frame_view)
        self.tree_frame.pack(fill="both", expand=True, padx=5, pady=5)

        columns = ("ID", "جۆر", "ژمارە", "بەروار", "بابەت", "لایەن", "تێبینی")
        self.tree = ttk.Treeview(self.tree_frame, columns=columns, show="headings")

        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=100)

        self.tree.pack(side="left", fill="both", expand=True)

        self.scrollbar = ttk.Scrollbar(self.tree_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=self.scrollbar.set)
        self.scrollbar.pack(side="right", fill="y")

    def save_document(self):
        doc_type = self.combo_type.get()
        doc_number = self.entry_number.get()
        doc_date = self.entry_date.get()
        subject = self.entry_subject.get()
        party = self.entry_party.get()
        notes = self.entry_notes.get("1.0", "end-1c")

        if not doc_number or not subject:
            messagebox.showerror("هەڵە", "تکایە ژمارەی نوسراو و بابەت پڕبکەرەوە!")
            return

        self.cursor.execute('''
            INSERT INTO docs (doc_type, doc_number, doc_date, subject, party, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (doc_type, doc_number, doc_date, subject, party, notes))
        self.conn.commit()

        messagebox.showinfo("سەرکەوتوو بوو", "نوسراوەکە بە سەرکەوتوویی تۆمارکرا.")
        self.load_data()
        self.clear_form()

    def load_data(self):
        for row in self.tree.get_children():
            self.tree.delete(row)

        self.cursor.execute("SELECT * FROM docs")
        for row in self.cursor.fetchall():
            self.tree.insert("", "end", values=row)

    def search_data(self):
        query = self.entry_search.get()
        for row in self.tree.get_children():
            self.tree.delete(row)

        self.cursor.execute("SELECT * FROM docs WHERE subject LIKE ? OR doc_number LIKE ?", (f"%{query}%", f"%{query}%"))
        for row in self.cursor.fetchall():
            self.tree.insert("", "end", values=row)

    def export_excel(self):
        self.cursor.execute("SELECT * FROM docs")
        data = self.cursor.fetchall()
        if not data:
            messagebox.showwarning("ئاگاداری", "هیچ زانیارییەک نییە بۆ هەناردەکردن!")
            return

        df = pd.DataFrame(data, columns=["ID", "جۆر", "ژمارە", "بەروار", "بابەت", "لایەن", "تێبینی"])
        file_path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx")])
        if file_path:
            df.to_excel(file_path, index=False)
            messagebox.showinfo("سەرکەوتوو بوو", "پەڕگەی اکسڵ بە سەرکەوتوویی پاشەکەوتکرا.")

    def make_backup(self):
        if not os.path.exists("backups"):
            os.makedirs("backups")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"backups/documents_backup_{timestamp}.db"
        shutil.copy("documents.db", backup_path)
        messagebox.showinfo("سەرکەوتوو بوو", f"کۆپی یەدەگ بە سەرکەوتوویی دروستکرا لە:\n{backup_path}")

    def clear_form(self):
        self.entry_number.delete(0, "end")
        self.entry_subject.delete(0, "end")
        self.entry_party.delete(0, "end")
        self.entry_notes.delete("1.0", "end")

if __name__ == "__main__":
    app = DocumentApp()
    app.mainloop()
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import pandas as pd

# نموونەی دروستکردنی پەنجەرە و چارتەکە (دەتوانیت لە پرۆگرامەکەی خۆتدا خستنەسەری ئەم بەشە بکەیت)
# دڵنیابە لەوەی کتێبخانە پێویستەکانت هەن: tkinter, matplotlib, pandas

def create_pie_chart(parent_frame, df):
    # پاککردنەوەی چارتەکانی پێشوو ئەگەر هەبن
    for widget in parent_frame.winfo_children():
        widget.destroy()

    # خوێندنەوەی داتا لە DataFrame (بۆ نموونە ستوونەکانی ناوی لایەن، دەنگ، و ڕەنگ)
    labels = df['Name'].tolist()
    votes = df['Votes'].tolist()
    colors = df['Color'].tolist()  # ئەو ڕەنگانەی بۆ هەر لایەنێک دیاری کراون

    # گەورەکردن و فراوانترکردنی قەبارەی چارتەکە
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(aspect="equal"))
    
    # دروستکردنی دۆنەت چارت (Donut Chart) بە قەبارەیەکی گەورەتر
    wedges, texts = ax.pie(
        votes, 
        colors=colors, 
        startangle=90, 
        wedgeprops=dict(width=0.4, edgecolor='w') # width بۆ قەبارەی کونە ناوەڕاستەکە و ئەستووری چارتەکە
    )

    # زیادکردنی دەقی ناوەڕاست (ناوی هێڵکاری و کۆی گشتی دەنگەکان)
    total_votes = sum(votes)
    ax.text(0, 0.1, "هێڵکاری بازنەیی", ha='center', va='center', fontsize=14, fontweight='bold', fontname='Arial')
    ax.text(0, -0.1, f"{total_votes:,} دەنگ", ha='center', va='center', fontsize=12, fontname='Arial')

    ax.axis('equal')  # بۆ ئەوەی بازنەکە خڕ بمێنێتەوە و شێواو نەبێت
    plt.tight_layout()

    # خستنە ناو Tkinter
    canvas = FigureCanvasTkAgg(fig, master=parent_frame)
    canvas.draw()
    canvas.get_tk_widget().pack(fill="both", expand=True)

# نموونەی تاقیکردنەوەی داتا (ئەگەر لە پرۆگرامەکەتدا داتاکانت هەن، تەنها ئەم بەشە بەکاربهێنە بۆ پڕۆژەکەی خۆت)
# df = pd.DataFrame({
#     'Name': ['پارتی دیموکراتی کوردستان', 'یەکیتی نیشتمانی کوردستان', 'نەوەی نوێ', 'کۆمەڵی دادگەری', 'یەکگرتووی ئیسلامی کوردستان', 'هەڵوێست'],
#     'Votes': [19250, 124000, 89000, 3500, 11000, 43000],
#     'Color': ['#f1c40f', '#2ecc71', '#f39c12', '#795548', '#8D6E63', '#9b59b6']
# })
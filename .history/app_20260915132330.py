import sqlite3
import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

# ڕێکخستنی پەڕەی وێبسایتەکە
st.set_page_config(
    page_title="سیستەمی تۆمارکردن و چارتی لایەنە سیاسیەکان", layout="wide"
)


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


init_db()

# ناونیشانی سەرەکی و پۆستەر
st.title("🗳️ سیستەمی تۆمارکردن و چارتی لایەنە سیاسیەکان")
st.markdown("*دروستکردنی: بەهمەن دەروێش علی*")
st.markdown("---")

# بەشی لای چەپ یان سەرەوە بۆ داخڵکردنی داتا (Sidebar)
st.sidebar.header("📝 داخڵکردنی داتای لایەنەکان")

with st.sidebar.form("party_form"):
  cycle = st.selectbox(
      "حکومی / جۆر:",
      ["حکومی", "ئەنجومەنی پارێزگاکان", "پەرلەمانی کوردستان", "پەرلەمانی عێراق"],
  )
  party_name = st.text_input("ناوی لایەن:")
  votes = st.text_input("ژمارەی دەنگ:")
  color = st.text_input(
      "ڕەنگ (بۆ نموونە: blue, red, #ff9999):", value="blue"
  )

  submit_button = st.form_submit_button(label="تۆمارکردن")

if submit_button:
  if not party_name or not votes or not color:
    st.sidebar.error("تکایە هەموو خانەکان پڕبکەرەوە!")
  else:
    try:
      votes_int = int(votes)
      conn = sqlite3.connect("parties_data.db")
      cursor = conn.cursor()
      cursor.execute(
          "INSERT INTO parties (cycle, party_name, votes, color) VALUES (?, ?,"
          " ?, ?)",
          (cycle, party_name, votes_int, color),
      )
      conn.commit()
      conn.close()
      st.sidebar.success("داتاکە بە سەرکەوتوویی پاشەکەوت کرا!")
      st.rerun()
    except ValueError:
      st.sidebar.error("ژمارەی دەنگ دەبێت تەنها ژمارە بێت!")

# بەشی پیشاندانی داتا و چارتەکان لە ناوەڕاستدا
col1, col2 = st.columns(2)

with col1:
  st.subheader("📋 خشتەی تۆمارکراوەکان")
  conn = sqlite3.connect("parties_data.db")
  cursor = conn.cursor()
  cursor.execute("SELECT * FROM parties")
  rows = cursor.fetchall()
  conn.close()

  if rows:
    df = pd.DataFrame(
        rows, columns=["کۆد", "ڕوکار / جۆر", "ناوی لایەن", "ژمارەی دەنگ", "ڕەنگ"]
    )
    st.dataframe(df, use_container_width=True)

    # بەشی سڕینەوە
    st.subheader("🗑️ سڕینەوەی لایەن")
    delete_id = st.selectbox(
        "کۆدی لایەن هەڵبژێرە بۆ سڕینەوە:", df["کۆد"].tolist()
    )
    if st.button("سڕینەوەی هەڵبژاردە", type="primary"):
      conn = sqlite3.connect("parties_data.db")
      cursor = conn.cursor()
      cursor.execute("DELETE FROM parties WHERE id = ?", (delete_id,))
      conn.commit()
      conn.close()
      st.success("داتاکە سڕایەوە!")
      st.rerun()
  else:
    st.info("هیچ داتایەک تۆمار نەکراوە.")

with col2:
  st.subheader("📊 بەشی شیکاری و چارتەکان")
  filter_cycle = st.selectbox(
      "ڕوکار بۆ پیشاندانی چارت:",
      ["حکومی", "ئەنجومەنی پارێزگاکان", "پەرلەمانی کوردستان", "پەرلەمانی عێراق"],
      key="filter_cycle",
  )
  chart_type = st.radio("جۆری چارت:", ["Pie", "Donut"], horizontal=True)

  conn = sqlite3.connect("parties_data.db")
  cursor = conn.cursor()
  cursor.execute(
      "SELECT party_name, votes, color FROM parties WHERE cycle = ? ORDER BY"
      " votes DESC",
      (filter_cycle,),
  )
  data = cursor.fetchall()
  conn.close()

  fig, ax = plt.subplots(figsize=(6, 4))

  if not data:
    ax.text(
        0.5,
        0.5,
        f"هیچ داتایەک نییە بۆ {filter_cycle}",
        ha="center",
        va="center",
        fontsize=12,
    )
    ax.axis("off")
  else:
    parties = [row[0] for row in data]
    votes_list = [row[1] for row in data]
    colors = [row[2] for row in data]

    if chart_type == "Pie":
      ax.pie(
          votes_list,
          labels=parties,
          colors=colors,
          autopct="%1.1f%%",
          startangle=140,
      )
      ax.set_title(f"چارتی پای - {filter_cycle}")
    else:
      ax.pie(
          votes_list,
          labels=parties,
          colors=colors,
          autopct="%1.1f%%",
          startangle=140,
          wedgeprops=dict(width=0.4, edgecolor="w"),
      )
      ax.set_title(f"چارتی دۆنەت - {filter_cycle}")

  fig.tight_layout()
  st.pyplot(fig)
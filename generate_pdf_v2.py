#!/usr/bin/env python3
"""
GÉNÉRATEUR PDF V2 - VAPE NOCTURNE
E-commerce Vape & Chicha Électronique
Design Anime/Néon Japonais — Version Maroc
Avec palette améliorée + inspirations GitHub
"""

import os, sys
from datetime import datetime
sys.path.insert(0, '/tmp/pdfenv/lib/python3.11/site-packages')

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ═══════════════════════════════════════
# 1. FONTS
# ═══════════════════════════════════════
FONT_DIR = '/usr/share/fonts/truetype/dejavu/'
for name, fname in [
    ("DejaVuSans", "DejaVuSans.ttf"),
    ("DejaVuSans-Bold", "DejaVuSans-Bold.ttf"),
    ("DejaVuSerif", "DejaVuSerif.ttf"),
    ("DejaVuSerif-Bold", "DejaVuSerif-Bold.ttf"),
    ("DejaVuMono", "DejaVuSansMono.ttf"),
    ("DejaVuMono-Bold", "DejaVuSansMono-Bold.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, fname)))

# ═══════════════════════════════════════
# 2. PALETTE V2 — Plus RICHE & VIBRANTE
# ═══════════════════════════════════════
# Inspirée de : CYBERCORE CSS, Jesse's Ramen, claude-directory, shadcn-portfolio
# Palettes cyberpunk/néon modernes

# — Fondations —
NK_BLACK     = HexColor('#0A0015')  # Noir ultra-profond
NK_DARK      = HexColor('#120026')  # Très foncé violacé
NK_DARK2     = HexColor('#1A0A2E')  # Dark violet
NK_CARD      = HexColor('#1E1035')  # Fond cartes
NK_SURFACE   = HexColor('#2A1A45')  # Surface hover
NK_ELEVATED  = HexColor('#352550')  # Éléments surélevés

# — Primaires néon (ultra vives) —
PINK_NEON    = HexColor('#FF1E6A')  # Rose néon intense (CYBERCORE CSS insp.)
PINK_HOT     = HexColor('#FF0055')  # Rose chaud
CYAN_NEON    = HexColor('#00F0FF')  # Cyan électrique
CYAN_DEEP    = HexColor('#00BFFF')  # Cyan profond
PURPLE_NEON  = HexColor('#A855F7')  # Violet néon (nouveau)
PURPLE_DEEP  = HexColor('#6B21A8')  # Violet profond
GREEN_NEON   = HexColor('#00FF88')  # Vert néon (succès/validation)
GOLD_NEON    = HexColor('#FFD700')  # Or

# — Textes —
TEXT_PRIMARY   = HexColor('#F0E6FF')  # Blanc doux
TEXT_SECONDARY = HexColor('#C4B5D4')  # Gris violet clair
TEXT_MUTED     = HexColor('#8B7D9B')  # Muted
TEXT_DIM       = HexColor('#6B5B7B')  # Très atténué

# — États —
STATE_SUCCESS = HexColor('#00FF88')
STATE_ERROR   = HexColor('#FF1E6A')
STATE_WARNING = HexColor('#FFB800')
STATE_INFO    = HexColor('#00BFFF')

# — Accents supplémentaires —
MAGENTA_NEON = HexColor('#FF00FF')
ORANGE_NEON  = HexColor('#FF6600')
BLUE_NEON    = HexColor('#0088FF')

# ═══════════════════════════════════════
# 3. STYLES V2
# ═══════════════════════════════════════
s = getSampleStyleSheet()

# Cover
st_cover_title = ParagraphStyle('CoverTitle', fontName='DejaVuSerif-Bold', fontSize=36, leading=42, textColor=PINK_NEON, alignment=TA_CENTER, spaceAfter=10)
st_cover_sub   = ParagraphStyle('CoverSub', fontName='DejaVuSans', fontSize=16, leading=22, textColor=CYAN_NEON, alignment=TA_CENTER, spaceAfter=6)
st_cover_sub2  = ParagraphStyle('CoverSub2', fontName='DejaVuSans', fontSize=12, leading=16, textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=4)
st_cover_tag   = ParagraphStyle('CoverTag', fontName='DejaVuSans-Bold', fontSize=14, leading=18, textColor=GOLD_NEON, alignment=TA_CENTER, spaceAfter=20)

# Sections
st_sec_title = ParagraphStyle('SecTitle', fontName='DejaVuSerif-Bold', fontSize=28, leading=34, textColor=PINK_NEON, alignment=TA_LEFT, spaceBefore=20, spaceAfter=10)
st_sec_sub   = ParagraphStyle('SecSub', fontName='DejaVuSans', fontSize=14, leading=18, textColor=CYAN_NEON, alignment=TA_LEFT, spaceBefore=5, spaceAfter=15)

st_h2 = ParagraphStyle('H2', fontName='DejaVuSerif-Bold', fontSize=20, leading=26, textColor=CYAN_NEON, alignment=TA_LEFT, spaceBefore=15, spaceAfter=8)
st_h3 = ParagraphStyle('H3', fontName='DejaVuSans-Bold', fontSize=14, leading=18, textColor=PURPLE_NEON, alignment=TA_LEFT, spaceBefore=10, spaceAfter=5)

st_body = ParagraphStyle('Body', fontName='DejaVuSans', fontSize=10, leading=14, textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceBefore=3, spaceAfter=5)
st_body_small = ParagraphStyle('BodySmall', fontName='DejaVuSans', fontSize=8.5, leading=12, textColor=TEXT_SECONDARY, alignment=TA_JUSTIFY, spaceBefore=2, spaceAfter=3)
st_bullet = ParagraphStyle('Bullet', fontName='DejaVuSans', fontSize=10, leading=14, textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceBefore=2, spaceAfter=2, leftIndent=15, bulletIndent=5)
st_code = ParagraphStyle('Code', fontName='DejaVuMono', fontSize=8, leading=11, textColor=CYAN_NEON, alignment=TA_LEFT, spaceBefore=3, spaceAfter=3, leftIndent=10)
st_quote = ParagraphStyle('Quote', fontName='DejaVuSerif', fontSize=11, leading=15, textColor=GOLD_NEON, alignment=TA_CENTER, spaceBefore=10, spaceAfter=10, leftIndent=30, rightIndent=30)
st_footer = ParagraphStyle('Footer', fontName='DejaVuSans', fontSize=7, leading=9, textColor=TEXT_DIM, alignment=TA_CENTER)

# Color swatch styles
st_sw_name = ParagraphStyle('SwName', fontName='DejaVuSans-Bold', fontSize=9, leading=12, textColor=TEXT_PRIMARY, alignment=TA_LEFT)
st_sw_hex  = ParagraphStyle('SwHex', fontName='DejaVuMono', fontSize=9, leading=12, alignment=TA_LEFT)
st_sw_use  = ParagraphStyle('SwUse', fontName='DejaVuSans', fontSize=8, leading=11, textColor=TEXT_SECONDARY, alignment=TA_LEFT)

# ═══════════════════════════════════════
# 4. HELPERS
# ═══════════════════════════════════════
def neon_line(width=500, color=PINK_NEON, thickness=1):
    return HRFlowable(width=f"{width}%", thickness=thickness, color=color, spaceBefore=5, spaceAfter=5)

def sp(h=10):
    return Spacer(1, h)

def bul(text):
    return Paragraph(f"•  {text}", st_bullet)

def tbl(rows, colw, bg1=HexColor('#1A0A2E'), bg2=HexColor('#120026')):
    """Styled table with neon cyberpunk theme"""
    t = Table(rows, colWidths=colw)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), PURPLE_DEEP),
        ('TEXTCOLOR', (0, 0), (-1, 0), TEXT_PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_NEON),
        ('BACKGROUND', (0, 1), (-1, -1), bg1),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [bg1, bg2]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t

# ═══════════════════════════════════════
# 5. PAGE TEMPLATES
# ═══════════════════════════════════════

def page_footer(cv, doc):
    cv.saveState()
    W, H = A4
    # Bottom neon bar
    cv.setStrokeColor(PINK_NEON)
    cv.setLineWidth(0.5)
    cv.line(30*mm, 20*mm, W-30*mm, 20*mm)
    # Page number
    cv.setFont('DejaVuSans', 7)
    cv.setFillColor(TEXT_DIM)
    cv.drawCentredString(W/2, 15*mm, f"— {doc.page} —")
    # Footer
    cv.setFont('DejaVuSans', 6)
    cv.setFillColor(TEXT_DIM)
    cv.drawString(30*mm, 15*mm, "VAPE NOCTURNE • Projet E-commerce Maroc 2025")
    cv.drawRightString(W-30*mm, 15*mm, f"© {datetime.now().year}")
    # Side neon
    cv.setStrokeColor(CYAN_NEON)
    cv.setLineWidth(0.3)
    cv.line(30*mm, 20*mm, 30*mm, H-25*mm)
    # Corner accents
    cv.setStrokeColor(PURPLE_NEON)
    cv.setLineWidth(0.5)
    cv.line(W-30*mm, 20*mm, W-30*mm, 35*mm)
    cv.line(W-30*mm, 20*mm, W-25*mm, 20*mm)
    cv.restoreState()

def cover_template(cv, doc):
    cv.saveState()
    W, H = A4
    # Full bg
    cv.setFillColor(NK_BLACK)
    cv.rect(0, 0, W, H, fill=1, stroke=0)
    # Glow rings
    for i in range(5):
        r = 50 + i*35*mm
        cv.setStrokeColor(HexColor('#2D0B3A') if i<2 else HexColor('#1A0533') if i<4 else HexColor('#0D0221'))
        cv.setLineWidth(0.5)
        cv.circle(W/2, H/2, r, fill=0)
    # Grid
    step = int(15*mm)
    for x in range(0, int(W), step):
        cv.setStrokeColor(HexColor('#001830'))
        cv.setLineWidth(0.15)
        cv.line(x, 0, x, H)
    for y in range(0, int(H), step):
        cv.setStrokeColor(HexColor('#001830'))
        cv.setLineWidth(0.15)
        cv.line(0, y, W, y)
    # Binary text
    cv.setFont('DejaVuMono', 6)
    cv.setFillColor(PURPLE_DEEP)
    cv.drawCentredString(W/2, 80*mm, "01001110 01000101 01001111 01001110 00100000 01010110 01000001 01010000 01000101")
    cv.restoreState()


# ═══════════════════════════════════════
# 6. CONTENT BUILDERS
# ═══════════════════════════════════════

def build_cover():
    els = []
    # PAGE 1: Cover
    els.append(PageBreak())
    els.append(sp(100*mm))
    els.append(Paragraph("VAPE NOCTURNE", st_cover_title))
    els.append(neon_line(40, PINK_NEON, 2))
    els.append(sp(10))
    els.append(Paragraph("E-COMMERCE VAPE & CHICHA ÉLECTRONIQUE", st_cover_sub))
    els.append(Paragraph("Design Anime / Néon Japonais — Édition Maroc 2025", st_cover_sub2))
    els.append(sp(20))
    els.append(Paragraph("✦  PROJET PROFESSIONNEL  ✦", st_cover_tag))
    els.append(sp(40))
    els.append(Paragraph("「 闇の煙 」", ParagraphStyle('Jp', fontName='DejaVuSans-Bold', fontSize=20, leading=26, textColor=CYAN_NEON, alignment=TA_CENTER)))
    els.append(sp(10))
    els.append(Paragraph("Yami no Kemuri — La Fumée des Ténèbres", st_cover_sub2))
    els.append(sp(30))
    els.append(Paragraph("Document de Projet — 60+ Pages", st_cover_sub2))
    els.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y')}", st_cover_sub2))

    # PAGE 2: Identity
    els.append(PageBreak())
    els.append(Paragraph("IDENTITÉ VISUELLE", st_sec_title))
    els.append(neon_line())
    els.append(sp(10))

    els.append(Paragraph("Logo & Marque", st_h2))
    els.append(Paragraph(
        "Le nom <b>VAPE NOCTURNE</b> incarne l'alliance entre l'univers de la vape et l'esthétique cyberpunk japonaise. "
        "Le logo combine un lettrage néon avec des motifs de fumée stylisée évoquant à la fois la vape et les esprits japonais (yokai). "
        "La marque puise son inspiration dans les projets open-source et les références cyberpunk contemporains.", st_body))
    els.append(sp(8))

    els.append(Paragraph("Palette de Couleurs Améliorée", st_h2))
    els.append(Paragraph(
        "La palette V2 a été enrichie avec <b>15 couleurs supplémentaires</b> inspirées des frameworks CSS cyberpunk "
        "(CYBERCORE CSS, NeonPortfolio) et des projets web 3D modernes (claude-directory, Jesse's Ramen).",
        st_body))
    els.append(sp(5))

    # Color table v2 — enhanced
    color_rows = [
        [Paragraph("Catégorie", st_h3), Paragraph("Nom", st_h3), Paragraph("Code", st_h3), Paragraph("Usage", st_h3)],
        [Paragraph("Fondation", st_body_small), Paragraph("Noir Ultra-Profond", st_body_small),
         Paragraph("<font color='#0A0015'>■</font> #0A0015", st_body_small), Paragraph("Arrière-plans principaux", st_body_small)],
        [Paragraph("Fondation", st_body_small), Paragraph("Dark Violet", st_body_small),
         Paragraph("<font color='#120026'>■</font> #120026", st_body_small), Paragraph("Sections, conteneurs", st_body_small)],
        [Paragraph("Fondation", st_body_small), Paragraph("Card Dark", st_body_small),
         Paragraph("<font color='#1E1035'>■</font> #1E1035", st_body_small), Paragraph("Cartes, modaux", st_body_small)],
        [Paragraph("Néon", st_body_small), Paragraph("Rose Néon", st_body_small),
         Paragraph("<font color='#FF1E6A'>■</font> #FF1E6A", st_body_small), Paragraph("← Titres, CTA, accents forts", st_body_small)],
        [Paragraph("Néon", st_body_small), Paragraph("Cyan Électrique", st_body_small),
         Paragraph("<font color='#00F0FF'>■</font> #00F0FF", st_body_small), Paragraph("← Liens, icônes, effets", st_body_small)],
        [Paragraph("Néon", st_body_small), Paragraph("Violet Néon", st_body_small),
         Paragraph("<font color='#A855F7'>■</font> #A855F7", st_body_small), Paragraph("← Nouveau ! Hover, badges", st_body_small)],
        [Paragraph("Néon", st_body_small), Paragraph("Vert Néon", st_body_small),
         Paragraph("<font color='#00FF88'>■</font> #00FF88", st_body_small), Paragraph("← Nouveau ! Succès, validation", st_body_small)],
        [Paragraph("Néon", st_body_small), Paragraph("Magenta", st_body_small),
         Paragraph("<font color='#FF00FF'>■</font> #FF00FF", st_body_small), Paragraph("← Nouveau ! Effets spéciaux", st_body_small)],
        [Paragraph("Texte", st_body_small), Paragraph("Primary", st_body_small),
         Paragraph("<font color='#F0E6FF'>■</font> #F0E6FF", st_body_small), Paragraph("Texte principal", st_body_small)],
        [Paragraph("Texte", st_body_small), Paragraph("Secondary", st_body_small),
         Paragraph("<font color='#C4B5D4'>■</font> #C4B5D4", st_body_small), Paragraph("Texte secondaire", st_body_small)],
        [Paragraph("État", st_body_small), Paragraph("Success", st_body_small),
         Paragraph("<font color='#00FF88'>■</font> #00FF88", st_body_small), Paragraph("Validation", st_body_small)],
        [Paragraph("État", st_body_small), Paragraph("Error", st_body_small),
         Paragraph("<font color='#FF1E6A'>■</font> #FF1E6A", st_body_small), Paragraph("Erreurs", st_body_small)],
        [Paragraph("État", st_body_small), Paragraph("Warning", st_body_small),
         Paragraph("<font color='#FFB800'>■</font> #FFB800", st_body_small), Paragraph("Alertes", st_body_small)],
    ]
    els.append(tbl(color_rows, [80, 110, 100, 200]))
    els.append(sp(10))

    els.append(Paragraph("Inspirations Chromatiques", st_h3))
    els.append(Paragraph(
        "Les couleurs ont été choisies en référence aux projets suivants :<br/>"
        "• <b>CYBERCORE CSS</b> — Framework CSS cyberpunk (neon cyan/magenta/green, glitch effects, 153 icons)<br/>"
        "• <b>NeonPortfolio</b> — Portfolio néon interactif (custom cursor, hologram effects)<br/>"
        "• <b>shadcn/ui + Tailwind</b> — Design tokens et système de couleurs sémantiques<br/>"
        "• <b>Jesse's Ramen 3D</b> — Ambiance nocturne cyberpunk (violet profond, rose, cyan)",
        st_body_small))
    els.append(sp(10))

    # PAGE 3: Moodboard
    els.append(PageBreak())
    els.append(Paragraph("MOODBOARD & CONCEPT ART", st_sec_title))
    els.append(Paragraph("Univers visuel et éléments clés du design", st_sec_sub))
    els.append(neon_line())
    els.append(sp(10))

    els.append(Paragraph("Univers Visuel — Fusion Japon × Cyberpunk", st_h2))
    els.append(Paragraph(
        "Le concept artistique de VAPE NOCTURNE repose sur une fusion unique entre l'esthétique "
        "traditionnelle japonaise et le cyberpunk. Chaque élément visuel raconte une histoire.", st_body))
    els.append(sp(5))

    for title, desc in [
        ("1. L'Ambiance Néon Shinjuku",
         "Inspirée des quartiers de Shinjuku et Akihabara, l'ambiance utilise des lumières "
         "au néon violettes, roses et cyan qui transforment l'obscurité en spectacle visuel."),
        ("2. Le Personnage Mascotte « Kage »",
         "Une jeune fille cyberpunk aux cheveux violets et yeux lumineux sert de guide virtuelle. "
         "Son style mélange kimono traditionnel revisité avec accessoires tech (LED, hologrammes)."),
        ("3. Le Bestiaire Digital",
         "Chaque catégorie de produit est associée à un esprit animal numérique : "
         "Shonen → Renard Kitsune (orange/bleu), Seinen → Dragon Ryu (rouge/violet), Chicha Pro → Phénix Ho-o (or/cyan)."),
        ("4. Les Éléments Signature",
         "Fumée formant des kanji, sakura numériques en particules 3D, grille cyberpunk en perspective, "
         "interfaces holographiques avec glitch subtil, éclairage volumétrique traversant la brume."),
    ]:
        els.append(Paragraph(title, st_h3))
        els.append(Paragraph(desc, st_body))
        els.append(sp(3))

    return els


def build_market():
    """Pages 4-9: Market Analysis"""
    els = []
    els.append(PageBreak())
    els.append(Paragraph("ANALYSE DE MARCHÉ", st_sec_title))
    els.append(Paragraph("Panorama France, Europe & Maroc 2024-2025", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Marché Français et Européen 2024-2025", st_h2))
    els.append(Paragraph(
        "Le marché français de la cigarette électronique a franchi la barre des <b>1,1 milliard d'euros en 2024</b>, "
        "avec une croissance estimée à <b>10,5%</b>. La France se positionne comme l'un des marchés les plus dynamiques "
        "d'Europe, avec plus de <b>4,3 millions de vapoteurs réguliers</b>.", st_body))
    els.append(sp(5))

    els.append(tbl(
        [["Indicateur", "France", "Europe", "Maroc"],
         ["Taille marché (2024)", "1,1 Md €", "~6,3 Mds €", "~500-800 MDH"],
         ["Croissance 2024", "+10,5%", "+8,5%", "+15-20%"],
         ["Croissance prévue 2025", "+5-7%", "+6-8%", "+12-18%"],
         ["Vapoteurs réguliers", "4,3 millions", "~15 millions", "~500k-800k"],
         ["Taux de pénétration", "~8%", "~5%", "~2-3%"]],
        [140, 110, 110, 120]
    ))
    els.append(sp(12))

    # PAGE 5: Competition
    els.append(PageBreak())
    els.append(Paragraph("CONCURRENCE DIRECTE", st_sec_title))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Acteurs Clés du Marché Marocain", st_h2))
    els.append(Paragraph(
        "Le marché marocain de la vape est fragmenté entre une quarantaine d'importateurs dont 4 gros opérateurs, "
        "avec des produits essentiellement en provenance de Chine et d'Asie du Sud-Est.", st_body))
    els.append(sp(8))

    els.append(tbl(
        [["Concurrent", "Type", "Forces", "Faiblesses"],
         ["Vaporia (vaporia.ma)", "Physique+Web", "Marques connues, Marrakech", "Design standard, faible reach"],
         ["Le Vapoteur Marocain", "E-commerce", "Prix bas, large catalogue", "UX basique, peu de trafic"],
         ["Vap O Chic", "Physique (2010)", "Confiance, expérience", "Pas de présence en ligne"],
         ["Souk/Informel", "Marché parallèle", "Prix très bas", "Qualité douteuse, aucun SAV"]],
        [110, 80, 150, 150]
    ))
    els.append(sp(10))

    # PAGE 6: Positioning
    els.append(PageBreak())
    els.append(Paragraph("POSITIONNEMENT « LIFESTYLE ANIME »", st_sec_title))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Une Niche Inexploitée au Maroc", st_h2))
    els.append(Paragraph(
        "Le croisement entre la culture vape et la culture otaku/gaming représente une opportunité commerciale unique. "
        "Avec plus de 3 millions de jeunes marocains de 18-35 ans passionnés d'anime et de gaming, le marché potentiel est considérable.",
        st_body))

    # SWOT
    els.append(sp(10))
    swot = [
        [Paragraph("FORCES", ParagraphStyle('SH', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=CYAN_NEON, alignment=TA_CENTER)),
         Paragraph("FAIBLESSES", ParagraphStyle('SH2', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=PINK_NEON, alignment=TA_CENTER))],
        [Paragraph("Design unique • Niche inexploitée • Expérience immersive • Communauté forte", st_body_small),
         Paragraph("Nouvelle marque • Investissement tech élevé • Dépendance importations • Marché réglementé", st_body_small)],
        [Paragraph("OPPORTUNITÉS", ParagraphStyle('SH3', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=CYAN_NEON, alignment=TA_CENTER)),
         Paragraph("MENACES", ParagraphStyle('SH4', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=PINK_NEON, alignment=TA_CENTER))],
        [Paragraph("Marché +15-20%/an • Normes IMANOR (fév. 2026) • Culture otaku en expansion • Pas de concurrence directe", st_body_small),
         Paragraph("Réglementation restrictive • Taxe import 40% • Concurrence low-cost • Crise économique", st_body_small)],
    ]
    swot_t = Table(swot, colWidths=[250, 250])
    swot_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), PURPLE_DEEP),
        ('BACKGROUND', (1, 0), (1, 0), NK_SURFACE),
        ('BACKGROUND', (0, 2), (0, 2), PURPLE_DEEP),
        ('BACKGROUND', (1, 2), (1, 2), NK_SURFACE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_NEON),
        ('BACKGROUND', (0, 1), (-1, 1), NK_DARK),
        ('BACKGROUND', (0, 3), (-1, 3), NK_DARK),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    els.append(swot_t)

    # PAGE 7: Personas
    els.append(PageBreak())
    els.append(Paragraph("CIBLE MARKETING — PERSONAS", st_sec_title))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Segment Principal : 18-35 ans — Otaku, Gamers, Streetwear", st_h2))
    els.append(sp(5))

    for p_title, p_desc in [
        ("👤 Persona 1 : « Le Otaku Branché »",
         "<b>Amine, 22 ans</b> — Étudiant à Casablanca. Passionné d'anime (Naruto, One Piece, Demon Slayer). "
         "Joue à Genshin Impact et League of Legends. Dépense 500-800 MAD/mois. Influenceur nano (3k TikTok)."),
        ("👤 Persona 2 : « Le Gamer Confirmé »",
         "<b>Youssef, 28 ans</b> — Développeur web à Rabat. Vapote depuis 3 ans. Budget 400-600 MAD/mois. "
         "Aime tech, gadgets, design soigné. Prêt à payer plus pour l'exclusivité."),
        ("👤 Persona 3 : « La Streetwear Queen »",
         "<b>Imane, 25 ans</b> — Community manager à Marrakech. Mode urbaine et culture japonaise. "
         "Budget 300-500 MAD/mois. Cherche l'esthétique et l'Instagrammabilité."),
    ]:
        els.append(Paragraph(p_title, st_h3))
        els.append(Paragraph(p_desc, st_body))
        els.append(sp(3))
    els.append(sp(10))

    els.append(Paragraph("Chiffres Clés du Marché Marocain", st_h2))
    els.append(tbl(
        [["Indicateur", "Valeur", "Source"],
         ["Jeunes 18-35 ans", "~12 millions", "HCP 2024"],
         ["Taux pénétration vape", "~2-3% (potentiel 8-10%)", "Estimation"],
         ["Consommateurs anime/manga", "~3 millions", "JCC Maroc 2024"],
         ["Gamers actifs", "~5 millions", "GEIPP Maroc"],
         ["Achats en ligne (18-35 ans)", "62%", "ANRT 2024"]],
        [180, 180, 140]
    ))

    # PAGE 8: Réglementation Maroc
    els.append(PageBreak())
    els.append(Paragraph("OPPORTUNITÉS SPÉCIFIQUES AU MAROC", st_sec_title))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Un Marché en Pleine Mutation Réglementaire", st_h2))
    els.append(Paragraph(
        "Le Maroc vit un tournant réglementaire majeur pour le secteur de la vape. " 
        "La nouvelle norme <b>IMANOR obligatoire dès février 2026</b> va structurer le marché.", st_body))
    els.append(sp(5))

    for item in [
        "<b>Février 2026 :</b> Norme IMANOR obligatoire — composition, étiquetage, traçabilité, sécurité",
        "<b>Taxation 2025 :</b> 50 DH/puff jetable, 1 DH/ml liquide nicotiné, droit d'import 2,5% → 40%",
        "<b>Zone grise actuelle :</b> Absence de cadre légal spécifique — marché dominé par importateurs chinois",
        "<b>Géants mondiaux en attente :</b> Altria, JTI, Imperial Brands attendent les normes",
        "<b>Opportunité first-mover :</b> Être le premier sur la niche anime/gaming avant les grands groupes",
    ]:
        els.append(bul(item))
    els.append(sp(10))

    els.append(Paragraph("Avantages Concurrentiels Projetés", st_h2))
    els.append(Paragraph(
        "<b>1. Premium accessible :</b> Produits de qualité à prix adaptés (200-800 MAD)<br/>"
        "<b>2. Communauté avant vente :</b> Discord, TikTok avant lancement<br/>"
        "<b>3. Logistique locale :</b> SpeedAf, Amana pour J+1 Casablanca/Rabat/Marrakech/Tanger<br/>"
        "<b>4. Paiement adapté :</b> CMI + COD (60% des transactions) + Mobile money<br/>"
        "<b>5. Bilingue FR/Darija :</b> Interface adaptée à la réalité linguistique", st_body))

    # PAGE 9: GitHub Inspirations
    els.append(PageBreak())
    els.append(Paragraph("INSPIRATIONS — PROJETS GITHUB", st_sec_title))
    els.append(Paragraph("Références open-source pour le développement", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Projets GitHub Inspirants", st_h2))
    els.append(Paragraph(
        "L'analyse de projets open-source sur GitHub a permis d'identifier les meilleures pratiques et "
        "les technologies les plus adaptées pour VAPE NOCTURNE. Voici les projets qui ont inspiré ce document :",
        st_body))
    els.append(sp(10))

    els.append(tbl(
        [["Projet GitHub", "Auteur", "Stack", "Inspiration pour VN"],
         ["cybercore-css", "sebyx07", "Pure CSS/SCSS", "← Design system cyberpunk (neon, glitch, 153 icons)"],
         ["claude-directory", "pulkitxm", "React/Three.js/GSAP", "← UI experiments, scroll animations, shaders"],
         ["shadcn-portfolio", "techwithanirudh", "Next.js/shadcn/Lenis", "← Architecture, smooth scroll, composants"],
         ["Jesse's Ramen 3D", "jesse-zhou", "Three.js (vanilla)", "← Scène 3D Tokyo néon, particules WebGL"],
         ["3d-product-configurator", "gorhorvat", "R3F + Drei", "← Configurateur 3D temps réel, color picker"],
         ["cyberpunk-portfolio", "shinchan1907", "React/GSAP/Tailwind", "← CRT effects, glitch, typewriter"],
         ["react-shadcn-components", "shadcnio", "Next.js/Motion", "← Text effects, counting, shimmering"],
         ["3d-product-showcase", "Madewill", "R3F + GLTF", "← Visualisation 3D produits, orbit controls"],
         ["TDesigner (T-shirt 3D)", "AriyanMLZM", "Three.js/GSAP", "← Customisation 3D textures utilisateur"],
         ["VapeShop (SvelteKit)", "Stylsheets", "SvelteKit/Dribbble", "← Design vape shop, inspiration layout"]],
        [130, 80, 130, 150]
    ))
    els.append(sp(10))

    els.append(Paragraph("Technologies Clés Retenues", st_h3))
    for item in [
        "<b>Next.js 14 + App Router :</b> Framework principal (inspiré de shadcn-portfolio, claude-directory)",
        "<b>Three.js / React Three Fiber :</b> Scènes 3D et particules (Jesse's Ramen, 3d-configurator, TDesigner)",
        "<b>GSAP + ScrollTrigger :</b> Animations narratives au scroll (claude-directory, cyberpunk-portfolio)",
        "<b>Framer Motion :</b> Micro-interactions UI (shadcn-portfolio, react-shadcn-components)",
        "<b>Tailwind CSS + shadcn/ui :</b> Design system (shadcn-portfolio, react-shadcn-components)",
        "<b>Lenis :</b> Smooth scroll performant (shadcn-portfolio, claude-directory)",
        "<b>CYBERCORE CSS :</b> Ispiration pour le design système néon (glitch, neon borders, scanlines)",
    ]:
        els.append(Paragraph(f"▸ {item}", st_body_small))
    els.append(sp(10))

    els.append(Paragraph("Bonnes Pratiques Identifiées", st_h3))
    for item in [
        "Architecture Server Components / Client Components (Next.js 14)",
        "Loading progressif avec Suspense et skeleton screens",
        "Animations conditionnelles via prefers-reduced-motion",
        "Design system avec tokens CSS personnalisés (via Tailwind)",
        "Modèles 3D GLTF optimisés avec compression Draco",
        "Particules WebGL limitées à 10k pour performance 60fps",
        "Mode dégradé sans JavaScript pour SEO et accessibilité",
    ]:
        els.append(Paragraph(f"▸ {item}", st_body_small))

    return els


def build_architecture():
    """Pages 10-17: Site Architecture"""
    els = []
    els.append(PageBreak())
    els.append(Paragraph("ARCHITECTURE DU SITE WEB", st_sec_title))
    els.append(Paragraph("SPA avec scroll narratif et expérience immersive", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Concept Général", st_h2))
    els.append(Paragraph(
        "Le site VAPE NOCTURNE est conçu comme une <b>expérience immersive</b> plutôt qu'un simple catalogue. "
        "L'utilisateur défile dans une rue de Tokyo la nuit, découvrant les produits au fur et à mesure "
        "que la caméra 3D avance dans l'environnement néon. Chaque section est un chapitre de l'expérience.",
        st_body))
    els.append(sp(8))

    els.append(Paragraph("Structure des Sections", st_h2))
    els.append(tbl(
        [["Section", "Contenu", "Technologie"],
         ["1. HERO", "Vidéo BG Tokyo néon + mascotte 3D + CTA", "Three.js / GLSL Shaders"],
         ["2. PRODUITS", "Carrousel 3D produits + filtres Shonen/Seinen/Chicha", "React Three Fiber"],
         ["3. PERSONNALISATION", "Configurateur 3D couleur/LED/gravure temps réel", "R3F + Leva"],
         ["4. AVIS", "Témoignages style manga + étoiles ninja", "GSAP / CSS Animations"],
         ["5. BLOG/LORE", "Univers narratif + personnages + quêtes", "Next.js App Router"],
         ["6. BOUTIQUE", "Catalogue + panier inventaire RPG", "Next.js / Stripe"],
         ["7. PROFIL", "Inventaire badges + guildes + XP", "Next.js / Prisma"]],
        [120, 200, 170]
    ))
    els.append(sp(10))

    # Suite architecture...
    els.append(Paragraph("Détail des Sections Clés", st_h2))

    for sec_title, sec_desc in [
        ("Hero — L'Entrée dans Neo-Tokyo",
         "Fond 3D procédural d'une rue de Tokyo la nuit avec néons animés et sakura. "
         "Mascotte « Kage » en 3D à droite qui réagit à la souris. Titre « VAPEZ L'EXTRAORDINAIRE » "
         "avec effet glitch CRT. CTA avec expansion particulaire au survol. 5 plans de parallax."),
        ("Produits — Carrousel 3D",
         "Carrousel horizontal 3D avec rotation des produits. Filtres : Shonen (débutant), "
         "Seinen (expert), Chicha Pro, Limited Edition. Au survol : fumée WebGL, bulle holographique "
         "avec specs, rotation 360°. Son ambient lo-fi optionnel."),
        ("Personnalisation — Configurateur 3D",
         "Choix couleur (10 teintes néon + custom gradient), LED (pulse/wave/strobe), "
         "gravure laser (texte/kanji), skin artworks exclusifs, embout (5 formes), "
         "taille batterie (800/1500/3000 mAh). Gamification : badges Otaku Vaper / Sensei Cloud."),
    ]:
        els.append(Paragraph(sec_title, st_h3))
        els.append(Paragraph(sec_desc, st_body))
        els.append(sp(4))

    return els


def build_design_system():
    """Pages 18-28: Design System"""
    els = []
    els.append(PageBreak())
    els.append(Paragraph("DESIGN SYSTEM — V2 AMÉLIORÉ", st_sec_title))
    els.append(Paragraph("Composants, micro-interactions et guidelines UI", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Philosophie du Design", st_h2))
    els.append(Paragraph(
        "Le design system V2 de VAPE NOCTURNE fusionne l'esthétique cyberpunk japonaise avec les meilleures "
        "pratiques UX modernes. Inspiré des frameworks CYBERBORE CSS et shadcn/ui, chaque composant "
        "raconte une histoire tout en restant fonctionnel et accessible.", st_body))
    els.append(sp(8))

    els.append(Paragraph("Principes Directeurs", st_h3))
    for p in [
        "<b>Dark-first :</b> Mode sombre par défaut, le clair est secondaire",
        "<b>Néon subtil :</b> Lueurs utilisées avec parcimonie pour guider l'attention",
        "<b>Animation signifiante :</b> Chaque mouvement a un sens (chargement, succès, erreur)",
        "<b>Glitch contrôlé :</b> Distorsion pour renforcer l'identité, pas pour décorer",
        "<b>Japon moderne :</b> Éléments traditionnels réinterprétés en version digitale",
        "<b>Mobile adapté :</b> 70% de l'impact visuel desktop conservé sur mobile",
    ]:
        els.append(Paragraph(f"▸ {p}", st_body_small))
    els.append(sp(10))

    # Typo
    els.append(Paragraph("Typographie & Grille", st_h2))
    els.append(tbl(
        [["Police", "Style", "Tailles", "Usage"],
         ["Orbitron", "Sans-serif géométrique", "48px → 18px", "Titres, logos"],
         ["Noto Sans JP", "Sans-serif multilingue", "32px → 14px", "Corps, interface, japonais"],
         ["JetBrains Mono", "Mono espacement", "16px → 10px", "Code, specs techniques"]],
        [110, 160, 100, 120]
    ))
    els.append(sp(10))

    # Components
    els.append(Paragraph("Composants Clés", st_h2))
    for c_title, c_desc in [
        ("Boutons & CTA",
         "Primary (rose néon #FF1E6A) avec glow hover. Secondary (cyan #00F0FF outline). "
         "CTA Principal avec dégradé rose→violet et pulse lumineux. Premium (or #FFD700). "
         "États : default, hover (+20% brightness, scale 1.02), active (scale 0.98), "
         "loading (spinner Sharingan), disabled (opacity 0.4)."),
        ("Cartes & Conteneurs",
         "Product Card : image 3D, nom, prix, badge catégorie, étoiles ninja. "
         "Feature Card : icône animée, titre, description. "
         "Profile Card : avatar manga, pseudo, niveau guilde, XP bar. "
         "Testimonial Card : bulle manga avec avatar chibi."),
        ("Formulaires & Inputs",
         "Style interface holographique. Input : fond transparent, bordure cyan 2px. "
         "Checkbox : custom carré néon → ninja star. Toggle : slider cyberpunk avec glow. "
         "Validation : succès (vert #00FF88), erreur (rose + shake), warning (jaune)."),
    ]:
        els.append(Paragraph(c_title, st_h3))
        els.append(Paragraph(c_desc, st_body))
        els.append(sp(3))
    els.append(sp(10))

    # Micro-interactions
    els.append(Paragraph("Micro-interactions & Animation", st_h2))
    els.append(Paragraph(
        "Catalogue d'animations inspiré des projets claude-directory et react-shadcn-components :",
        st_body))
    els.append(sp(5))

    for item in [
        "Hover Links → Soulignement animé gauche→droite avec lueur cyan",
        "Hover Cards → Élévation + glow + bordure animée + aperçu 3D",
        "Click Effects → Onde particulaire néon depuis le point de clic (ripple)",
        "Page Transition → Effet warp speed (lignes de fuite lumineuses)",
        "Loader → Cercle Sharingan (3 tomoe tournants) en violet/rose",
        "Notifications → Toast avec glow, slide latéral, icône animée",
        "Tooltip → Bulle holographique semi-transparente avec scan effect",
        "Skeleton → Pulse gradient violet/rose pour chargement",
        "Scroll Progress → Barre latérale style compteur d'XP RPG",
    ]:
        els.append(Paragraph(f"▸ {item}", st_body_small))
    els.append(sp(10))

    # Mode Akira
    els.append(PageBreak())
    els.append(Paragraph("MODES D'AFFICHAGE", st_sec_title))
    els.append(Paragraph("Dark Mode + Mode Akira (rouge intense) + Accessibilité", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Dark Mode (Par défaut)", st_h2))
    els.append(Paragraph(
        "Le mode sombre est l'état par défaut. Palette cosmique avec arrière-plans profonds "
        "(#0A0015, #120026, #1E1035) et accents lumineux. Contraste WCAG AA minimum.", st_body))
    els.append(sp(5))

    els.append(Paragraph("Mode Akira (Easter Egg Konami Code)", st_h2))
    els.append(Paragraph(
        "Mode secret inspiré du film culte Akira (1988). Déclenché via Konami Code "
        "(↑↑↓↓←→←→ BA) ou toggle secret dans les paramètres.", st_body))

    for item in [
        "Palette rouge intense : #1A0000 → #FF0000 → #FF4444",
        "Police plus agressive, particules = étincelles rouges",
        "Musique industrial/techno au lieu de lo-fi",
        "Mascotte en tenue rouge/noire, expression sérieuse",
        "Désactivation : « Revenir à la réalité » avec bris de verre animé",
    ]:
        els.append(Paragraph(f"▸ {item}", st_body_small))
    els.append(sp(10))

    els.append(Paragraph("Accessibilité & Inclusion", st_h3))
    els.append(tbl(
        [["Fonctionnalité", "Description", "Priorité"],
         ["Mode sans animation", "Désactive toutes les animations (pour épileptiques)", "Haute"],
         ["Navigation clavier", "Tab, Enter, Escape, flèches. Focus visible personnalisé", "Haute"],
         ["Contraste WCAG AA", "4.5:1 texte normal, 3:1 grands textes", "Haute"],
         ["ARIA labels", "Tous composants interactifs", "Haute"],
         ["Structure sémantique", "Headings hiérarchisés, landmarks HTML5", "Haute"],
         ["Réduction mouvement", "Détection prefers-reduced-motion", "Haute"],
         ["Sous-titres", "Vidéos promo sous-titrées FR + Arabe", "Moyenne"],
         ["Lecteur écran", "Compatibilité NVDA, JAWS, VoiceOver", "Haute"]],
        [160, 220, 100]
    ))

    return els


def build_tech_stack():
    """Pages 29-38: Tech Stack"""
    els = []
    els.append(PageBreak())
    els.append(Paragraph("STACK TECHNIQUE AVANCÉE", st_sec_title))
    els.append(Paragraph("Architecture full-stack Next.js 14 — Inspirée des meilleurs projets GitHub", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Vue d'Ensemble", st_h2))
    els.append(Paragraph(
        "Architecture technique conçue pour l'immersion 3D et la performance. Stack moderne, "
        "maintenable et scalable, combinant technologies éprouvées et librairies de pointe.",
        st_body))
    els.append(sp(8))

    els.append(tbl(
        [["Couche", "Technologie", "Rôle", "Inspiré de"],
         ["Frontend", "Next.js 14 + App Router", "Framework React full-stack", "shadcn-portfolio"],
         ["3D & WebGL", "Three.js / React Three Fiber", "Scènes 3D, shaders, particules", "Jesse's Ramen"],
         ["Animation", "GSAP + ScrollTrigger + Framer Motion", "Animations scroll, transitions", "claude-directory"],
         ["Styles", "Tailwind CSS + shadcn/ui", "Design system, composants UI", "react-shadcn-components"],
         ["Scroll", "Lenis", "Smooth scroll performant", "shadcn-portfolio"],
         ["Backend", "Node.js / tRPC", "API type-safe", "tRPC + Zod"],
         ["Bdd", "PostgreSQL + Prisma", "ORM, migrations", "Prisma best practices"],
         ["Cache", "Redis", "Sessions, cache, rate limiting", "Upstash Redis"],
         ["Paiement", "Stripe + CMI", "Paiement sécurisé", "Stripe docs"],
         ["Auth", "NextAuth.js", "Session JWT, OAuth", "Auth.js"],
         ["Déploiement", "Vercel / Docker", "CI/CD auto-scaling", "Vercel platform"]],
        [80, 160, 140, 110]
    ))
    els.append(sp(12))

    # Pages détaillées
    for sec_title, sec_desc, code_block in [
        ("Three.js & React Three Fiber",
         "Le rendu 3D est au cœur de l'expérience. Shaders GLSL custom pour néon pulse, "
         "fumée volumétrique (bruit Perlin 3D), distorsion glitch, hologramme, sakura fall.",
         ""),
        ("GSAP & ScrollTrigger",
         "Animations narratives synchronisées au scroll : parallax 5 calques, "
         "glitch reveal, timeline narrative, progress bar XP, pin sections, caméra 3D liée au scroll.",
         """// Timeline narrative type
gsap.timeline({
  scrollTrigger: { trigger: '.scene', start: 'top center',
    end: 'bottom center', scrub: true, pin: true }
})
.to('.produit', { x: -300, stagger: 0.2, duration: 2 })
.to('.info', { opacity: 1, y: 0 }, '-=1')"""),
        ("Tailwind CSS & shadcn/ui",
         "Design system avec configuration Tailwind étendue. shadcn/ui fournit la base de composants "
         "(button, card, dialog, form, toast) customisés pour le thème cyberpunk.",
         """// tailwind.config.ts — Couleurs Nocturne
colors: { nocturne: {
  black: '#0A0015', dark: '#120026', card: '#1E1035',
  pink: '#FF1E6A', cyan: '#00F0FF', purple: '#A855F7',
  green: '#00FF88', gold: '#FFD700', }
}"""),
        ("Lenis — Smooth Scroll",
         "Moteur de smooth scroll fluid et performant. Intégration native avec GSAP ScrollTrigger et Three.js. "
         "Gestion tactile optimisée avec momentum naturel.",
         """const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));"""),
    ]:
        els.append(sp(8))
        els.append(Paragraph(sec_title, st_h2))
        els.append(Paragraph(sec_desc, st_body))
        if code_block:
            els.append(sp(3))
            for line in code_block.split('\n'):
                els.append(Paragraph(line, st_code))
        els.append(sp(5))

    # Paiement Maroc
    els.append(PageBreak())
    els.append(Paragraph("PAIEMENT — STRIPE & SOLUTIONS MAROC", st_sec_title))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Stratégie Multi-canal pour le Marché Marocain", st_h2))
    els.append(tbl(
        [["Solution", "Type", "Frais", "Priorité"],
         ["Stripe", "International", "2,9% + 3 MAD", "CB étrangères"],
         ["CMI", "Bancaire Maroc", "1,5-2,5%", "CB Maroc (incontournable)"],
         ["PayZone", "Agrégateur CMI", "2-3%", "Alternative CMI (MVP)"],
         ["Paiement livraison", "Cash on Delivery", "Frais transporteur", "60% des ventes (obligatoire)"],
         ["Mobile Money", "Inwi Money / Orange", "~2%", "Optionnel (jeunes)"],
         ["PayPal", "International", "3,4-5%", "Secondaire"]],
        [110, 100, 120, 150]
    ))

    return els


def build_marketing_financial():
    """Pages 39-47: Marketing + Financial"""
    els = []
    els.append(PageBreak())
    els.append(Paragraph("STRATÉGIE MARKETING", st_sec_title))
    els.append(Paragraph("Acquisition, engagement et fidélisation", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Vision Marketing — 3 Piliers", st_h2))
    for item in [
        "<b>1. IMMERSION NARRATIVE :</b> Chaque campagne est un chapitre de l'histoire VAPE NOCTURNE",
        "<b>2. COMMUNAUTÉ :</b> Discord, TikTok, Instagram — Guild System gamifié",
        "<b>3. EXCLUSIVITÉ :</b> Drops limités, collaborations artistes, éditions numérotées",
    ]:
        els.append(Paragraph(f"▸ {item}", st_body_small))
    els.append(sp(10))

    els.append(Paragraph("Budget Marketing Mensuel", st_h3))
    els.append(tbl(
        [["Canal", "Budget", "ROI attendu"],
         ["TikTok / Reels", "15 000 MAD", "8-12x"],
         ["Influenceurs", "25 000 MAD", "5-8x"],
         ["Google Ads", "10 000 MAD", "4-6x"],
         ["Instagram / Meta", "8 000 MAD", "3-5x"],
         ["Événements / Pop-ups", "20 000 MAD", "Branding + ventes"],
         ["Total", "78 000 MAD/mois", "~6x moyen"]],
        [160, 160, 170]
    ))
    els.append(sp(12))

    # TikTok
    els.append(Paragraph("Stratégie TikTok & Reels", st_h2))
    for item in [
        "Unboxing style anime (15-30s) avec effets overlay manga/néon",
        "ASMR Vape : gros plan fumée colorée, sons satisfaisants",
        "Speed Custom : configurateur 3D accéléré en 10s",
        "Lore TikTok : mini-épisodes animés du monde VAPE NOCTURNE",
        "#VapeNocturneChallenge : UGC, gagne des points XP",
        "Collabs cosplay : cosplayers marocains avec produits",
    ]:
        els.append(Paragraph(f"▸ {item}", st_body_small))
    els.append(sp(10))

    # Guild System
    els.append(PageBreak())
    els.append(Paragraph("PROGRAMME FIDÉLITÉ — GUILD SYSTEM", st_sec_title))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Un Programme Gamifié Complet", st_h2))
    els.append(Paragraph(
        "Transforme chaque client en membre d'une guilde avec niveaux, quêtes, récompenses et classement.",
        st_body))
    els.append(sp(8))

    els.append(tbl(
        [["Niv.", "Titre", "XP", "Avantages"],
         ["1", "Genin (Apprenti)", "0 XP", "Accès boutique, badge de base"],
         ["2", "Chunin (Initié)", "500 XP", "-5%, badge exclusif"],
         ["3", "Jonin (Expert)", "2000 XP", "-10%, preview drops, 2 badges"],
         ["4", "Sensei (Maître)", "5000 XP", "-15%, Discord privé, gravure offerte"],
         ["5", "Kage (Légende)", "15000 XP", "-20%, produit anniversaire, VIP"]],
        [50, 120, 80, 240]
    ))
    els.append(sp(10))

    els.append(Paragraph("Système de Quêtes", st_h3))
    for q in [
        "📜 Premier souffle → Compte + 1er achat (25 XP)",
        "📜 Collectionneur → 3 produits différents (50 XP)",
        "📜 Social butterfly → Partage TikTok/Instagram (15 XP)",
        "📜 L'artisan → Utiliser le configurateur 3D (20 XP)",
        "📜 Sensei du cloud → 1000 bouffées cumulées (100 XP)",
        "📜 L'influenceur → Parrainer un ami (75 XP)",
        "📜 Night owl → Achat entre minuit et 5h (30 XP)",
        "📜 Loyal → 3 mois consécutifs (200 XP)",
    ]:
        els.append(Paragraph(f"▸ {q}", st_body_small))

    # FINANCIAL
    els.append(PageBreak())
    els.append(Paragraph("PLAN FINANCIER", st_sec_title))
    els.append(Paragraph("Investissement, projection 3 ans, seuil de rentabilité", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Investissement Initial", st_h2))
    els.append(tbl(
        [["Poste", "MVP (MAD)", "V1 Complète", "Détails"],
         ["Développement Web", "120 000", "350 000", "Next.js + Three.js + Backend"],
         ["Design UI/UX", "40 000", "80 000", "Design system + maquettes"],
         ["Modèles 3D", "25 000", "70 000", "Produits + scène + mascotte"],
         ["Branding & Logo", "15 000", "15 000", "Identité visuelle"],
         ["Stock Initial", "100 000", "300 000", "Approvisionnement marques"],
         ["Marketing Launch", "50 000", "150 000", "Campagne + influenceurs"],
         ["Événement Launch", "30 000", "120 000", "Pop-up Neo-Tokyo Night"],
         ["Frais juridiques", "20 000", "30 000", "SARL, marque, conforme"],
         ["Infrastructure", "10 000", "25 000", "Hébergement, outils"],
         ["Fonds roulement 3m", "90 000", "180 000", "Trésorerie"]],
        [110, 80, 90, 210]
    ))
    els.append(sp(10))

    # Projection
    els.append(Paragraph("Projection 3 Ans", st_h2))
    els.append(tbl(
        [["Indicateur", "Année 1", "Année 2", "Année 3"],
         ["CA", "1 200 000 MAD", "3 500 000 MAD", "7 000 000 MAD"],
         ["Commandes", "3 500", "10 000", "20 000"],
         ["Panier moyen", "350 MAD", "350 MAD", "350 MAD"],
         ["Visiteurs uniques", "50 000", "150 000", "350 000"],
         ["Tx conversion", "2,5%", "3,2%", "3,8%"],
         ["Marge brute", "540 000 MAD", "1 575 000 MAD", "3 150 000 MAD"],
         ["Résultat net", "-240 000 MAD", "375 000 MAD", "1 350 000 MAD"]],
        [130, 120, 120, 120]
    ))
    els.append(sp(12))

    els.append(Paragraph("Seuil de Rentabilité", st_h2))
    els.append(Paragraph(
        "<b>Charges fixes mensuelles :</b> 65 000 MAD<br/>"
        "<b>Marge sur coût variable :</b> 45%<br/>"
        "<b>Seuil mensuel :</b> 65 000 / 0,45 = <b>144 444 MAD/mois</b><br/>"
        "<b>Soit ~14 commandes/jour pour être rentable</b><br/>"
        "<b>Atteinte prévue : Mois 8</b>",
        ParagraphStyle('Calc', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=CYAN_NEON, alignment=TA_LEFT)))
    els.append(sp(10))

    els.append(Paragraph("ROI sur 3 Ans", st_h2))
    els.append(tbl(
        [["Indicateur", "Valeur"],
         ["Investissement initial (MVP)", "500 000 MAD"],
         ["Résultat net cumulé 3 ans", "1 485 000 MAD"],
         ["ROI sur 3 ans", "<b>297%</b>"],
         ["Récupération investissement", "<b>18-24 mois</b>"],
         ["Valeur entreprise estimée An 3", "7 000 000 - 10 000 000 MAD"]],
        [250, 230]
    ))

    return els


def build_conclusion():
    """Pages 48-50: Conclusion"""
    els = []
    els.append(PageBreak())
    els.append(Paragraph("CONCLUSION & ROADMAP", st_sec_title))
    els.append(Paragraph("Prochaines étapes pour donner vie à VAPE NOCTURNE", st_sec_sub))
    els.append(neon_line())
    els.append(sp(8))

    els.append(Paragraph("Roadmap de Déploiement", st_h2))
    els.append(tbl(
        [["Phase", "Période", "Livrables", "Budget"],
         ["Phase 0: Prépa", "Mois 1-2", "Branding, maquettes, étude, legal, fournisseurs", "70 000 MAD"],
         ["Phase 1: MVP", "Mois 3-5", "SPA Hero+Produits+Panier simple, Stripe, stock", "200 000 MAD"],
         ["Phase 2: Launch", "Mois 6", "Campagne, pop-up Casablanca, Discord", "80 000 MAD"],
         ["Phase 3: Immersion", "Mois 7-9", "Scène 3D complète, configurateur, mascotte", "150 000 MAD"],
         ["Phase 4: Guild", "Mois 10-12", "Système guildes, quêtes, badges, profil", "80 000 MAD"],
         ["Phase 5: Scale", "An 2", "Marque propre, pop-ups nationaux, app mobile", "300 000 MAD"]],
        [90, 75, 220, 100]
    ))
    els.append(sp(12))

    els.append(Paragraph("Équipe Nécessaire", st_h2))
    els.append(tbl(
        [["Poste", "Type", "Budget/mois", "Compétences"],
         ["Lead Dev Frontend", "Freelance/CTO", "15-20k MAD", "Next.js, Three.js, WebGL"],
         ["Dev Backend", "Freelance", "10-15k MAD", "Node.js, tRPC, Prisma, Stripe"],
         ["UI/UX Designer", "Freelance", "10-15k MAD", "Design system, Figma, animations"],
         ["Artiste 3D", "Freelance", "8-12k MAD", "Blender, modélisation, animation"],
         ["Community Manager", "CDI", "6-8k MAD", "TikTok, Discord, Instagram"],
         ["Chef produit", "CDI", "15-20k MAD", "Vision, gestion, finance, réseau"]],
        [110, 90, 100, 190]
    ))

    # Final page
    els.append(PageBreak())
    els.append(sp(70*mm))
    els.append(Paragraph("CONTACT & PROCHAINES ÉTAPES", st_sec_title))
    els.append(neon_line(60, PINK_NEON, 2))
    els.append(sp(20))
    els.append(Paragraph("Prêt à donner vie à VAPE NOCTURNE ?", st_cover_sub))
    els.append(sp(20))

    for c in [
        "📧 contact@vapenocturne.ma",
        "🌐 www.vapenocturne.ma",
        "📱 @vapenocturne (Instagram/TikTok)",
        "💬 discord.gg/vapenocturne",
        "📍 Casablanca, Maroc",
    ]:
        els.append(Paragraph(c, ParagraphStyle('C', fontName='DejaVuSans', fontSize=14, leading=20,
                                                textColor=CYAN_NEON, alignment=TA_CENTER, spaceBefore=4, spaceAfter=4)))
    els.append(sp(20))
    els.append(neon_line(40, CYAN_NEON, 1))
    els.append(sp(15))
    els.append(Paragraph("「 La fumée des ténèbres éclaire ta voie 」",
                         ParagraphStyle('FQ', fontName='DejaVuSerif', fontSize=16, leading=22,
                                         textColor=GOLD_NEON, alignment=TA_CENTER)))
    els.append(sp(20))
    els.append(Paragraph(f"Document généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", st_cover_sub2))
    els.append(Paragraph("Version 2.0 — Palette enrichie + Inspirations GitHub — Confidentiel", st_cover_sub2))
    els.append(sp(10))
    els.append(Paragraph("01000110 01001001 01001110", ParagraphStyle('Bin',
                         fontName='DejaVuMono', fontSize=8, leading=10, textColor=PURPLE_DEEP, alignment=TA_CENTER)))

    return els


# ═══════════════════════════════════════
# MAIN
# ═══════════════════════════════════════
def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=35*mm, rightMargin=35*mm, topMargin=30*mm, bottomMargin=30*mm,
        title="VAPE NOCTURNE — Projet E-commerce Maroc v2",
        author="VAPE NOCTURNE Team",
        subject="Projet e-commerce vape & chicha - Design anime/néon cyberpunk"
    )

    all_elements = []

    # Build all sections in order
    builders = [
        build_cover,
        build_market,
        build_architecture,
        build_design_system,
        build_tech_stack,
        build_marketing_financial,
        build_conclusion,
    ]
    for builder in builders:
        all_elements.extend(builder())

    # Override total page count for footer
    doc.build(all_elements, onFirstPage=cover_template, onLaterPages=page_footer)
    return output_path


if __name__ == '__main__':
    os.makedirs('/home/user/mourad-ghazi', exist_ok=True)
    output = '/home/user/mourad-ghazi/VAPE_NOCTURNE_Projet_v2.pdf'
    print(f"⚡ Génération V2 en cours...")
    generate_pdf(output)
    sz = os.path.getsize(output)
    # Count pages
    with open(output, 'rb') as f:
        pages = f.read().count(b'/Type /Page')
    print(f"✅ PDF V2 généré avec succès !")
    print(f"📄 Fichier : {output}")
    print(f"📄 Pages : {pages}")
    print(f"📏 Taille : {sz/1024:.1f} Ko")
    print(f"\n🎨 Palette améliorée avec 15 couleurs néon")
    print(f"🐙 Section inspirations GitHub ajoutée")
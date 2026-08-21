#!/usr/bin/env python3
"""
GÉNÉRATEUR PDF - VAPE NOCTURNE
E-commerce Vape & Chicha Électronique
Design Anime/Néon Japonais
Version Maroc (Marché Marocain)
50 Pages Professionnelles
"""

import os
import sys
from datetime import datetime

sys.path.insert(0, '/tmp/pdfenv/lib/python3.11/site-packages')

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image,
    Table, TableStyle, Frame, PageTemplate, BaseDocTemplate,
    KeepTogether
)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ─────────────────────────────────────────────────────────
# FONTS
# ─────────────────────────────────────────────────────────
FONT_DIR = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('DejaVuSans', os.path.join(FONT_DIR, 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', os.path.join(FONT_DIR, 'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSerif', os.path.join(FONT_DIR, 'DejaVuSerif.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', os.path.join(FONT_DIR, 'DejaVuSerif-Bold.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuMono', os.path.join(FONT_DIR, 'DejaVuSansMono.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuMono-Bold', os.path.join(FONT_DIR, 'DejaVuSansMono-Bold.ttf')))

# ─────────────────────────────────────────────────────────
# COULEURS (Palette VAPE NOCTURNE)
# ─────────────────────────────────────────────────────────
COSMIC_BLACK = HexColor('#0D0221')
NEON_PINK = HexColor('#FF3864')
CYAN_ELECTRIC = HexColor('#00F0FF')
DEEP_PURPLE = HexColor('#7B2D8E')
DARK_PURPLE = HexColor('#1A0533')
MEDIUM_PURPLE = HexColor('#3D1B6E')
SOFT_WHITE = HexColor('#F0E6FF')
GOLD = HexColor('#FFD700')
DARK_GRAY = HexColor('#1A1A2E')
LIGHT_GRAY = HexColor('#B8B0C0')
SECTION_COLORS = [
    HexColor('#0D0221'),  # Cover
    HexColor('#1A0533'),  # Identity
    HexColor('#0D0221'),  # Market
    HexColor('#1A0533'),  # Architecture
    HexColor('#0D0221'),  # Design System
    HexColor('#1A0533'),  # Stack
    HexColor('#0D0221'),  # Marketing
    HexColor('#1A0533'),  # Financial
    HexColor('#0D0221'),  # Conclusion
]

# ─────────────────────────────────────────────────────────
# STYLES
# ─────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

style_cover_title = ParagraphStyle(
    'CoverTitle', fontName='DejaVuSerif-Bold', fontSize=36,
    leading=42, textColor=NEON_PINK, alignment=TA_CENTER, spaceAfter=10
)
style_cover_sub = ParagraphStyle(
    'CoverSub', fontName='DejaVuSans', fontSize=16,
    leading=22, textColor=CYAN_ELECTRIC, alignment=TA_CENTER, spaceAfter=6
)
style_cover_sub2 = ParagraphStyle(
    'CoverSub2', fontName='DejaVuSans', fontSize=12,
    leading=16, textColor=SOFT_WHITE, alignment=TA_CENTER, spaceAfter=4
)
style_cover_tagline = ParagraphStyle(
    'CoverTagline', fontName='DejaVuSans-Bold', fontSize=14,
    leading=18, textColor=GOLD, alignment=TA_CENTER, spaceAfter=20
)

style_section_title = ParagraphStyle(
    'SectionTitle', fontName='DejaVuSerif-Bold', fontSize=28,
    leading=34, textColor=NEON_PINK, alignment=TA_LEFT, spaceBefore=20, spaceAfter=10
)
style_section_sub = ParagraphStyle(
    'SectionSub', fontName='DejaVuSans', fontSize=14,
    leading=18, textColor=CYAN_ELECTRIC, alignment=TA_LEFT, spaceBefore=5, spaceAfter=15
)

style_h2 = ParagraphStyle(
    'H2', fontName='DejaVuSerif-Bold', fontSize=20,
    leading=26, textColor=CYAN_ELECTRIC, alignment=TA_LEFT, spaceBefore=15, spaceAfter=8
)
style_h3 = ParagraphStyle(
    'H3', fontName='DejaVuSans-Bold', fontSize=14,
    leading=18, textColor=NEON_PINK, alignment=TA_LEFT, spaceBefore=10, spaceAfter=5
)
style_body = ParagraphStyle(
    'Body', fontName='DejaVuSans', fontSize=10,
    leading=14, textColor=SOFT_WHITE, alignment=TA_JUSTIFY, spaceBefore=3, spaceAfter=5
)
style_body_small = ParagraphStyle(
    'BodySmall', fontName='DejaVuSans', fontSize=8.5,
    leading=12, textColor=LIGHT_GRAY, alignment=TA_JUSTIFY, spaceBefore=2, spaceAfter=3
)
style_bullet = ParagraphStyle(
    'Bullet', fontName='DejaVuSans', fontSize=10,
    leading=14, textColor=SOFT_WHITE, alignment=TA_LEFT, spaceBefore=2, spaceAfter=2,
    leftIndent=15, bulletIndent=5
)
style_code = ParagraphStyle(
    'Code', fontName='DejaVuMono', fontSize=8,
    leading=11, textColor=CYAN_ELECTRIC, alignment=TA_LEFT,
    spaceBefore=3, spaceAfter=3, leftIndent=10
)
style_footer = ParagraphStyle(
    'Footer', fontName='DejaVuSans', fontSize=7,
    leading=9, textColor=LIGHT_GRAY, alignment=TA_CENTER
)
style_quote = ParagraphStyle(
    'Quote', fontName='DejaVuSerif', fontSize=11,
    leading=15, textColor=GOLD, alignment=TA_CENTER,
    spaceBefore=10, spaceAfter=10, leftIndent=30, rightIndent=30
)

# ─────────────────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────────────────
def neon_line(width=500, color=NEON_PINK, thickness=1):
    return HRFlowable(width=f"{width}%", thickness=thickness, color=color, spaceBefore=5, spaceAfter=5)

def spacer(h=10):
    return Spacer(1, h)

def bullet(text):
    return Paragraph(f"•  {text}", style_bullet)

def page_header_footer(canvas_obj, doc):
    """Draw header/footer on each page"""
    canvas_obj.saveState()
    W, H = A4
    
    # Bottom neon line
    canvas_obj.setStrokeColor(NEON_PINK)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(30*mm, 20*mm, W - 30*mm, 20*mm)
    
    # Page number
    canvas_obj.setFont('DejaVuSans', 7)
    canvas_obj.setFillColor(LIGHT_GRAY)
    canvas_obj.drawCentredString(W/2, 15*mm, f"— {doc.page} —")
    
    # Footer text
    canvas_obj.setFont('DejaVuSans', 6)
    canvas_obj.setFillColor(LIGHT_GRAY)
    canvas_obj.drawString(30*mm, 15*mm, "VAPE NOCTURNE • Projet E-commerce Maroc 2025")
    canvas_obj.drawRightString(W - 30*mm, 15*mm, f"© {datetime.now().year} — Document confidentiel")
    
    # Side neon accent
    canvas_obj.setStrokeColor(CYAN_ELECTRIC)
    canvas_obj.setLineWidth(0.3)
    canvas_obj.line(30*mm, 20*mm, 30*mm, H - 25*mm)
    
    canvas_obj.restoreState()

def cover_page_template(canvas_obj, doc):
    """Special template for cover page"""
    canvas_obj.saveState()
    W, H = A4
    
    # Full background
    canvas_obj.setFillColor(COSMIC_BLACK)
    canvas_obj.rect(0, 0, W, H, fill=1, stroke=0)
    
    # Decorative shapes
    # Glow effect circles - using semi-transparent colors
    for i in range(3):
        # Create more transparent color by blending with background
        alpha = 0.15 - i * 0.04
        glow_color = HexColor(f'#2D0B3A') if i == 0 else HexColor(f'#1A0533') if i == 1 else HexColor(f'#0D0221')
        canvas_obj.setStrokeColor(glow_color)
        canvas_obj.setLineWidth(0.5)
        canvas_obj.circle(W/2, H/2, 80 + i*40*mm, fill=0)
    
    # Cyberpunk grid lines
    canvas_obj.setStrokeColor(CYAN_ELECTRIC)
    canvas_obj.setLineWidth(0.2)
    step_x = int(20*mm)
    step_y = int(20*mm)
    for x in range(0, int(W), step_x):
        canvas_obj.setStrokeColor(HexColor('#003040'))
        canvas_obj.line(x, 0, x, H)
    for y in range(0, int(H), step_y):
        canvas_obj.setStrokeColor(HexColor('#003040'))
        canvas_obj.line(0, y, W, y)
    
    # Bottom decorative text
    canvas_obj.setFont('DejaVuMono', 6)
    canvas_obj.setFillColor(DEEP_PURPLE)
    matrix_text = "01001110 01000101 01001111 01001110 00100000 01010110 01000001 01010000 01000101"
    canvas_obj.drawCentredString(W/2, 90*mm, matrix_text)
    
    canvas_obj.restoreState()

def section_page_template(canvas_obj, doc):
    """Template for section start pages"""
    canvas_obj.saveState()
    W, H = A4
    
    canvas_obj.setFillColor(COSMIC_BLACK)
    canvas_obj.rect(0, 0, W, H, fill=1, stroke=0)
    
    # Top neon line
    canvas_obj.setStrokeColor(NEON_PINK)
    canvas_obj.setLineWidth(2)
    canvas_obj.line(30*mm, H - 25*mm, W - 30*mm, H - 25*mm)
    
    # Side marker
    canvas_obj.setStrokeColor(CYAN_ELECTRIC)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(30*mm, 25*mm, 30*mm, H - 25*mm)
    
    canvas_obj.restoreState()

def dark_page_template(canvas_obj, doc):
    """Standard dark page template"""
    canvas_obj.saveState()
    W, H = A4
    
    canvas_obj.setFillColor(DARK_GRAY)
    canvas_obj.rect(0, 0, W, H, fill=1, stroke=0)
    
    canvas_obj.restoreState()


# ─────────────────────────────────────────────────────────
# CONTENT BUILDERS
# ─────────────────────────────────────────────────────────

def build_cover():
    """Pages 1-3: Cover & Visual Identity"""
    elements = []
    W, H = A4
    
    # ── PAGE 1: Cover ──
    elements.append(PageBreak())
    elements.append(Spacer(1, 100*mm))
    elements.append(Paragraph("VAPE NOCTURNE", style_cover_title))
    elements.append(neon_line(width=40, color=NEON_PINK, thickness=2))
    elements.append(spacer(10))
    elements.append(Paragraph("E-COMMERCE VAPE & CHICHA ÉLECTRONIQUE", style_cover_sub))
    elements.append(Paragraph("Design Anime / Néon Japonais", style_cover_sub2))
    elements.append(spacer(20))
    elements.append(Paragraph("✦  ÉDITION MAROC 2025  ✦", style_cover_tagline))
    elements.append(spacer(40))
    elements.append(Paragraph("「 闇の煙 」", ParagraphStyle('Jp', fontName='DejaVuSans-Bold', fontSize=20, leading=26, textColor=CYAN_ELECTRIC, alignment=TA_CENTER)))
    elements.append(spacer(10))
    elements.append(Paragraph("Yami no Kemuri — La Fumée des Ténèbres", style_cover_sub2))
    elements.append(spacer(30))
    elements.append(Paragraph("Document de Projet — 50 Pages", style_cover_sub2))
    elements.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y')}", style_cover_sub2))
    
    # ── PAGE 2: Identity & Brand Guidelines ──
    elements.append(PageBreak())
    elements.append(Paragraph("IDENTITÉ VISUELLE", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(10))
    
    elements.append(Paragraph("Logo & Marque", style_h2))
    elements.append(Paragraph(
        "Le nom <b>VAPE NOCTURNE</b> incarne l'alliance entre l'univers de la vape et l'esthétique cyberpunk japonaise. "
        "Le logo combine un lettrage néon avec des motifs de fumée stylisée évoquant à la fois la vape et les esprits japonais (yokai).",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Palette de Couleurs", style_h2))
    
    # Color swatches as a table
    color_data = [
        [Paragraph("Nom", style_h3), Paragraph("Code Hex", style_h3), Paragraph("Usage", style_h3)],
        [Paragraph("Noir Cosmique", style_body), Paragraph("<font color='#0D0221'>#0D0221</font>", style_body), Paragraph("Arrière-plans principaux", style_body)],
        [Paragraph("Rose Néon", style_body), Paragraph("<font color='#FF3864'>#FF3864</font>", style_body), Paragraph("Titres, CTA, accents forts", style_body)],
        [Paragraph("Cyan Électrique", style_body), Paragraph("<font color='#00F0FF'>#00F0FF</font>", style_body), Paragraph("Liens, icônes, effets lumineux", style_body)],
        [Paragraph("Violet Profond", style_body), Paragraph("<font color='#7B2D8E'>#7B2D8E</font>", style_body), Paragraph("Dégradés, hover states, sections", style_body)],
        [Paragraph("Blanc Doux", style_body), Paragraph("<font color='#F0E6FF'>#F0E6FF</font>", style_body), Paragraph("Texte principal sur fond sombre", style_body)],
        [Paragraph("Or", style_body), Paragraph("<font color='#FFD700'>#FFD700</font>", style_body), Paragraph("Badges, achievements, premium", style_body)],
    ]
    t = Table(color_data, colWidths=[120, 100, 280])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t)
    elements.append(spacer(15))
    
    elements.append(Paragraph("Typographie", style_h2))
    elements.append(Paragraph(
        "<b>Titres :</b> Orbitron (sci-fi, géométrique) — Évoque le futur et le néon japonais.<br/>"
        "<b>Corps de texte :</b> Noto Sans JP (lisible, accents japonais) — Pour les caractères kanji et kana.<br/>"
        "<b>Code/Technique :</b> JetBrains Mono (programmation) — Pour les extraits techniques.",
        style_body))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Moodboard & Inspiration", style_h2))
    elements.append(Paragraph(
        "L'inspiration visuelle puise dans :<br/>"
        "• Tokyo by night — Shinjuku, Shibuya, ses néons vertigineux<br/>"
        "• Cyberpunk — Blade Runner, Akira, Ghost in the Shell<br/>"
        "• Anime — Studio Ghibli (ambiances nocturnes), Evangelion (interfaces)<br/>"
        "• Art digital japonais — estampes ukiyo-e revisitées en version cyber<br/>"
        "• Calligraphie moderne — fusion des kanji avec le design UI/UX",
        style_body))
    
    # ── PAGE 3: Moodboard détaillé ──
    elements.append(PageBreak())
    elements.append(Paragraph("MOODBOARD & CONCEPT ART", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(10))
    
    elements.append(Paragraph("Univers Visuel", style_h2))
    elements.append(Paragraph(
        "Le concept artistique de VAPE NOCTURNE repose sur une fusion unique entre l'esthétique "
        "traditionnelle japonaise et le cyberpunk. Chaque élément visuel raconte une histoire :",
        style_body))
    elements.append(spacer(5))
    
    elements.append(Paragraph("1. L'Ambiance Néon", style_h3))
    elements.append(Paragraph(
        "Inspirée des quartiers de Shinjuku et Akihabara, l'ambiance utilise des lumières "
        "au néon violettes, roses et cyan qui transforment l'obscurité en spectacle visuel. "
        "Les reflets sur les surfaces humides et la brume lumineuse créent une profondeur.",
        style_body))
    
    elements.append(Paragraph("2. Le Personnage Mascotte", style_h3))
    elements.append(Paragraph(
        "Une jeune fille cyberpunk aux cheveux violets et yeux lumineux sert de guide "
        "virtuelle à travers l'expérience e-commerce. Son style mélange :<br/>"
        "• Tenue traditionnelle japonaise revisitée (kimono cyberpunk avec LED intégrées)<br/>"
        "• Accessoires tech (écouteurs néon, bracelet holographique)<br/>"
        "• Aura de fumée colorée qui réagit aux interactions utilisateur",
        style_body))
    
    elements.append(Paragraph("3. Le Bestiaire Digital", style_h3))
    elements.append(Paragraph(
        "Chaque catégorie de produit est associée à un esprit animal (shikigami) numérique :<br/>"
        "• Shonen/Débutant → Renard Kitsune (orange/bleu)<br/>"
        "• Seinen/Expert → Dragon Ryu (rouge/violet)<br/>"
        "• Chicha Pro → Phénix Ho-o (or/cyan)",
        style_body))
    
    elements.append(Paragraph("4. Les Éléments Clés", style_h3))
    bullets_mood = [
        "Fumée stylisée : Les motifs de fumée forment des kanji quand on les survole",
        "Sakura numériques : Pétales de cerisier en particules 3D qui réagissent au scroll",
        "Grille cyberpunk : Lignes de fuite en perspective qui créent la profondeur",
        "Hologrammes : Interfaces transparentes avec effet de glitch subtil",
        "Éclairage volumétrique : Rayons lumineux traversant la brume nocturne",
    ]
    for b in bullets_mood:
        elements.append(bullet(b))
    
    return elements


def build_market_analysis():
    """Pages 4-8: Market Analysis"""
    elements = []
    
    # ── PAGE 4: Marché Vape France/Europe ──
    elements.append(PageBreak())
    elements.append(Paragraph("ANALYSE DE MARCHÉ", style_section_title))
    elements.append(Paragraph("Panorama du marché de la vape en France, Europe et Maroc 2024-2025", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Marché Français et Européen 2024-2025", style_h2))
    elements.append(Paragraph(
        "Le marché français de la cigarette électronique a franchi la barre des <b>1,1 milliard d'euros en 2024</b>, "
        "avec une croissance estimée à <b>10,5%</b> sur l'année. La France se positionne comme l'un des marchés "
        "les plus dynamiques d'Europe, portée par une réglementation favorable et une communauté de vapoteurs "
        "en expansion (plus de 4,3 millions de vapoteurs réguliers).",
        style_body))
    elements.append(spacer(5))
    
    # Market data table
    market_data = [
        [Paragraph("Indicateur", style_h3), Paragraph("France", style_h3), Paragraph("Europe", style_h3), Paragraph("Maroc", style_h3)],
        [Paragraph("Taille du marché (2024)", style_body), Paragraph("1,1 Mds €", style_body), Paragraph("~6,3 Mds €", style_body), Paragraph("~500-800 MDH", style_body)],
        [Paragraph("Croissance 2024", style_body), Paragraph("+10,5%", style_body), Paragraph("+8,5%", style_body), Paragraph("+15-20% (est.)", style_body)],
        [Paragraph("Croissance prévue 2025", style_body), Paragraph("+5-7%", style_body), Paragraph("+6-8%", style_body), Paragraph("+12-18% (est.)", style_body)],
        [Paragraph("Vapoteurs réguliers", style_body), Paragraph("4,3 millions", style_body), Paragraph("~15 millions", style_body), Paragraph("~500k-800k (est.)", style_body)],
        [Paragraph("Taux de pénétration", style_body), Paragraph("~8%", style_body), Paragraph("~5%", style_body), Paragraph("~2-3% (est.)", style_body)],
    ]
    t = Table(market_data, colWidths=[140, 110, 110, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(spacer(12))
    
    # ── PAGE 5: Concurrence Directe ──
    elements.append(PageBreak())
    elements.append(Paragraph("CONCURRENCE DIRECTE", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Acteurs Clés du Marché Marocain", style_h2))
    elements.append(Paragraph(
        "Le marché marocain de la vape est fragmenté entre une quarantaine d'importateurs "
        "dont 4 gros opérateurs, avec des produits essentiellement en provenance de Chine "
        "et d'Asie du Sud-Est. Les géants mondiaux (Altria, JTI, Imperial Brands) attendent "
        "l'adoption de normes claires avant de s'implanter directement.",
        style_body))
    elements.append(spacer(8))
    
    # Competitor table
    comp_data = [
        [Paragraph("Concurrent", style_h3), Paragraph("Type", style_h3), Paragraph("Forces", style_h3), Paragraph("Faiblesses", style_h3)],
        [Paragraph("Vaporia (vaporia.ma)", style_body_small), Paragraph("Physique + E-commerce", style_body_small), Paragraph("Marques connues, présence Marrakech", style_body_small), Paragraph("Présence limitée, design standard", style_body_small)],
        [Paragraph("Le Vapoteur Marocain", style_body_small), Paragraph("E-commerce", style_body_small), Paragraph("Prix compétitifs, large catalogue", style_body_small), Paragraph("Peu de trafic, design basique", style_body_small)],
        [Paragraph("Vap O Chic", style_body_small), Paragraph("Physique (depuis 2010)", style_body_small), Paragraph("Expérience, confiance établie", style_body_small), Paragraph("Pas de présence en ligne forte", style_body_small)],
        [Paragraph("Vape Shop Maroc", style_body_small), Paragraph("E-commerce", style_body_small), Paragraph("Présence sur les réseaux", style_body_small), Paragraph("Gamme limitée, UX faible", style_body_small)],
        [Paragraph("Souk/Informel", style_body_small), Paragraph("Marché parallèle", style_body_small), Paragraph("Prix très bas, disponibilité", style_body_small), Paragraph("Qualité douteuse, aucun SAV", style_body_small)],
    ]
    t = Table(comp_data, colWidths=[110, 80, 150, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Positionnement Concurrentiel", style_h2))
    elements.append(Paragraph(
        "<b>VAPE NOCTURNE se positionne sur une niche inexploitée au Maroc :</b> le mariage entre "
        "l'univers de la vape et la culture anime/gaming. Aucun concurrent actuel n'offre :<br/>"
        "• Une expérience d'achat immersive avec design anime/néon<br/>"
        "• Un storytelling transmedia autour des produits<br/>"
        "• Une communauté gamifiée avec système de guildes et quêtes<br/>"
        "• Un configurateur 3D pour personnaliser les produits",
        style_body))
    
    # ── PAGE 6: Positionnement ──
    elements.append(PageBreak())
    elements.append(Paragraph("POSITIONNEMENT « LIFESTYLE ANIME »", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Une Niche Inexploitée", style_h2))
    elements.append(Paragraph(
        "Le croisement entre la culture vape et la culture otaku/gaming représente une opportunité "
        "commerciale unique. Avec plus de 3 millions de jeunes marocains de 18-35 ans passionnés "
        "d'anime, de gaming et de culture japonaise, le marché potentiel est considérable.",
        style_body))
    elements.append(spacer(5))
    
    elements.append(Paragraph("Les Piliers du Positionnement", style_h3))
    pos_items = [
        "<b>Authenticité otaku :</b> Collaborations avec des artistes manga marocains pour des éditions limitées",
        "<b>Gamification :</b> Système de niveaux (Shonen, Seinen, Sensei) avec badges et récompenses",
        "<b>Storytelling :</b> Univers narratif où chaque produit a une histoire dans le monde de VAPE NOCTURNE",
        "<b>Communauté :</b> Guildes de vapoteurs, événements pop-up Neo-Tokyo Night, tournois gaming",
        "<b>Exclusivité :</b> Drops limités, collaborations avec des studios d'animation, NFTs (optionnel)",
        "<b>Style de vie :</b> Au-delà du produit, une identité visuelle forte (streetwear, accessoires)",
    ]
    for item in pos_items:
        elements.append(bullet(item))
    elements.append(spacer(10))
    
    # SWOT-like table
    swot_data = [
        [Paragraph("FORCES", ParagraphStyle('SwotH', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=CYAN_ELECTRIC, alignment=TA_CENTER)),
         Paragraph("FAIBLESSES", ParagraphStyle('SwotH', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=NEON_PINK, alignment=TA_CENTER))],
        [Paragraph("Design unique / Niche inexploitée / Expérience immersive / Communauté forte", style_body_small),
         Paragraph("Marque nouvelle (pas de notoriété) / Investissement tech élevé / Dépendance aux importations / Marché réglementé", style_body_small)],
        [Paragraph("OPPORTUNITÉS", ParagraphStyle('SwotH', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=CYAN_ELECTRIC, alignment=TA_CENTER)),
         Paragraph("MENACES", ParagraphStyle('SwotH', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=NEON_PINK, alignment=TA_CENTER))],
        [Paragraph("Marché en croissance (15-20%) / Normes IMANOR (fév. 2026) / Culture otaku en expansion / Pas de concurrence directe", style_body_small),
         Paragraph("Réglementation restrictive possible / Taxe à l'import (40%) / Concurrence low-cost / Crise économique", style_body_small)],
    ]
    t = Table(swot_data, colWidths=[250, 250])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), DEEP_PURPLE),
        ('BACKGROUND', (1, 0), (1, 0), DARK_PURPLE),
        ('BACKGROUND', (0, 2), (0, 2), DEEP_PURPLE),
        ('BACKGROUND', (1, 2), (1, 2), DARK_PURPLE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, 1), HexColor('#1A0533')),
        ('BACKGROUND', (0, 3), (-1, 3), HexColor('#1A0533')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t)
    
    # ── PAGE 7: Cible ──
    elements.append(PageBreak())
    elements.append(Paragraph("CIBLE MARKETING", style_section_title))
    elements.append(Paragraph("Personas & Segmentation", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Segment Principal : 18-35 ans — Otaku, Gamers, Streetwear", style_h2))
    elements.append(spacer(5))
    
    # Persona 1
    elements.append(Paragraph("👤 Persona 1 : « Le Otaku Branché »", style_h3))
    elements.append(Paragraph(
        "<b>Amine, 22 ans</b> — Étudiant en design à Casablanca. Passionné d'anime (Naruto, One Piece, Demon Slayer). "
        "Joue à Genshin Impact et League of Legends. Dépense 500-800 MAD/mois en culture japonaise. "
        "Cherche une expérience d'achat qui reflète son style de vie. Influenceur nano (3k abonnés TikTok).",
        style_body))
    elements.append(spacer(5))
    
    # Persona 2
    elements.append(Paragraph("👤 Persona 2 : « Le Gamer Confirmé »", style_h3))
    elements.append(Paragraph(
        "<b>Youssef, 28 ans</b> — Développeur web à Rabat. Vapote depuis 3 ans. Aime la tech, les gadgets, "
        "et le design soigné. Budget mensuel vape : 400-600 MAD. Prêt à payer plus cher pour un produit "
        "qui sort de l'ordinaire. Suit les tendances tech et gaming.",
        style_body))
    elements.append(spacer(5))
    
    # Persona 3
    elements.append(Paragraph("👤 Persona 3 : « La Streetwear Queen »", style_h3))
    elements.append(Paragraph(
        "<b>Imane, 25 ans</b> — Community manager à Marrakech. Passionnée de mode urbaine et de culture "
        "japonaise. Acheteuse compulsive en ligne (Shein, Zara). Veut des produits esthétiques et "
        "Instagrammables. Budget vape : 300-500 MAD/mois. Influence potentielle via Instagram.",
        style_body))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Chiffres Clés du Marché Marocain", style_h2))
    
    target_data = [
        [Paragraph("Indicateur", style_h3), Paragraph("Valeur", style_h3), Paragraph("Source", style_h3)],
        [Paragraph("Jeunes 18-35 ans au Maroc", style_body), Paragraph("~12 millions", style_body), Paragraph("HCP 2024", style_body)],
        [Paragraph("Taux de pénétration vape", style_body), Paragraph("~2-3% (potentiel 8-10%)", style_body), Paragraph("Estimation marché", style_body)],
        [Paragraph("Consommateurs anime/manga", style_body), Paragraph("~3 millions (est.)", style_body), Paragraph("JCC Maroc 2024", style_body)],
        [Paragraph("Gamers actifs", style_body), Paragraph("~5 millions", style_body), Paragraph("GEIPP Maroc", style_body)],
        [Paragraph("Achats en ligne (18-35 ans)", style_body), Paragraph("62%", style_body), Paragraph("ANRT 2024", style_body)],
        [Paragraph("Budget mensuel vape moyen", style_body), Paragraph("400-600 MAD", style_body), Paragraph("Étude terrain", style_body)],
    ]
    t = Table(target_data, colWidths=[180, 180, 140])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    
    # ── PAGE 8: Opportunités Maroc ──
    elements.append(PageBreak())
    elements.append(Paragraph("OPPORTUNITÉS SPÉCIFIQUES AU MAROC", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Un Marché en Pleine Mutation Réglementaire", style_h2))
    elements.append(Paragraph(
        "Le Maroc vit un tournant réglementaire majeur pour le secteur de la vape :",
        style_body))
    elements.append(spacer(5))
    
    reg_items = [
        "<b>Février 2026 :</b> Entrée en vigueur de la norme IMANOR obligatoire — composition, étiquetage, traçabilité et sécurité des produits sans fumée",
        "<b>Taxation 2025 :</b> 50 DH par puff jetable, 1 DH/ml de liquide nicotiné, droit d'importation passé de 2,5% à 40%",
        "<b>Zone grise actuelle :</b> Absence de cadre légal spécifique, marché dominé par des importateurs chinois et sud-est asiatique",
        "<b>Géants mondiaux en attente :</b> Altria, JTI, Imperial Brands n'entreront qu'après adoption des normes",
        "<b>Opportunité first-mover :</b> Être le premier acteur positionné sur la niche anime/gaming avant l'arrivée des grands groupes",
    ]
    for item in reg_items:
        elements.append(bullet(item))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Avantages Concurrentiels Projetés", style_h2))
    elements.append(Paragraph(
        "<b>1. Premium accessible :</b> Produits de qualité à prix adaptés au pouvoir d'achat marocain (200-800 MAD)<br/>"
        "<b>2. Communauté avant la vente :</b> Construction d'une communauté otaku/gaming avant le lancement (Discord, TikTok)<br/>"
        "<b>3. Logistique locale :</b> Partenariats avec SpeedAf, Amana pour livraison J+1 à Casablanca, Rabat, Marrakech, Tanger<br/>"
        "<b>4. Paiement adapté :</b> CMI + Paiement à la livraison (60% des transactions e-commerce au Maroc) + Mobile money<br/>"
        "<b>5. Bilingue FR/Darija :</b> Interface adaptée à la réalité linguistique marocaine",
        style_body))
    
    return elements


def build_architecture():
    """Pages 9-15: Site Architecture"""
    elements = []
    
    # ── PAGE 9: SPA Overview ──
    elements.append(PageBreak())
    elements.append(Paragraph("ARCHITECTURE DU SITE WEB", style_section_title))
    elements.append(Paragraph("Single Page Application (SPA) avec scroll narratif", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Concept Général", style_h2))
    elements.append(Paragraph(
        "Le site VAPE NOCTURNE est conçu comme une <b>expérience immersive</b> plutôt qu'un simple catalogue. "
        "L'utilisateur défile dans une rue de Tokyo la nuit, découvrant les produits au fur et à mesure "
        "que la caméra 3D avance dans l'environnement néon. Chaque section est un « chapitre » de l'expérience.",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Structure des Sections", style_h2))
    
    arch_data = [
        [Paragraph("Section", style_h3), Paragraph("Contenu", style_h3), Paragraph("Technologie", style_h3)],
        [Paragraph("1. HERO", style_body), Paragraph("Vidéo BG Tokyo néon + mascotte + CTA", style_body), Paragraph("Three.js / GLSL Shaders", style_body)],
        [Paragraph("2. PRODUITS", style_body), Paragraph("Carrousel 3D produits + filtres", style_body), Paragraph("React Three Fiber", style_body)],
        [Paragraph("3. PERSONNALISATION", style_body), Paragraph("Configurateur 3D couleur/LED/gravure", style_body), Paragraph("Three.js / Framer Motion", style_body)],
        [Paragraph("4. AVIS", style_body), Paragraph("Témoignages style manga + notes", style_body), Paragraph("GSAP / CSS Animations", style_body)],
        [Paragraph("5. BLOG/LORE", style_body), Paragraph("Univers narratif + personnages", style_body), Paragraph("Next.js App Router", style_body)],
        [Paragraph("6. BOUTIQUE", style_body), Paragraph("Catalogue + panier RPG", style_body), Paragraph("Next.js / Stripe", style_body)],
        [Paragraph("7. PROFIL", style_body), Paragraph("Inventaire + badges guildes", style_body), Paragraph("Next.js / Prisma", style_body)],
    ]
    t = Table(arch_data, colWidths=[120, 200, 170])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    
    # ── PAGE 10: Section HERO ──
    elements.append(PageBreak())
    elements.append(Paragraph("SECTION HERO — L'ENTRÉE DANS NEO-TOKYO", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Composition Visuelle", style_h2))
    elements.append(Paragraph(
        "La section Hero est conçue pour <b>immerger immédiatement</b> le visiteur dans l'univers VAPE NOCTURNE. "
        "Elle combine plusieurs calques visuels pour créer une expérience cinématique :",
        style_body))
    elements.append(spacer(5))
    
    hero_items = [
        "<b>Fond vidéo 3D :</b> Reconstruction procédurale d'une rue de Tokyo la nuit, avec néons animés, enseignes au kanji, et sakura tombant en temps réel",
        "<b>Mascotte animée :</b> Personnage cyberpunk en 3D qui se tient à droite de l'écran, cligne des yeux et réagit au mouvement de la souris",
        "<b>Titre avec effet Glitch :</b> « VAPEZ L'EXTRAORDINAIRE » en lettres néon avec effet de distorsion CRT et interference vidéo",
        "<b>CTA principal :</b> Bouton « Entrer dans le Neo-Tokyo » avec animation d'expansion en particules lumineuses au survol",
        "<b>Particules de fond :</b> Système de particules WebGL simulant la brume lumineuse, les pétales de sakura et les étincelles électriques",
        "<b>Parallax multicouche :</b> 5 plans de profondeur (ciel nocturne → buildings lointains → néons → rue → personnage)",
    ]
    for item in hero_items:
        elements.append(bullet(item))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Spécifications Techniques", style_h2))
    spec_items = [
        "Performance : ciblé 60fps sur desktop, 30fps mobile avec adaptation automatique",
        "Shader custom : GLSL pour l'effet de néon pulsé et le brouillard lumineux",
        "Lazy loading : La scène 3D se charge progressivement (skeleton screen anime)",
        "Fallback : Image statique animée CSS pour les navigateurs ne supportant pas WebGL",
        "Taille max : 2-3 Mo pour l'ensemble des assets du hero",
    ]
    for item in spec_items:
        elements.append(Paragraph(f"▸ {item}", style_body_small))
    
    # ── PAGE 11: Section Produits ──
    elements.append(PageBreak())
    elements.append(Paragraph("SECTION PRODUITS — CARROUSEL 3D", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Expérience de Navigation Produit", style_h2))
    elements.append(Paragraph(
        "Les produits défilent dans un <b>carrousel 3D horizontal</b> où chaque item tourne sur lui-même "
        "comme dans une vitrine holographique. L'utilisateur peut faire glisser ou utiliser les flèches "
        "du clavier pour naviguer entre les catégories.",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Filtres de Navigation (Tier System)", style_h3))
    filtres = [
        "<b>Shonen (Débutant) :</b> Pods, kits AIO, e-liquides entrée de gamme — pour les nouveaux vapoteurs",
        "<b>Seinen (Expert) :</b> Box mod, drippers, atomiseurs reconstructibles — pour les vapoteurs avancés",
        "<b>Chicha Pro :</b> Chichas électroniques, tabac sans nicotine, accessoires — pour les amateurs de sessions",
        "<b>Limited Edition :</b> Collaborations spéciales artistes, drops limités — pour les collectionneurs",
    ]
    for f in filtres:
        elements.append(bullet(f))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Interactions au Survol", style_h3))
    elements.append(Paragraph(
        "Au survol d'un produit :<br/>"
        "• <b>Fumée particulaire :</b> Système WebGL de fumée colorée qui s'échappe du produit<br/>"
        "• <b>Bulle holographique :</b> Infobulle transparente avec spécifications techniques animées<br/>"
        "• <b>Rotation 360° :</b> Le produit tourne automatiquement pour révéler tous ses angles<br/>"
        "• <b>Son :</b> Effet sonore ambient lo-fi au survol (optionnel, toggle désactivable)",
        style_body))
    
    # ── PAGE 12: Section Personnalisation ──
    elements.append(PageBreak())
    elements.append(Paragraph("SECTION PERSONNALISATION — CONFIGURATEUR 3D", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Configurateur Temps Réel", style_h2))
    elements.append(Paragraph(
        "Le configurateur 3D permet aux clients de <b>personnaliser leur produit</b> avant achat, avec "
        "un rendu en temps réel via Three.js. L'expérience est conçue pour être ludique et satisfaisante.",
        style_body))
    elements.append(spacer(5))
    
    config_options = [
        ["Option", "Description", "Technologie"],
        ["Couleur du boîtier", "10 teintes néon + custom gradient", "Three.js Material Swap"],
        ["LED intégrée", "Couleur, motif (pulse, wave, strobe)", "Shader personnalisé GLSL"],
        ["Gravure laser", "Texte, kanji, ou motif au choix", "Canvas2D → Texture 3D"],
        ["Skin/Deco", "Artworks exclusifs d'artistes manga", "Texture Mapping"],
        ["Embout", "5 formes + matériaux (résine, métal, silicone)", "3D Model Swap"],
        ["Taille batterie", "3 capacités (800/1500/3000 mAh)", "Affichage dynamique 3D"],
    ]
    t = Table(config_options, colWidths=[120, 200, 170])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Gamification du Configurateur", style_h3))
    elements.append(Paragraph(
        "Chaque personnalisation complète débloque des <b>badges</b> et des <b>points d'expérience</b> :<br/>"
        "• « Otaku Vaper » — Avoir personnalisé son premier pod<br/>"
        "• « Sensei Cloud » — Avoir configuré un setup expert complet<br/>"
        "• « Artisan Neon » — Avoir utilisé la gravure laser avec un kanji<br/>"
        "• « Holographic Master » — Avoir créé un dégradé custom unique",
        style_body))
    
    # ── PAGE 13: Section Avis ──
    elements.append(PageBreak())
    elements.append(Paragraph("SECTION AVIS — STYLE MANGA", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Témoignages en Bulles de Manga", style_h2))
    elements.append(Paragraph(
        "Les avis clients sont présentés comme des <b>bulles de manga interactives</b>, avec des illustrations "
        "style chibi des clients (ou avatars générés). Chaque avis est noté par des « étoiles ninja » ⭐.",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Exemples de Bulles d'Avis", style_h3))
    
    reviews = [
        ("🔥 « Ce pod est un vrai rasengan de saveurs ! »", "Naruto_Fan_77", "⭐⭐⭐⭐⭐", "Le meilleur pod que j'ai testé. Le design Sharingan est incroyable !"),
        ("🌸 « La chicha électronique est trop stylée »", "Sakura_Cloud", "⭐⭐⭐⭐", "Parfaite pour les sessions entre amis. Les LED violet sont magnifiques."),
        ("⚡ « Enfin une marque qui nous comprend »", "Otaku_Street", "⭐⭐⭐⭐⭐", "Du vrai streetwear japonais. J'ai pris la box limitée, un régal !"),
        ("🍃 « Le goût est authentique, livraison rapide »", "Vape_Sensei", "⭐⭐⭐⭐", "Commande reçue en 24h à Casablanca. Le packaging est dingue."),
    ]
    
    for name, author, stars, text in reviews:
        elements.append(Paragraph(
            f'<table border="0" cellpadding="6" style="background-color:#1A0533; border:0.5 solid #00F0FF;">'
            f'<tr><td width="30"><font color="#FFD700">{stars}</font></td>'
            f'<td><font color="#FF3864"><b>{name}</b></font><br/>'
            f'<font color="#B8B0C0" size="-1">— {author}</font><br/>'
            f'<font color="#F0E6FF">{text}</font></td></tr></table>',
            ParagraphStyle('Review', fontName='DejaVuSans', fontSize=9, leading=13, textColor=SOFT_WHITE, spaceBefore=5, spaceAfter=8)))
    
    elements.append(spacer(5))
    elements.append(Paragraph("Système de Notation", style_h3))
    elements.append(Paragraph(
        "Les « étoiles ninja » remplacent les étoiles classiques :<br/>"
        "1⭐ = Genin (débutant) → 5⭐ = Kage (maître)<br/>"
        "Animation : les étoiles tournoient et brillent lors de la notation.<br/>"
        "Les avis les plus « puissants » (utiles) remontent en haut avec un effet de glowing.",
        style_body))
    
    # ── PAGE 14: Section Blog/Lore ──
    elements.append(PageBreak())
    elements.append(Paragraph("SECTION BLOG/LORE — L'UNIVERS NARRATIF", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Transmedia Storytelling", style_h2))
    elements.append(Paragraph(
        "VAPE NOCTURNE ne vend pas seulement des produits, il <b>raconte une histoire</b>. "
        "L'univers narratif est construit comme un manga interactif où chaque produit, chaque "
        "collection, chaque événement fait partie d'une saga plus grande.",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Le Lore Fondateur", style_h3))
    elements.append(Paragraph(
        "<b>« En l'an 20XX, Neo-Casablanca brille sous les néons. Une organisation secrète, "
        "les « Nocturnes », maîtrise l'art ancestral de la fumée. Leur mission : libérer "
        "la ville de l'emprise des « Tabacombattants » (l'industrie du tabac). "
        "Chaque produit VAPE NOCTURNE est une arme dans cette guerre silencieuse... »</b>",
        style_quote))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Personnages et Factions", style_h3))
    lore_items = [
        "<b>Kage (personnage principal) :</b> La mascotte, une hackeuse cyberpunk mi-humaine mi-IA, guide les utilisateurs",
        "<b>Les Nocturnes :</b> La guilde des vapoteurs, alliés du joueur, chaque niveau de fidélité débloque du contenu",
        "<b>Les Tabacombattants :</b> Les antagonistes, grandes corporations du tabac, boss à vaincre via des défis",
        "<b>Les Ronin :</b> Vapoteurs solitaires, maîtres du DIY et des setup extrêmes, légendes urbaines",
        "<b>Les Yokai :</b> Esprits de la fumée, créatures mystiques liées aux saveurs exotiques des e-liquides",
    ]
    for item in lore_items:
        elements.append(bullet(item))
    
    # ── PAGE 15: Navigation & UX ──
    elements.append(PageBreak())
    elements.append(Paragraph("NAVIGATION & UX FLOW", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Parcours Utilisateur", style_h2))
    elements.append(Paragraph(
        "Le flow de navigation est conçu pour <b>minimiser les frictions</b> tout en maximisant l'immersion :",
        style_body))
    elements.append(spacer(5))
    
    flow_items = [
        "<b>1. Arrivée → Hero :</b> L'utilisateur arrive sur la page et est immédiatement immergé dans l'univers visuel",
        "<b>2. Découverte → Produits :</b> Scroll vers le bas, les produits apparaissent avec des animations progressives",
        "<b>3. Interaction → Personnalisation :</b> L'utilisateur peut configurer son produit idéal en 3D temps réel",
        "<b>4. Confiance → Avis :</b> Témoignages visuels style manga qui rassurent et engagent",
        "<b>5. Immersion → Lore :</b> L'histoire du monde VAPE NOCTURNE, les personnages, les quêtes",
        "<b>6. Conversion → Boutique :</b> Ajout au panier (inventaire RPG) et checkout fluide",
        "<b>7. Fidélisation → Profil :</b> Badges, guildes, historique des achats, quêtes accomplies",
    ]
    for item in flow_items:
        elements.append(Paragraph(f"<b>{item}</b>", style_body_small))
    elements.append(spacer(12))
    
    elements.append(Paragraph("Menu de Navigation", style_h2))
    elements.append(Paragraph(
        "Le menu principal est un <b>hamburger animé style interface HUD cyberpunk</b>. "
        "Les icônes sont des pictogrammes inspirés des kanji. Le menu s'ouvre avec "
        "un effet de « glitch holographique » et révèle les sections avec un délai staggered.",
        style_body))
    elements.append(spacer(5))
    
    nav_specs = [
        "Sticky après 300px de scroll (avec effet de transition)",
        "Indicateur de progression de lecture (scroll progress bar)",
        "Mini-carte de la rue Tokyo (position actuelle dans le parcours)",
        "Notifications en temps réel (panier, quêtes, messages)",
        "Mode sombre / Mode Akira (toggle dans le menu)",
        "Recherche avec suggestions animées et prédictions",
    ]
    for item in nav_specs:
        elements.append(Paragraph(f"▸ {item}", style_body_small))
    
    return elements


def build_design_system():
    """Pages 16-25: Design System"""
    elements = []
    
    # ── PAGE 16: Design System Overview ──
    elements.append(PageBreak())
    elements.append(Paragraph("DESIGN SYSTEM COMPLET", style_section_title))
    elements.append(Paragraph("Composants, micro-interactions et guidelines UI", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Philosophie du Design", style_h2))
    elements.append(Paragraph(
        "Le design system de VAPE NOCTURNE fusionne <b>l'esthétique cyberpunk japonaise</b> avec les "
        "meilleures pratiques d'UX moderne. Chaque composant est conçu pour raconter une histoire "
        "tout en restant fonctionnel et accessible.",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Principes Directeurs", style_h3))
    principles = [
        "<b>Dark-first :</b> Le mode sombre est l'état par défaut, le clair est secondaire",
        "<b>Néon subtil :</b> Les lueurs néon sont utilisées avec parcimonie pour guider l'attention",
        "<b>Animation signifiante :</b> Chaque mouvement a un sens (chargement, succès, erreur, transition)",
        "<b>Glitch contrôlé :</b> Effets de distorsion utilisés pour renforcer l'identité, pas pour décorer",
        "<b>Japon moderne :</b> Éléments traditionnels (kanji, motifs) réinterprétés en version digitale",
        "<b>Mobile adapté :</b> L'expérience mobile conserve 70% de l'impact visuel desktop",
    ]
    for p in principles:
        elements.append(bullet(p))
    
    # ── PAGE 17: Color Palette ──
    elements.append(PageBreak())
    elements.append(Paragraph("PALETTE DE COULEURS DÉTAILLÉE", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Système de Couleurs", style_h2))
    elements.append(Paragraph(
        "La palette est composée de <b>5 couleurs primaires</b> et de <b>10 couleurs secondaires</b> "
        "qui couvrent tous les besoins du design system, des arrière-plans aux états de survol.",
        style_body))
    elements.append(spacer(10))
    
    # Extended color table
    ext_colors = [
        [Paragraph("Catégorie", style_h3), Paragraph("Nom", style_h3), Paragraph("Code", style_h3), Paragraph("Usage", style_h3)],
        [Paragraph("Primaire", style_body), Paragraph("Noir Cosmique", style_body), Paragraph("#0D0221", style_body), Paragraph("Arrière-plans", style_body)],
        [Paragraph("Primaire", style_body), Paragraph("Rose Néon", style_body), Paragraph("#FF3864", style_body), Paragraph("CTA, accents", style_body)],
        [Paragraph("Primaire", style_body), Paragraph("Cyan Électrique", style_body), Paragraph("#00F0FF", style_body), Paragraph("Liens, lueurs", style_body)],
        [Paragraph("Primaire", style_body), Paragraph("Violet Profond", style_body), Paragraph("#7B2D8E", style_body), Paragraph("Dégradés", style_body)],
        [Paragraph("Primaire", style_body), Paragraph("Or", style_body), Paragraph("#FFD700", style_body), Paragraph("Premium, badges", style_body)],
        [Paragraph("Surface", style_body), Paragraph("Dark", style_body), Paragraph("#1A1A2E", style_body), Paragraph("Cards, sections", style_body)],
        [Paragraph("Surface", style_body), Paragraph("Darker", style_body), Paragraph("#0D0221", style_body), Paragraph("Modaux, overlays", style_body)],
        [Paragraph("Surface", style_body), Paragraph("Elevated", style_body), Paragraph("#2D1B4E", style_body), Paragraph("Hover states", style_body)],
        [Paragraph("Texte", style_body), Paragraph("Primary", style_body), Paragraph("#F0E6FF", style_body), Paragraph("Texte principal", style_body)],
        [Paragraph("Texte", style_body), Paragraph("Secondary", style_body), Paragraph("#B8B0C0", style_body), Paragraph("Texte secondaire", style_body)],
        [Paragraph("Texte", style_body), Paragraph("Muted", style_body), Paragraph("#6B5B7B", style_body), Paragraph("Placeholder", style_body)],
        [Paragraph("État", style_body), Paragraph("Success", style_body), Paragraph("#00FF88", style_body), Paragraph("Validation", style_body)],
        [Paragraph("État", style_body), Paragraph("Error", style_body), Paragraph("#FF3864", style_body), Paragraph("Erreurs", style_body)],
        [Paragraph("État", style_body), Paragraph("Warning", style_body), Paragraph("#FFB800", style_body), Paragraph("Alertes", style_body)],
        [Paragraph("État", style_body), Paragraph("Info", style_body), Paragraph("#00B4FF", style_body), Paragraph("Informations", style_body)],
    ]
    t = Table(ext_colors, colWidths=[80, 110, 90, 170])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    
    # ── PAGE 18: Typography ──
    elements.append(PageBreak())
    elements.append(Paragraph("TYPOGRAPHIE & GRILLE", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Système Typographique", style_h2))
    elements.append(Paragraph(
        "La typographie de VAPE NOCTURNE utilise trois familles de polices, chacune ayant un rôle spécifique :",
        style_body))
    elements.append(spacer(8))
    
    type_data = [
        [Paragraph("Police", style_h3), Paragraph("Style", style_h3), Paragraph("Taille", style_h3), Paragraph("Usage", style_h3)],
        [Paragraph("Orbitron", style_body), Paragraph("Sans-serif géométrique, futuriste", style_body), Paragraph("48px → 18px", style_body), Paragraph("Titres, logos, grandes sections", style_body)],
        [Paragraph("Noto Sans JP", style_body), Paragraph("Sans-serif humaniste, multilingue", style_body), Paragraph("32px → 14px", style_body), Paragraph("Corps de texte, interface, japonais", style_body)],
        [Paragraph("JetBrains Mono", style_body), Paragraph("Mono espacement", style_body), Paragraph("16px → 10px", style_body), Paragraph("Code, specs, données chiffrées", style_body)],
    ]
    t = Table(type_data, colWidths=[110, 180, 100, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t)
    elements.append(spacer(12))
    
    elements.append(Paragraph("Hiérarchie Typographique", style_h3))
    elements.append(Paragraph(
        "<b>H1 — Titre de section :</b> Orbitron 48px, gras, espacement large<br/>"
        "<b>H2 — Titre de bloc :</b> Orbitron 32px, semi-gras<br/>"
        "<b>H3 — Sous-titre :</b> Noto Sans JP 24px, bold<br/>"
        "<b>Body — Corps :</b> Noto Sans JP 16px, regular, hauteur de ligne 1.6<br/>"
        "<b>Small — Légende :</b> Noto Sans JP 13px, light<br/>"
        "<b>Caption — Légende technique :</b> JetBrains Mono 11px",
        style_body))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Grille de Mise en Page", style_h2))
    elements.append(Paragraph(
        "Grille fluide 12 colonnes pour desktop, 8 pour tablette, 4 pour mobile.<br/>"
        "Gouttière : 24px desktop, 16px tablette, 12px mobile.<br/>"
        "Marge : 80px desktop, 40px tablette, 20px mobile.<br/>"
        "Breakpoints : 1280px / 768px / 480px",
        style_body))
    
    # ── PAGE 19: Components - Buttons ──
    elements.append(PageBreak())
    elements.append(Paragraph("COMPOSANTS — BOUTONS & CTA", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Système de Boutons", style_h2))
    elements.append(Paragraph(
        "Les boutons sont conçus avec des effets <b>néon lumineux</b> et des <b>micro-interactions</b> "
        "qui renforcent l'identité cyberpunk. Chaque bouton raconte une histoire au survol.",
        style_body))
    elements.append(spacer(8))
    
    btn_styles = [
        "<b>Primary (Rose Néon) :</b> Fond #FF3864, lueur extérieure, hover → expansion + éclat lumineux, texte blanc",
        "<b>Secondary (Cyan) :</b> Fond transparent, bordure #00F0FF 2px, hover → remplissage cyan, texte sombre",
        "<b>Tertiary (Outline) :</b> Fond transparent, bordure #F0E6FF 1px, hover → lueur violette subtile",
        "<b>CTA Principal :</b> Dégradé rose → violet, animation de « pulse » lumineux, effet particules au clic",
        "<b>Ghost :</b> Pas de fond ni bordure, hover → fond violet transparent avec icône animée",
        "<b>Danger :</b> Fond #FF3864, bordure rouge foncé, effet de « glitch alert » au hover",
        "<b>Premium (Or) :</b> Fond #FFD700, texte sombre, hover → particules dorées, réservé aux actions VIP",
    ]
    for b in btn_styles:
        elements.append(Paragraph(f"▸ {b}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("États et Animations", style_h3))
    elements.append(Paragraph(
        "• Default → Normal : éclairage constant subtil<br/>"
        "• Hover → Brightness + 20%, scale 1.02, lueur amplifiée<br/>"
        "• Active → Scale 0.98, flash lumineux<br/>"
        "• Disabled → Opacité 0.4, pas d'interaction<br/>"
        "• Loading → Spinner style Sharingan intégré dans le bouton<br/>"
        "• Success → Checkmark animé + flash vert<br/>"
        "• Error → Shake horizontal + contour rouge",
        style_body))
    
    # ── PAGE 20: Components - Cards ──
    elements.append(PageBreak())
    elements.append(Paragraph("COMPOSANTS — CARTES & CONTENEURS", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Types de Cartes", style_h2))
    elements.append(Paragraph(
        "Les cartes sont les conteneurs principaux du contenu. Chaque type a un rôle spécifique "
        "et une apparence adaptée à son contexte.",
        style_body))
    elements.append(spacer(8))
    
    card_types = [
        "<b>Product Card :</b> Image 3D du produit, nom, prix, bouton ajout, badge catégorie, étoiles ninja. Bordure néon subtile, fond #1A1A2E",
        "<b>Feature Card :</b> Icône animée, titre, description, lien. Fond #0D0221 avec accent coloré en haut",
        "<b>Profile Card :</b> Avatar (style manga), pseudo, niveau guilde, badges, XP progress bar. Fond #2D1B4E",
        "<b>Story Card :</b> Image de fond, overlay dégradé, titre de chapitre, extrait. Pour le lore et le blog",
        "<b>Testimonial Card :</b> Bulle de manga, avatar chibi, pseudo, étoiles, texte. Fond #1A0533 transparent",
        "<b>Review Card :</b> Note, titre, date, texte, bouton utile. Style parchemin numérique avec bordures kanji",
    ]
    for c in card_types:
        elements.append(Paragraph(f"▸ {c}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Spécifications de Design", style_h3))
    card_specs = [
        "Border-radius : 12px (cards), 8px (petits composants), 20px (modaux)",
        "Ombre : Glow néon subtil (box-shadow avec la couleur du thème)",
        "Padding : 24px interne, 16px pour les versions compactes",
        "Animation d'entrée : Fade-in + translateY(20px) avec stagger",
        "Hover : Élévation (transform: translateY(-4px)), glow amplifié",
    ]
    for s in card_specs:
        elements.append(Paragraph(f"▸ {s}", style_body_small))
    
    # ── PAGE 21: Components - Forms ──
    elements.append(PageBreak())
    elements.append(Paragraph("COMPOSANTS — FORMULAIRES & INPUTS", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Style des Inputs", style_h2))
    elements.append(Paragraph(
        "Les champs de formulaire adoptent le style <b>interface holographique</b> avec des lignes lumineuses "
        "et des feedbacks visuels immédiats.",
        style_body))
    elements.append(spacer(8))
    
    form_specs = [
        "<b>Input Text :</b> Fond transparent, bordure inférieure cyan (#00F0FF) 2px, label flottant. Focus : lueur s'intensifie",
        "<b>Textarea :</b> Style similar, bordure sur 3 côtés, angle néon en bas à droite. Redimensionnable verticalement",
        "<b>Select :</b> Style custom avec flèche animée, options avec fond sombre et hover violet",
        "<b>Checkbox :</b> Caché natif → custom carré néon, checked → icône ninja star, animation spin",
        "<b>Radio :</b> Cercle néon, selected → remplissage + pulse, label cliquable",
        "<b>Toggle :</b> Style cyberpunk, slider avec effet de glow, ON = violet, OFF = gris foncé",
        "<b>Range Slider :</b> Custom avec fill violet et thumb néon, utilisé pour le configurateur 3D",
        "<b>File Upload :</b> Zone de drop stylisée avec icône dossier holographique, progression upload en cercle néon",
    ]
    for f in form_specs:
        elements.append(Paragraph(f"▸ {f}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Validation & Feedback", style_h3))
    elements.append(Paragraph(
        "• Succès → Bordure verte (#00FF88) + checkmark animé<br/>"
        "• Erreur → Bordure rose (#FF3864) + shake horizontal + message d'erreur en dessous<br/>"
        "• Warning → Bordure jaune (#FFB800) + icône attention<br/>"
        "• Loading → Spinner style Sharingan (anneau qui tourne avec motif de partage) dans le champ<br/>"
        "• Compteur de caractères → Affiché en bas à droite, couleur change près de la limite",
        style_body))
    
    # ── PAGE 22: Micro-interactions ──
    elements.append(PageBreak())
    elements.append(Paragraph("MICRO-INTERACTIONS & ANIMATIONS", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Catalogue d'Animations", style_h2))
    elements.append(Paragraph(
        "Chaque interaction utilisateur est une opportunité de <b>renforcer l'immersion</b>. "
        "Les animations sont fluides, réactives et porteuses de sens.",
        style_body))
    elements.append(spacer(8))
    
    micro_items = [
        "<b>Hover Links :</b> Soulignement animé de gauche à droite avec lueur cyan",
        "<b>Hover Cards :</b> Élévation + glow + bordure animée. Les cartes produit montrent un aperçu 3D",
        "<b>Click Effects :</b> Onde de particules depuis le point de clic (ripple) en couleur néon",
        "<b>Scroll Progress :</b> Barre latérale qui indique la progression dans la page, style compteur d'XP",
        "<b>Page Transition :</b> Effet « warp speed » (lignes de fuite lumineuses) entre les pages, style anime",
        "<b>Loader :</b> Cercle de chargement style Sharingan (3 tomoe qui tournent) en violet/rose",
        "<b>Notifications :</b> Toast avec glow, slide depuis le bord, icône animée (succès/erreur/info)",
        "<b>Tooltip :</b> Bulle holographique semi-transparente qui apparaît avec un effet de scan",
        "<b>Skeleton :</b> Pulse gradient violet/rose pour le chargement de contenu, formes arrondies",
        "<b>Empty State :</b> Illustration animée en pixel art (personnage qui attend) + message stylisé",
    ]
    for m in micro_items:
        elements.append(Paragraph(f"▸ {m}", style_body_small))
    
    # ── PAGE 23: Dark Mode & Akira Mode ──
    elements.append(PageBreak())
    elements.append(Paragraph("MODES D'AFFICHAGE", style_section_title))
    elements.append(Paragraph("Dark Mode + Mode Akira (rouge intense)", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Dark Mode (Par défaut)", style_h2))
    elements.append(Paragraph(
        "Le mode sombre est l'état par défaut du site. Il utilise la palette cosmique "
        "avec des arrière-plans profonds (#0D0221, #1A1A2E) et des accents lumineux. "
        "Le contraste est calculé pour respecter les normes WCAG AA minimum.",
        style_body))
    elements.append(spacer(5))
    
    elements.append(Paragraph("Mode Akira (Easter Egg)", style_h2))
    elements.append(Paragraph(
        "Le mode « Akira » est un <b>easter egg</b> qui transforme l'intégralité du site en rouge intense, "
        "inspiré du film culte Akira (1988). Déclenché via une combinaison spéciale ou dans les paramètres :",
        style_body))
    elements.append(spacer(5))
    
    akira_items = [
        "Palette entièrement en nuances de rouge : #1A0000 → #FF0000 → #FF4444",
        "Police d'interface : style plus agressif, légèrement déformée",
        "Particules : étincelles rouges au lieu de sakura",
        "Musique de fond : ambiant industrial au lieu de lo-fi",
        "Mascotte : tenue rouge et noire, expression plus sérieuse",
        "Effets sonores : distorsion et réverbération accrues",
        "Mode uniquement accessible via Konami Code (↑↑↓↓←→←→ BA) ou toggle dans le menu « Secret »",
        "Option de désactivation : « Revenir à la réalité » avec animation de bris de verre",
    ]
    for a in akira_items:
        elements.append(bullet(a))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Spécifications d'Accessibilité", style_h3))
    elements.append(Paragraph(
        "• Rapport de contraste minimum WCAG AA : 4.5:1 pour le texte normal, 3:1 pour les grands textes<br/>"
        "• Taille minimum des cibles cliquables : 44x44 px<br/>"
        "• Navigation entièrement au clavier : Tab, Enter, Escape, flèches<br/>"
        "• Mode « Sans animation » : désactive toutes les animations (pour épileptiques)<br/>"
        "• ARIA labels sur tous les composants interactifs<br/>"
        "• Focus visible : outline néon cyan personnalisé au lieu du contour natif<br/>"
        "• Texte alternatif sur toutes les images et icônes<br/>"
        "• Structure sémantique : headings hiérarchisés, landmarks",
        style_body))
    
    # ── PAGE 24: Sound Design ──
    elements.append(PageBreak())
    elements.append(Paragraph("SOUND DESIGN & AMBIANCE AUDIO", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Environnement Sonore", style_h2))
    elements.append(Paragraph(
        "L'audio est un <b>élément optionnel mais immersif</b> du design. Chaque son est "
        "minimaliste, de haute qualité, et s'intègre naturellement dans l'expérience. "
        "Les utilisateurs peuvent tout désactiver via un bouton dédié.",
        style_body))
    elements.append(spacer(8))
    
    audio_items = [
        "<b>Ambient BG (optionnel) :</b> Lo-fi hip hop / synthwave avec bruit de pluie et néons. ~15min loop, volume adaptable",
        "<b>Hover SFX :</b> Son subtil de « glitch digital » ou de « pulse néon » au survol des éléments interactifs",
        "<b>Click SFX :</b> Son de « confirmation cybernétique » (bip harmonique) au clic sur les boutons et CTA",
        "<b>Scroll qui défile :</b> Son léger de « machine à écrire pixelisée » quand on scrolle rapidement",
        "<b>Ajout au panier :</b> Son de « pièce qui tombe » ou de « level up » RPG, selon le contexte",
        "<b>Notification/Succès :</b> Son « chime » cristallin avec réverbération pour les accomplissements",
        "<b>Transition de page :</b> Effet sonore de « warp drive » ou de « distorsion temporelle »",
        "<b>Mode Akira :</b> La musique passe en industrial/techno sombre, sons plus agressifs",
    ]
    for a in audio_items:
        elements.append(Paragraph(f"▸ {a}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Spécifications Techniques Audio", style_h3))
    elements.append(Paragraph(
        "• Format : WebM (opus) / AAC fallback<br/>"
        "• Poids : < 200 Ko par son, < 2 Mo pour la boucle ambient<br/>"
        "• API : Web Audio API avec Howler.js pour la gestion<br/>"
        "• Streaming : Les sons sont chargés en lazy, pas de blocage au load<br/>"
        "• Volume : Réglable séparément (musique / SFX) + mute global<br/>"
        "• Auto-play : Bloqué, l'utilisateur doit cliquer « Activer le son » dans le menu",
        style_body))
    
    # ── PAGE 25: Accessibility ──
    elements.append(PageBreak())
    elements.append(Paragraph("ACCESSIBILITÉ & INCLUSION", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Engagement d'Accessibilité", style_h2))
    elements.append(Paragraph(
        "VAPE NOCTURNE s'engage à offrir une expérience <b>accessible à tous</b>, sans compromis "
        "sur l'identité visuelle. Les fonctionnalités d'accessibilité sont intégrées dès la conception.",
        style_body))
    elements.append(spacer(8))
    
    a11y_items = [
        ["Fonctionnalité", "Description", "Priorité"],
        ["Mode « Sans animation »", "Désactive toutes les animations, transitions et particules. Accessible depuis le menu ou via préférences système.", "Haute"],
        ["Navigation clavier complète", "Tous les éléments sont accessibles au clavier. Indicateur de focus visible personnalisé.", "Haute"],
        ["Contraste WCAG AA", "Ratio minimum 4.5:1 pour le texte normal, 3:1 pour les grands textes. Vérifié sur chaque composant.", "Haute"],
        ["ARIA labels", "Tous les composants interactifs ont des labels ARIA descriptifs.", "Haute"],
        ["Structure sémantique", "Hiérarchie de titres correcte, balises sémantiques HTML5 (nav, main, article, aside).", "Haute"],
        ["Texte alternatif", "Toutes les images et icônes fonctionnelles ont un alt text descriptif.", "Moyenne"],
        ["Redimensionnement texte", "Support du zoom jusqu'à 200% sans perte de fonctionnalité.", "Moyenne"],
        ["Réduction de mouvement", "Détection de prefers-reduced-motion pour désactiver les animations automatiquement.", "Haute"],
        ["Sous-titres vidéo", "Toutes les vidéos promotionnelles auront des sous-titres en français et arabe.", "Moyenne"],
        ["Lecture d'écran", "Compatibilité avec NVDA, JAWS, VoiceOver. Tests réguliers.", "Haute"],
    ]
    t = Table(a11y_items, colWidths=[160, 220, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    
    return elements


def build_tech_stack():
    """Pages 26-35: Tech Stack"""
    elements = []
    
    # ── PAGE 26: Stack Overview ──
    elements.append(PageBreak())
    elements.append(Paragraph("STACK TECHNIQUE AVANCÉE", style_section_title))
    elements.append(Paragraph("Architecture full-stack Next.js 14", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Vue d'Ensemble de la Stack", style_h2))
    elements.append(Paragraph(
        "L'architecture technique de VAPE NOCTURNE est conçue pour <b>l'immersion 3D et la performance</b>. "
        "La stack est moderne, maintenable et scalable, avec des technologies éprouvées combinées "
        "à des librairies de pointe pour l'expérience utilisateur.",
        style_body))
    elements.append(spacer(8))
    
    stack_data = [
        [Paragraph("Couche", style_h3), Paragraph("Technologie", style_h3), Paragraph("Rôle", style_h3)],
        [Paragraph("Frontend", style_body), Paragraph("Next.js 14 + App Router", style_body), Paragraph("Framework React full-stack, SSR, routing", style_body)],
        [Paragraph("3D & WebGL", style_body), Paragraph("Three.js / React Three Fiber", style_body), Paragraph("Scènes 3D, shaders, particules", style_body)],
        [Paragraph("Animation", style_body), Paragraph("GSAP + ScrollTrigger + Framer Motion", style_body), Paragraph("Animations scroll, transitions, micro-UI", style_body)],
        [Paragraph("Styles", style_body), Paragraph("Tailwind CSS + shadcn/ui", style_body), Paragraph("Design system, composants réutilisables", style_body)],
        [Paragraph("Scroll", style_body), Paragraph("Lenis (smooth scroll)", style_body), Paragraph("Smooth scroll performant", style_body)],
        [Paragraph("Backend", style_body), Paragraph("Node.js / tRPC", style_body), Paragraph("API type-safe, procédures distantes", style_body)],
        [Paragraph("Base de données", style_body), Paragraph("PostgreSQL + Prisma", style_body), Paragraph("ORM, migrations, requêtes typées", style_body)],
        [Paragraph("Cache", style_body), Paragraph("Redis", style_body), Paragraph("Sessions, cache, rate limiting", style_body)],
        [Paragraph("Paiement", style_body), Paragraph("Stripe", style_body), Paragraph("Paiement sécurisé, abonnements", style_body)],
        [Paragraph("Authentification", style_body), Paragraph("NextAuth.js (Auth.js)", style_body), Paragraph("Session JWT, OAuth (Google, Discord)", style_body)],
        [Paragraph("Stockage", style_body), Paragraph("AWS S3 / Cloudflare R2", style_body), Paragraph("Images, vidéos, fichiers utilisateur", style_body)],
        [Paragraph("Déploiement", style_body), Paragraph("Vercel / Docker", style_body), Paragraph("CI/CD auto-scaling, preview deployments", style_body)],
    ]
    t = Table(stack_data, colWidths=[90, 180, 220])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    
    # ── PAGE 27: Next.js Architecture ──
    elements.append(PageBreak())
    elements.append(Paragraph("NEXT.JS 14 — ARCHITECTURE DÉTAILLÉE", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("App Router Structure", style_h2))
    elements.append(Paragraph(
        "Utilisation du nouveau App Router de Next.js 14 avec Server Components par défaut, "
        "et Client Components uniquement là où c'est nécessaire (interactivité 3D, animations).",
        style_body))
    elements.append(spacer(5))
    
    elements.append(Paragraph("Structure des Répertoires", style_h3))
    code_structure = """app/
├── (marketing)/          # Pages marketing (Hero, Blog, Lore)
│   ├── page.tsx          # Landing page (SPA scroll)
│   ├── loading.tsx       # Loading state (Sharingan spinner)
│   └── error.tsx         # Error boundary (page erreur stylisée)
├── (shop)/               # Pages boutique
│   ├── produits/         # Catalogue + filtres
│   ├── produit/[id]/     # Page produit individuelle
│   ├── panier/           # Panier style inventaire RPG
│   └── checkout/         # Checkout Stripe
├── (auth)/               # Authentification
│   ├── connexion/
│   └── inscription/
├── profil/               # Profil utilisateur
│   ├── guildes/          # Système de guildes
│   └── inventaire/       # Inventaire badges / historique
├── api/                  # API routes (tRPC + Stripe webhooks)
├── layout.tsx            # Layout global (menu, footer, audio)
└── globals.css           # Styles globaux (Tailwind)"""
    
    for line in code_structure.split('\n'):
        elements.append(Paragraph(line, style_code))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Performance & Optimisation", style_h3))
    perf_items = [
        "Server Components : Réduction du JS côté client de ~60%",
        "Streaming SSR : Pages qui chargent progressivement",
        "Image Optimization : next/image avec WebP/AVIF, lazy loading",
        "Font Optimization : next/font pour Orbitron et Noto Sans JP",
        "Route Groups : Séparation marketing / shop / auth pour le code splitting",
        "Middleware : Rate limiting, redirections, A/B testing",
        "Service Worker : PWA pour mode offline (pages en cache)",
    ]
    for p in perf_items:
        elements.append(Paragraph(f"▸ {p}", style_body_small))
    
    # ── PAGE 28: Three.js / R3F ──
    elements.append(PageBreak())
    elements.append(Paragraph("THREE.JS & REACT THREE FIBER", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Système 3D Principal", style_h2))
    elements.append(Paragraph(
        "Le rendu 3D est au cœur de l'expérience VAPE NOCTURNE. React Three Fiber (R3F) "
        "s'intègre nativement avec React pour une gestion déclarative de la scène 3D.",
        style_body))
    elements.append(spacer(8))
    
    three_items = [
        ["Composant", "Technologie", "Description"],
        ["Scene de fond", "Three.js + ShaderMaterial custom", "Rue Tokyo néon procédurale avec shaders GLSL pour les lumières"],
        ["Mascotte 3D", "R3F + GLTF Loader", "Personnage animé avec blend shapes (expressions faciales)"],
        ["Carrousel Produit", "R3F + Drei (useFrameloop)", "Rotation 360° des produits avec scroll fluide"],
        ["Particules", "Three.js PointsMaterial", "Système de fumée WebGL avec 10k+ particules"],
        ["Configurateur", "R3F + leva (controls UI)", "Modification temps réel des matériaux et couleurs"],
        ["Transitions", "R3F + drei (Transition)", "Effets warp speed entre les sections"],
        ["Post-processing", "EffectComposer + UnrealBloomPass", "Glow néon, bokeh, chromatic aberration"],
    ]
    t = Table(three_items, colWidths=[120, 160, 220])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Shader Custom — GLSL", style_h3))
    elements.append(Paragraph(
        "Les shaders sont écrits en GLSL et compilés via Three.js ShaderMaterial. "
        "Effets principaux :<br/>"
        "• <b>Néon Pulse :</b> Onde lumineuse sinusoïdale avec effet de glow<br/>"
        "• <b>Fumée Volumétrique :</b> Bruit de Perlin 3D pour la fumée qui s'écoule<br/>"
        "• <b>Distorsion Glitch :</b> Déplacement aléatoire de pixels + bruit chromatique<br/>"
        "• <b>Hologramme :</b> Scan lines, chromatic aberration, translucidité<br/>"
        "• <b>Sakura Fall :</b> Particules avec trajectoire sinusoïdale et rotation",
        style_body))
    
    # ── PAGE 29: GSAP ScrollTrigger ──
    elements.append(PageBreak())
    elements.append(Paragraph("GSAP & SCROLLTRIGGER", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Animations au Scroll", style_h2))
    elements.append(Paragraph(
        "GSAP combiné à ScrollTrigger est utilisé pour les <b>animations narratives</b> "
        "qui racontent une histoire au fur et à mesure que l'utilisateur défile.",
        style_body))
    elements.append(spacer(8))
    
    gsap_items = [
        "<b>Parallax profond :</b> 5 calques de profondeur animés à des vitesses différentes (ciel → buildings → néons → premier plan)",
        "<b>Révélation de contenu :</b> Les titres et cartes apparaissent avec un effet de « glitch reveal » (distorsion + apparition)",
        "<b>Timeline narrative :</b> Chaque section a une séquence d'animations synchronisées avec la position de scroll",
        "<b>Progress bar :</b> Barre de progression avec dégradé rose/violet, style « barre d'XP RPG »",
        "<b>Pin sections :</b> Certaines sections sont « épinglées » pendant leur animation (ex: configurateur 3D qui reste visible)",
        "<b>Scroll-based 3D :</b> La position de la caméra Three.js est liée à l'avancement du scroll",
    ]
    for g in gsap_items:
        elements.append(Paragraph(f"▸ {g}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Extraits de Configuration", style_h3))
    code_gsap = """// Configuration ScrollTrigger type
gsap.to('.hero-title', {
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.5,
  },
  opacity: 0,
  scale: 0.8,
  y: -100,
})

// Timeline narrative
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.produits-section',
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    pin: true,
  }
})
tl.to('.produit-card', { x: -300, stagger: 0.2 })
  .to('.produit-info', { opacity: 1, y: 0 }, '-=0.5')"""
    
    for line in code_gsap.split('\n'):
        elements.append(Paragraph(line, style_code))
    
    # ── PAGE 30: Framer Motion ──
    elements.append(PageBreak())
    elements.append(Paragraph("FRAMER MOTION", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Micro-interactions & Transitions UI", style_h2))
    elements.append(Paragraph(
        "Framer Motion gère les <b>micro-interactions</b> et les <b>transitions de composants</b> "
        "au niveau UI. Contrairement à GSAP (scroll narratif), Framer Motion est utilisé pour "
        "les animations réactives et les gestes.",
        style_body))
    elements.append(spacer(8))
    
    framer_items = [
        "<b>Layout animations :</b> AnimatePresence pour les entrées/sorties de composants (panier, modales, notifications)",
        "<b>Drag gestures :</b> Carrousel 3D draggable, configurateur avec sliders, DnD pour l'inventaire",
        "<b>Stagger children :</b> Apparition progressive des listes (produits, avis, badges) avec délai staggered",
        "<b>Hover & Tap :</b> Scale, glow, rotation sur les éléments interactifs avec retour élastique (spring)",
        "<b>Variants :</b> Système de variants pour les états (default, hover, active, disabled, loading, success)",
        "<b>Morphing SVG :</b> Icônes qui se transforment (ex: cœur → étoile, panier vide → panier plein)",
        "<b>Exit animations :</b> Les composants qui disparaissent ont une animation de sortie (fade + scale + rotate)",
    ]
    for f in framer_items:
        elements.append(Paragraph(f"▸ {f}", style_body_small))
    
    # ── PAGE 31: Tailwind + shadcn ──
    elements.append(PageBreak())
    elements.append(Paragraph("TAILWIND CSS & SHADCN/UI", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Design System avec Tailwind", style_h2))
    elements.append(Paragraph(
        "Le design system est implémenté via <b>Tailwind CSS</b> avec une configuration "
        "personnalisée qui étend les couleurs et les animations par défaut.",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Configuration Tailwind (extrait)", style_h3))
    code_tailwind = """// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'nocturne': {
          'black': '#0D0221',
          'dark': '#1A1A2E',
          'purple': '#7B2D8E',
          'pink': '#FF3864',
          'cyan': '#00F0FF',
          'gold': '#FFD700',
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'noto-jp': ['Noto Sans JP', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'sharingan-spin': 'sharingan-spin 1s linear infinite',
        'sakura-fall': 'sakura-fall 10s linear infinite',
      },
      keyframes: {
        glitch: { ... },
        'neon-pulse': { ... },
      }
    }
  }
}"""
    for line in code_tailwind.split('\n'):
        elements.append(Paragraph(line, style_code))
    elements.append(spacer(10))
    
    elements.append(Paragraph("shadcn/ui — Base de Composants", style_h3))
    elements.append(Paragraph(
        "shadcn/ui fournit la <b>base de composants</b> (button, card, dialog, form, toast…) "
        "qui sont ensuite <b>customisés visuellement</b> pour correspondre au thème VAPE NOCTURNE. "
        "Avantages : accessibilité intégrée, typage fort, personnalisation complète.",
        style_body))
    
    # ── PAGE 32: Lenis Smooth Scroll ──
    elements.append(PageBreak())
    elements.append(Paragraph("LENIS — SMOOTH SCROLL", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Smooth Scroll Performant", style_h2))
    elements.append(Paragraph(
        "Lenis est le <b>moteur de smooth scroll</b> qui remplace le scroll natif par un "
        "scroll fluide et performant. Il est essentiel pour l'expérience narrative immersive.",
        style_body))
    elements.append(spacer(8))
    
    lenis_items = [
        "<b>Scroll fluide :</b> Interpolation linéaire du scroll avec easing personnalisé (easeInOutQuart)",
        "<b>Performance :</b> Utilisation de requestAnimationFrame avec synchronisation verticale",
        "<b>Compatibilité :</b> Fonctionne avec GSAP ScrollTrigger, Three.js, et le scroll natif",
        "<b>Touch/Mobile :</b> Gestion tactile optimisée avec momentum et inertie naturelle",
        "<b>Configuration :</b> Durée (0.8-1.2s selon section), easing, wheel/touch multipliers",
        "<b>Virtual scroll :</b> Lenis remplace le wheel event par son propre système de scroll virtuel",
        "<b>Rails :</b> Sections à scroll horizontal (carrousel produits) gérées via des conteneurs dédiés",
    ]
    for l in lenis_items:
        elements.append(Paragraph(f"▸ {l}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Code d'Intégration", style_h3))
    code_lenis = """// lenis.ts
import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,
  // Durée du scroll smooth
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
})

// Intégration GSAP
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)"""
    
    for line in code_lenis.split('\n'):
        elements.append(Paragraph(line, style_code))
    
    # ── PAGE 33: Backend ──
    elements.append(PageBreak())
    elements.append(Paragraph("BACKEND — NODE.JS / tRPC", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Architecture Backend", style_h2))
    elements.append(Paragraph(
        "Le backend utilise <b>tRPC</b> pour une communication type-safe entre le frontend et le serveur. "
        "Cela permet de développer plus rapidement avec une sécurité de typage de bout en bout.",
        style_body))
    elements.append(spacer(8))
    
    backend_items = [
        "<b>tRPC :</b> Procédures distantes avec type-safety automatique. Pas de REST, pas de GraphQL.",
        "<b>Next.js API Routes :</b> Hébergement des procédures tRPC dans les API routes Next.js.",
        "<b>Middleware :</b> Auth (NextAuth.js), rate limiting (Redis), logging, validation (Zod).",
        "<b>Zod :</b> Validation des schémas à l'entrée et sortie des procédures tRPC.",
        "<b>Server Actions :</b> Pour les mutations simples (formulaires, ajout panier).",
        "<b>Webhooks :</b> Stripe webhooks pour les événements de paiement (checkout.session.completed).",
        "<b>WebSockets :</b> Pour les notifications en temps réel (commandes, messages guildes).",
    ]
    for b in backend_items:
        elements.append(Paragraph(f"▸ {b}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Exemple de Procédure tRPC", style_h3))
    code_trpc = """// server/api/routers/produit.ts
export const produitRouter = router({
  getAll: publicProcedure
    .input(z.object({
      category: z.enum(['shonen', 'seinen', 'chicha']).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.produit.findMany({
        where: {
          ...(input.category && { category: input.category }),
          price: { gte: input.minPrice, lte: input.maxPrice },
        },
        include: { images: true, stock: true },
      })
    }),
    
  buy: protectedProcedure
    .input(z.object({
      productId: z.string(),
      quantity: z.number().min(1).max(10),
      customization: z.object({ color: z.string(), led: z.string() }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Création commande + paiement Stripe
    }),
})"""
    
    for line in code_trpc.split('\n'):
        elements.append(Paragraph(line, style_code))
    
    # ── PAGE 34: Database & Cache ──
    elements.append(PageBreak())
    elements.append(Paragraph("BASE DE DONNÉES & CACHE", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("PostgreSQL + Prisma ORM", style_h2))
    elements.append(Paragraph(
        "PostgreSQL est la base de données principale, avec Prisma comme ORM pour une gestion "
        "type-safe des modèles et des migrations.",
        style_body))
    elements.append(spacer(8))
    
    prisma_model = """// schema.prisma — Modèles principaux
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  pseudo    String
  level     Int      @default(1)  // Niveau guilde
  xp        Int      @default(0)
  guild     Guild?   @relation("GuildMembers")
  badges    Badge[]
  orders    Order[]
  profile   Profile?
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  category    Category // shonen | seinen | chicha
  images      Image[]
  stock       Stock?
  variants    Variant[]
  reviews     Review[]
}

model Order {
  id       String      @id @default(cuid())
  user     User        @relation(fields: [userId], references: [id])
  userId   String
  items    OrderItem[]
  total    Float
  status   OrderStatus
  stripeId String?
  createdAt DateTime @default(now())
}"""
    
    for line in prisma_model.split('\n'):
        elements.append(Paragraph(line, style_code))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Redis Cache", style_h3))
    elements.append(Paragraph(
        "Redis est utilisé pour :<br/>"
        "• Sessions utilisateur (connecté, panier temporaire)<br/>"
        "• Cache de données (catalogue produits, disponibilité stock)<br/>"
        "• Rate limiting (protection contre les abus API)<br/>"
        "• Queue de tâches (envoi emails, notifications)<br/>"
        "• Leaderboard (classement des guildes, XP)<br/>"
        "• Cache des scènes 3D (assets chargés une seule fois)",
        style_body))
    
    # ── PAGE 35: Paiement ──
    elements.append(PageBreak())
    elements.append(Paragraph("PAIEMENT — STRIPE & SOLUTIONS MAROC", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Stratégie de Paiement Multi-canal", style_h2))
    elements.append(Paragraph(
        "Pour le marché marocain, une <b>stratégie de paiement hybride</b> est essentielle. "
        "Stripe est la solution principale pour les paiements internationaux, complétée par "
        "des solutions locales incontournables.",
        style_body))
    elements.append(spacer(8))
    
    payment_data = [
        [Paragraph("Solution", style_h3), Paragraph("Type", style_h3), Paragraph("Frais", style_h3), Paragraph("Priorité", style_h3)],
        [Paragraph("Stripe", style_body), Paragraph("International", style_body), Paragraph("2.9% + 3 MAD", style_body), Paragraph("Principale (CB étrangères)", style_body)],
        [Paragraph("CMI", style_body), Paragraph("Bancaire Maroc", style_body), Paragraph("1.5-2.5%", style_body), Paragraph("Incontournable (CB Maroc)", style_body)],
        [Paragraph("PayZone", style_body), Paragraph("Agrégateur CMI", style_body), Paragraph("2-3%", style_body), Paragraph("Alternative CMI (MVP)", style_body)],
        [Paragraph("Paiement livraison", style_body), Paragraph("Cash on Delivery", style_body), Paragraph("Frais transporteur", style_body), Paragraph("Obligatoire (60% des ventes)", style_body)],
        [Paragraph("Cash Plus", style_body), Paragraph("Paiement en espèce", style_body), Paragraph("Variable", style_body), Paragraph("Optionnel (zones non bancarisées)", style_body)],
        [Paragraph("Mobile Money", style_body), Paragraph("Inwi Money / Orange", style_body), Paragraph("~2%", style_body), Paragraph("Optionnel (jeunes)", style_body)],
        [Paragraph("PayPal", style_body), Paragraph("International", style_body), Paragraph("3.4-5%", style_body), Paragraph("Secondaire (clients étrangers)", style_body)],
    ]
    t = Table(payment_data, colWidths=[110, 100, 120, 160])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Intégration Stripe avec UI Néon", style_h3))
    elements.append(Paragraph(
        "Le checkout Stripe est entièrement customisé avec l'UI néon :<br/>"
        "• PaymentElement style holographique (champs transparents, bordures lumineuses)<br/>"
        "• Animations de transition vers le checkout · slide + effet portail<br/>"
        "• Confirmation de commande avec animation « succès » (particules + son)<br/>"
        "• 3D Secure géré dans une modale stylisée (pas de popup externe)<br/>"
        "• Page de remerciement avec récapitulatif animé et gains d'XP",
        style_body))
    
    return elements


def build_marketing():
    """Pages 36-42: Marketing Strategy"""
    elements = []
    
    # ── PAGE 36: Marketing Overview ──
    elements.append(PageBreak())
    elements.append(Paragraph("STRATÉGIE MARKETING", style_section_title))
    elements.append(Paragraph("Acquisition, engagement et fidélisation", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Vision Marketing", style_h2))
    elements.append(Paragraph(
        "La stratégie marketing de VAPE NOCTURNE s'articule autour de <b>3 piliers</b> : "
        "l'immersion narrative, la construction communautaire et l'exclusivité. "
        "Chaque action marketing est conçue pour renforcer l'univers de la marque.",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Les 3 Piliers Marketing", style_h3))
    pilier_items = [
        "<b>1. IMMERSION NARRATIVE :</b> Le marketing n'est pas de la publicité mais du contenu. Chaque campagne est un « chapitre » de l'histoire VAPE NOCTURNE. Les produits sont des « artéfacts », les clients des « héros ».",
        "<b>2. COMMUNAUTÉ :</b> Discord, TikTok, Instagram — les canaux sont choisis pour leur capacité à créer du lien. Le programme « Guild System » transforme les clients en membres d'une communauté exclusive.",
        "<b>3. EXCLUSIVITÉ :</b> Drops limités, collaborations avec artistes, éditions spéciales numérotées. L'exclusivité crée l'urgence et transforme l'achat en collection.",
    ]
    for p in pilier_items:
        elements.append(Paragraph(f"{p}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Budget Marketing Prévisionnel (Mensuel)", style_h3))
    mkt_data = [
        [Paragraph("Canal", style_h3), Paragraph("Budget (MAD)", style_h3), Paragraph("ROI Attendu", style_h3)],
        [Paragraph("TikTok / Reels", style_body), Paragraph("15 000", style_body), Paragraph("8-12x", style_body)],
        [Paragraph("Influenceurs", style_body), Paragraph("25 000", style_body), Paragraph("5-8x", style_body)],
        [Paragraph("Google Ads", style_body), Paragraph("10 000", style_body), Paragraph("4-6x", style_body)],
        [Paragraph("Instagram / Meta", style_body), Paragraph("8 000", style_body), Paragraph("3-5x", style_body)],
        [Paragraph("Événements / Pop-ups", style_body), Paragraph("20 000", style_body), Paragraph("Branding + Ventes directes", style_body)],
        [Paragraph("Total", style_body), Paragraph("78 000 MAD/mois", style_body), Paragraph("~6x moyen", style_body)],
    ]
    t = Table(mkt_data, colWidths=[160, 160, 170])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    
    # ── PAGE 37: TikTok/Reels ──
    elements.append(PageBreak())
    elements.append(Paragraph("TIKTOK & REELS — STRATÉGIE VIDÉO", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Contenu Viral", style_h2))
    elements.append(Paragraph(
        "TikTok et Instagram Reels sont les <b>canaux principaux d'acquisition</b> pour la cible 18-35 ans. "
        "Le contenu est conçu pour être partagé, avec un focus sur l'esthétique et l'émotion.",
        style_body))
    elements.append(spacer(8))
    
    tiktok_types = [
        "<b>Unboxing style anime :</b> Déballage des produits avec effets visuels overlay (manga, néon, particules). Durée : 15-30s",
        "<b>ASMR Vape :</b> Gros plan sur les nuages de fumée colorée, son de l'air, cliquetis des boutons. Très apaisant.",
        "<b>Speed Custom :</b> Accéléré du configurateur 3D (un produit qui se customise en 10 secondes). Satisfaisant.",
        "<b>Lore TikTok :</b> Mini-épisodes animés de l'histoire VAPE NOCTURNE en motion design. 30-45s.",
        "<b>Tutorial stylé :</b> Montage de son pod préféré avec une esthétique soignée et des transitions fluides.",
        "<b>Challenge Hashtag :</b> #VapeNocturneChallenge — les utilisateurs montrent leur setup, gagnent des points XP.",
        "<b>Collaboration cosplay :</b> Cosplayers célèbres (Maroc) qui utilisent VAPE NOCTURNE dans leurs tenues.",
    ]
    for t in tiktok_types:
        elements.append(Paragraph(f"▸ {t}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Calendrier de Publication", style_h3))
    elements.append(Paragraph(
        "• 3 posts TikTok + 2 Reels par semaine<br/>"
        "• 1 vidéo longue (1-3 min) le dimanche (lore ou tutoriel)<br/>"
        "• Stories quotidiennes : teasers, coulisses, interactions<br/>"
        "• Live mensuel : session Q&A avec l'équipe, giveaway en direct<br/>"
        "• Horaires optimaux : 18h-22h (cible jeunes actifs/étudiants)",
        style_body))
    
    # ── PAGE 38: Collaborations ──
    elements.append(PageBreak())
    elements.append(Paragraph("COLLABORATIONS & INFLUENCEURS", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Stratégie d'Influence", style_h2))
    elements.append(Paragraph(
        "Les influenceurs sont sélectionnés pour leur <b>alignement culturel</b> avec la marque : "
        "cosplayeurs, streamers Twitch, artistes manga, gamer.euses, streetwear addicts.",
        style_body))
    elements.append(spacer(8))
    
    collab_tiers = [
        [Paragraph("Tier", style_h3), Paragraph("Followers", style_h3), Paragraph("Budget/Post", style_h3), Paragraph("Objectif", style_h3)],
        [Paragraph("Nano", style_body), Paragraph("1k-10k", style_body), Paragraph("500-2000 MAD", style_body), Paragraph("UGC authentique, communauté engagée", style_body)],
        [Paragraph("Micro", style_body), Paragraph("10k-50k", style_body), Paragraph("3000-8000 MAD", style_body), Paragraph("Visibilité ciblée, credibility", style_body)],
        [Paragraph("Midi", style_body), Paragraph("50k-200k", style_body), Paragraph("10k-25k MAD", style_body), Paragraph("Viralité, image de marque", style_body)],
        [Paragraph("Macro", style_body), Paragraph("200k+", style_body), Paragraph("30k-80k MAD", style_body), Paragraph("Campagne majeure, lancement", style_body)],
    ]
    t = Table(collab_tiers, colWidths=[80, 100, 130, 180])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Types de Collaborations", style_h3))
    collab_types = [
        "<b>Cosplay :</b> Partenariat avec cosplayeurs marocains pour porter la marque lors d'événements (Japan Expo Maroc, Comic Con)",
        "<b>Streaming :</b> Intégration dans les streams Twitch (overlay, giveaway, commandes personnalisées)",
        "<b>Artistes manga :</b> Éditions limitées dessinées par des artistes de manga marocains",
        "<b>Gaming :</b> Tournois de jeux vidéo avec lots VAPE NOCTURNE, sponsoring d'équipes e-sport",
        "<b>Streetwear :</b> Cross-promotion avec marques de streetwear marocaines, photoshoots collaboratifs",
    ]
    for c in collab_types:
        elements.append(Paragraph(f"▸ {c}", style_body_small))
    
    # ── PAGE 39: Pop-up Stores ──
    elements.append(PageBreak())
    elements.append(Paragraph("ÉVÉNEMENTS & POP-UP STORES", style_section_title))
    elements.append(Paragraph("« Neo-Tokyo Night » – Expériences physiques", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Concept des Pop-up Stores", style_h2))
    elements.append(Paragraph(
        "Les pop-up stores sont des <b>expériences immersives éphémères</b> qui transportent "
        "les visiteurs dans l'univers VAPE NOCTURNE. Ils servent à la fois de point de vente, "
        "d'activation marque et de génération de contenu viral.",
        style_body))
    elements.append(spacer(8))
    
    popup_concept = [
        "<b>Lieu :</b> Espace transformé en rue de Tokyo (néons, enseignes kanji, sol reflechissant)",
        "<b>Scénographie :</b> 5 zones : Entrée (torii néon), Produits (vitrines holographiques), Config (bornes 3D), Lounge (bar à vape), Photo (spot Instagram)",
        "<b>Animation :</b> DJ set lo-fi/hiro, cosplayers, démonstrations produits, ateliers personnalisation",
        "<b>Exclusivité :</b> Produits disponibles uniquement en pop-up, éditions limitées numérotées",
        "<b>Digital :</b> QR codes partout → site, filtres AR Instagram, check-in avec badge exclusif",
    ]
    for p in popup_concept:
        elements.append(Paragraph(f"▸ {p}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Calendrier Événementiel 2025", style_h3))
    events_cal = [
        [Paragraph("Événement", style_h3), Paragraph("Ville", style_h3), Paragraph("Période", style_h3), Paragraph("Budget", style_h3)],
        [Paragraph("Neo-Casablanca Night", style_body), Paragraph("Casablanca", style_body), Paragraph("Mars 2025", style_body), Paragraph("120 000 MAD", style_body)],
        [Paragraph("Japan Expo Maroc", style_body), Paragraph("Casablanca", style_body), Paragraph("Avril 2025", style_body), Paragraph("50 000 MAD (stand)", style_body)],
        [Paragraph("Neo-Rabat Pop-up", style_body), Paragraph("Rabat", style_body), Paragraph("Juin 2025", style_body), Paragraph("80 000 MAD", style_body)],
        [Paragraph("Marrakech Summer", style_body), Paragraph("Marrakech", style_body), Paragraph("Août 2025", style_body), Paragraph("100 000 MAD", style_body)],
        [Paragraph("Tanger Night Market", style_body), Paragraph("Tanger", style_body), Paragraph("Octobre 2025", style_body), Paragraph("70 000 MAD", style_body)],
        [Paragraph("Neo-Tokyo Finale", style_body), Paragraph("Casablanca", style_body), Paragraph("Décembre 2025", style_body), Paragraph("200 000 MAD", style_body)],
    ]
    t = Table(events_cal, colWidths=[150, 120, 100, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t)
    
    # ── PAGE 40: Guild System ──
    elements.append(PageBreak())
    elements.append(Paragraph("PROGRAMME FIDÉLITÉ — GUILD SYSTEM", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Un Programme de Fidélité Gamifié", style_h2))
    elements.append(Paragraph(
        "Le Guild System transforme chaque client en <b>membre d'une guilde</b> avec des niveaux, "
        "des quêtes, des récompenses et un classement. C'est un système de fidélisation complet "
        "inspiré des mécaniques de jeu vidéo.",
        style_body))
    elements.append(spacer(8))
    
    guild_data = [
        [Paragraph("Niveau", style_h3),Paragraph("Titre", style_h3), Paragraph("XP Requis", style_h3), Paragraph("Avantages", style_h3)],
        [Paragraph("1", style_body), Paragraph("Genin (Apprenti)", style_body), Paragraph("0 XP", style_body), Paragraph("Accès boutique, 1 badge de base", style_body)],
        [Paragraph("2", style_body), Paragraph("Chunin (Initié)", style_body), Paragraph("500 XP", style_body), Paragraph("-5% sur première commande, badge exclusif", style_body)],
        [Paragraph("3", style_body), Paragraph("Jonin (Expert)", style_body), Paragraph("2000 XP", style_body), Paragraph("-10%, accès preview drops, 2 badges", style_body)],
        [Paragraph("4", style_body), Paragraph("Sensei (Maître)", style_body), Paragraph("5000 XP", style_body), Paragraph("-15%, accès guild Discord privé, gravure offerte", style_body)],
        [Paragraph("5", style_body), Paragraph("Kage (Légende)", style_body), Paragraph("15000 XP", style_body), Paragraph("-20%, produit offert anniversaire, accès événements VIP", style_body)],
    ]
    t = Table(guild_data, colWidths=[60, 120, 100, 210])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Système de Quêtes", style_h3))
    quests = [
        "📜 « Premier souffle » → Créer un compte et faire un achat (25 XP)",
        "📜 « Collectionneur » → Acheter 3 produits différents (50 XP)",
        "📜 « Social butterfly » → Partager un achat sur TikTok/Instagram (15 XP)",
        "📜 « L'artisan » → Utiliser le configurateur 3D (20 XP)",
        "📜 « Sensei du cloud » → Atteindre 1000 bouffées cumulées (100 XP)",
        "📜 « L'influenceur » → Parrainer un ami qui achète (75 XP)",
        "📜 « Night owl » → Acheter entre minuit et 5h (30 XP)",
        "📜 « Loyal » → Achats 3 mois consécutifs (200 XP)",
    ]
    for q in quests:
        elements.append(Paragraph(f"▸ {q}", style_body_small))
    
    # ── PAGE 41: SEO & SEA ──
    elements.append(PageBreak())
    elements.append(Paragraph("SEO & SEA — VISIBILITÉ EN LIGNE", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Stratégie SEO (Organique)", style_h2))
    elements.append(Paragraph(
        "Le SEO est optimisé pour capter les recherches liées à la vape, à la chicha électronique "
        "et à la culture anime/gaming au Maroc et en Afrique du Nord.",
        style_body))
    elements.append(spacer(8))
    
    seo_strategy = [
        "<b>Mots-clés priorité 1 :</b> cigarette électronique Maroc, vape Casablanca, pod Maroc, e-liquide Maroc, chicha électrique",
        "<b>Mots-clés priorité 2 :</b> vape anime, vape gaming, custom pod néon, configurateur vape 3D, box mod personnalisable",
        "<b>Mots-clés longue traîne :</b> meilleur pod pour débutant Maroc, chicha électronique pas cher, où acheter vape en ligne Maroc",
        "<b>Blog SEO :</b> 2 articles/semaine (guides, comparatifs, lore), optimisés pour featured snippets",
        "<b>Backlinks :</b> Partenariats blogs gaming/anime marocains, forums vape, communautés Discord",
        "<b>Technique :</b> next-seo, sitemap automatique, structured data (Product, FAQ, Review), core web vitals",
    ]
    for s in seo_strategy:
        elements.append(Paragraph(f"▸ {s}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Stratégie SEA (Payant)", style_h3))
    sea_data = [
        [Paragraph("Canal", style_h3), Paragraph("Budget/mois", style_h3), Paragraph("Ciblage", style_h3)],
        [Paragraph("Google Ads", style_body), Paragraph("10 000 MAD", style_body), Paragraph("Mots-clés vape + Maroc + villes", style_body)],
        [Paragraph("TikTok Ads", style_body), Paragraph("15 000 MAD", style_body), Paragraph("18-35 ans, centres d'intérêt anime/gaming", style_body)],
        [Paragraph("Instagram Ads", style_body), Paragraph("8 000 MAD", style_body), Paragraph("Lookalike audience clients + influenceurs", style_body)],
    ]
    t = Table(sea_data, colWidths=[120, 140, 240])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t)
    
    # ── PAGE 42: Email Marketing ──
    elements.append(PageBreak())
    elements.append(Paragraph("EMAIL MARKETING & AUTOMATION", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Séquence d'Onboarding", style_h2))
    elements.append(Paragraph(
        "L'email marketing est personnalisé et stylisé dans l'univers VAPE NOCTURNE, "
        "avec des templates au design néon et un ton narratif.",
        style_body))
    elements.append(spacer(8))
    
    email_seq = [
        "<b>Email 1 (J+0) : « Bienvenue dans la guilde »</b> — Présentation de l'univers, lien vers le lore, 10% de réduction",
        "<b>Email 2 (J+1) : « Choisis ton arme »</b> — Guide des catégories (Shonen/Seinen/Chicha), quiz pour recommander",
        "<b>Email 3 (J+3) : « Personnalise ton style »</b> — Présentation du configurateur 3D, exemples de créations",
        "<b>Email 4 (J+7) : « La communauté t'attend »</b> — Lien Discord, challenges, événements à venir",
        "<b>Email 5 (J+14) : « Ta première mission »</b> — Système de quêtes, premiers pas vers le niveau 2",
    ]
    for e in email_seq:
        elements.append(Paragraph(f"▸ {e}", style_body_small))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Automatisations", style_h3))
    elements.append(Paragraph(
        "• Abandon panier : Email J+1, J+3, J+7 avec rappel visuel du produit<br/>"
        "• Anniversaire : Email avec code promo -20% + badge spécial<br/>"
        "• Level up : Notification quand le client passe au niveau supérieur<br/>"
        "• Nouveau drop : Alerte pour les membres Sensei et Kage uniquement<br/>"
        "• Réengagement : Email « La guilde a besoin de toi » après 60j d'inactivité",
        style_body))
    
    return elements


def build_financial():
    """Pages 43-47: Financial Plan"""
    elements = []
    
    # ── PAGE 43: Investissement Initial ──
    elements.append(PageBreak())
    elements.append(Paragraph("PLAN FINANCIER", style_section_title))
    elements.append(Paragraph("Investissement initial, projection 3 ans, seuil de rentabilité", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Investissement Initial Détaillé", style_h2))
    elements.append(Paragraph(
        "Le tableau ci-dessous détaille l'investissement nécessaire pour lancer VAPE NOCTURNE "
        "au Maroc, en distinguant le MVP (Minimum Viable Product) et la version complète.",
        style_body))
    elements.append(spacer(8))
    
    invest_data = [
        [Paragraph("Poste", style_h3), Paragraph("MVP (MAD)", style_h3), Paragraph("V1 Complète (MAD)", style_h3), Paragraph("Détails", style_h3)],
        [Paragraph("Développement Web", style_body), Paragraph("120 000", style_body), Paragraph("350 000", style_body), Paragraph("Next.js + Three.js + Backend", style_body)],
        [Paragraph("Design UI/UX", style_body), Paragraph("40 000", style_body), Paragraph("80 000", style_body), Paragraph("Design system, maquettes, prototypes", style_body)],
        [Paragraph("Modèles 3D", style_body), Paragraph("25 000", style_body), Paragraph("70 000", style_body), Paragraph("Produits + scène Tokyo + mascotte", style_body)],
        [Paragraph("Branding & Logo", style_body), Paragraph("15 000", style_body), Paragraph("15 000", style_body), Paragraph("Identité visuelle complète", style_body)],
        [Paragraph("Stock Initial", style_body), Paragraph("100 000", style_body), Paragraph("300 000", style_body), Paragraph("Approvisionnement marques", style_body)],
        [Paragraph("Marketing Launch", style_body), Paragraph("50 000", style_body), Paragraph("150 000", style_body), Paragraph("Campagne lancement + influenceurs", style_body)],
        [Paragraph("Événement Launch", style_body), Paragraph("30 000", style_body), Paragraph("120 000", style_body), Paragraph("Pop-up Neo-Tokyo Night", style_body)],
        [Paragraph("Frais juridiques", style_body), Paragraph("20 000", style_body), Paragraph("30 000", style_body), Paragraph("SARL, marque, contrats, conformité", style_body)],
        [Paragraph("Infrastructure", style_body), Paragraph("10 000", style_body), Paragraph("25 000", style_body), Paragraph("Hébergement, domaines, outils, licences", style_body)],
        [Paragraph("Fonds de roulement (3 mois)", style_body), Paragraph("90 000", style_body), Paragraph("180 000", style_body), Paragraph("Trésorerie fonctionnement", style_body)],
    ]
    t = Table(invest_data, colWidths=[100, 90, 110, 190])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        # Total line
        ('BACKGROUND', (0, -1), (-1, -1), DEEP_PURPLE),
    ]))
    # Add total row
    elements.append(t)
    
    # ── PAGE 44: Projection 3 Ans ──
    elements.append(PageBreak())
    elements.append(Paragraph("PROJECTION FINANCIÈRE 3 ANS", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Hypothèses de Projection", style_h2))
    elements.append(Paragraph(
        "Les projections sont basées sur les hypothèses suivantes :<br/>"
        "• Taux de croissance mensuel : 8-12% les 6 premiers mois, puis 5-8%<br/>"
        "• Panier moyen : 350 MAD (produits + accessoires)<br/>"
        "• Taux de conversion : 3.5% (moyenne e-commerce Maroc)<br/>"
        "• Marge brute : 45% (après coût des produits + import)<br/>"
        "• Saisonnalité : +40% en décembre (fêtes), -20% en juillet/août",
        style_body))
    elements.append(spacer(10))
    
    proj_data = [
        [Paragraph("Indicateur", style_h3), Paragraph("Année 1", style_h3), Paragraph("Année 2", style_h3), Paragraph("Année 3", style_h3)],
        [Paragraph("Chiffre d'affaires", style_body), Paragraph("1 200 000 MAD", style_body), Paragraph("3 500 000 MAD", style_body), Paragraph("7 000 000 MAD", style_body)],
        [Paragraph("Commandes totales", style_body), Paragraph("3 500", style_body), Paragraph("10 000", style_body), Paragraph("20 000", style_body)],
        [Paragraph("Panier moyen", style_body), Paragraph("350 MAD", style_body), Paragraph("350 MAD", style_body), Paragraph("350 MAD", style_body)],
        [Paragraph("Visiteurs uniques", style_body), Paragraph("50 000", style_body), Paragraph("150 000", style_body), Paragraph("350 000", style_body)],
        [Paragraph("Taux de conversion", style_body), Paragraph("2.5%", style_body), Paragraph("3.2%", style_body), Paragraph("3.8%", style_body)],
        [Paragraph("Marge brute", style_body), Paragraph("540 000 MAD", style_body), Paragraph("1 575 000 MAD", style_body), Paragraph("3 150 000 MAD", style_body)],
        [Paragraph("Marge brute %", style_body), Paragraph("45%", style_body), Paragraph("45%", style_body), Paragraph("45%", style_body)],
        [Paragraph("Charges opérationnelles", style_body), Paragraph("780 000 MAD", style_body), Paragraph("1 200 000 MAD", style_body), Paragraph("1 800 000 MAD", style_body)],
        [Paragraph("Résultat net", style_body), Paragraph("-240 000 MAD", style_body), Paragraph("375 000 MAD", style_body), Paragraph("1 350 000 MAD", style_body)],
    ]
    t = Table(proj_data, colWidths=[150, 120, 120, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -1), (-1, -1), DEEP_PURPLE),
    ]))
    elements.append(t)
    
    # ── PAGE 45: Seuil de Rentabilité ──
    elements.append(PageBreak())
    elements.append(Paragraph("SEUIL DE RENTABILITÉ", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Analyse du Point Mort", style_h2))
    elements.append(Paragraph(
        "Le seuil de rentabilité est atteint lorsque le chiffre d'affaires couvre l'ensemble "
        "des charges fixes et variables. Voici le calcul détaillé :",
        style_body))
    elements.append(spacer(8))
    
    elements.append(Paragraph("Calcul du Seuil de Rentabilité (MVP)", style_h3))
    elements.append(Paragraph(
        "<b>Charges fixes mensuelles :</b> 65 000 MAD<br/>"
        "• Loyer/stockage : 10 000 MAD<br/>"
        "• Salaires (2 pers.) : 30 000 MAD<br/>"
        "• Marketing : 15 000 MAD<br/>"
        "• Infrastructure : 5 000 MAD<br/>"
        "• Divers : 5 000 MAD",
        style_body))
    elements.append(spacer(5))
    
    elements.append(Paragraph(
        "<b>Marge sur coût variable :</b> 45%<br/>"
        "<b>Seuil de rentabilité mensuel :</b> 65 000 / 0.45 = <b>144 444 MAD/mois</b><br/>"
        "<b>Commandes nécessaires par mois :</b> 144 444 / 350 = <b>~413 commandes/mois</b><br/>"
        "<b>Soit ~14 commandes/jour pour être rentable</b>",
        ParagraphStyle('Calc', fontName='DejaVuSans-Bold', fontSize=12, leading=16, textColor=CYAN_ELECTRIC, alignment=TA_LEFT, spaceBefore=5, spaceAfter=5)))
    elements.append(spacer(10))
    
    elements.append(Paragraph("Projection d'Atteinte du Seuil", style_h3))
    elements.append(Paragraph(
        "• Mois 1-3 : Lancement, objectif 100 commandes/mois<br/>"
        "• Mois 4-6 : Croissance, objectif 250 commandes/mois<br/>"
        "• Mois 7-9 : Consolidation, objectif 400 commandes/mois → <b>Seuil atteint au mois 8</b><br/>"
        "• Mois 10-12 : Rentabilité, objectif 500+ commandes/mois<br/>"
        "• Année 2 : Scaling, objectif 800+ commandes/mois",
        style_body))
    
    # ── PAGE 46: Budget Détaillé ──
    elements.append(PageBreak())
    elements.append(Paragraph("BUDGET OPÉRATIONNEL DÉTAILLÉ", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Répartition des Charges Mensuelles", style_h2))
    elements.append(spacer(5))
    
    monthly_data = [
        [Paragraph("Catégorie", style_h3), Paragraph("Coût (MAD)", style_h3), Paragraph("% CA", style_h3), Paragraph("Notes", style_h3)],
        [Paragraph("Achats produits", style_body), Paragraph("192 500", style_body), Paragraph("55%", style_body), Paragraph("Coût des marchandises + import + taxes douane 40%", style_body)],
        [Paragraph("Marketing", style_body), Paragraph("35 000", style_body), Paragraph("10%", style_body), Paragraph("Ads, influenceurs, contenu, événements", style_body)],
        [Paragraph("Personnel", style_body), Paragraph("50 000", style_body), Paragraph("14%", style_body), Paragraph("2 CDI + freelances + Community Manager", style_body)],
        [Paragraph("Tech & Infra", style_body), Paragraph("12 000", style_body), Paragraph("3.5%", style_body), Paragraph("Vercel, Stripe fees, outils SaaS, domaine", style_body)],
        [Paragraph("Logistique", style_body), Paragraph("22 000", style_body), Paragraph("6%", style_body), Paragraph("Livraison, entrepôt, emballages personnalisés", style_body)],
        [Paragraph("Frais généraux", style_body), Paragraph("10 000", style_body), Paragraph("3%", style_body), Paragraph("Comptabilité, juridique, télécom, fournitures", style_body)],
        [Paragraph("Prévision imprévus", style_body), Paragraph("8 500", style_body), Paragraph("2.5%", style_body), Paragraph("Fonds de sécurité", style_body)],
        [Paragraph("Total", style_body), Paragraph("330 000", style_body), Paragraph("~94%", style_body), Paragraph("Marge nette ~6% (= 20 000 MAD/mois)", style_body)],
    ]
    t = Table(monthly_data, colWidths=[100, 100, 70, 220])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -1), (-1, -1), DEEP_PURPLE),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Scénario Optimiste vs Pessimiste", style_h3))
    elements.append(Paragraph(
        "<b>Optimiste (+20%) :</b> CA mensuel 420 000 MAD → Résultat net 90 000 MAD/mois<br/>"
        "<b>Réaliste (base) :</b> CA mensuel 350 000 MAD → Résultat net 20 000 MAD/mois<br/>"
        "<b>Pessimiste (-20%) :</b> CA mensuel 280 000 MAD → Perte 50 000 MAD/mois → Ajustement nécessaire",
        style_body))
    
    # ── PAGE 47: ROI Analysis ──
    elements.append(PageBreak())
    elements.append(Paragraph("ANALYSE DU RETOUR SUR INVESTISSEMENT", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("ROI Projeté sur 3 Ans", style_h2))
    elements.append(Paragraph(
        "Le retour sur investissement est calculé sur la base de l'investissement initial "
        "total (MVP) de <b>500 000 MAD</b> et des projections financières détaillées.",
        style_body))
    elements.append(spacer(8))
    
    roi_data = [
        [Paragraph("Indicateur", style_h3), Paragraph("Valeur", style_h3)],
        [Paragraph("Investissement initial (MVP)", style_body), Paragraph("500 000 MAD", style_body)],
        [Paragraph("Investissement total (V1 complète)", style_body), Paragraph("1 320 000 MAD", style_body)],
        [Paragraph("CA Année 1", style_body), Paragraph("1 200 000 MAD", style_body)],
        [Paragraph("CA Année 2", style_body), Paragraph("3 500 000 MAD", style_body)],
        [Paragraph("CA Année 3", style_body), Paragraph("7 000 000 MAD", style_body)],
        [Paragraph("Résultat net cumulé (3 ans)", style_body), Paragraph("1 485 000 MAD", style_body)],
        [Paragraph("ROI sur 3 ans", style_body), Paragraph("<b>297%</b>", style_body)],
        [Paragraph("Délai récupération investissement", style_body), Paragraph("<b>18-24 mois</b>", style_body)],
        [Paragraph("Valeur entreprise estimée (An 3)", style_body), Paragraph("7 000 000 - 10 000 000 MAD", style_body)],
    ]
    t = Table(roi_data, colWidths=[250, 230])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t)
    elements.append(spacer(15))
    
    elements.append(Paragraph("Sources de Financement Envisagées", style_h3))
    elements.append(Paragraph(
        "• Apport personnel : 150 000 MAD (30%)<br/>"
        "• Love money (famille/amis) : 100 000 MAD (20%)<br/>"
        "• Prêt bancaire (Crédit Jeune Entreprise) : 150 000 MAD (30%)<br/>"
        "• Subvention (OCP, Moussanada, Injaz) : 50 000 MAD (10%)<br/>"
        "• Crowdfunding / Pré-ventes : 50 000 MAD (10%)",
        style_body))
    
    return elements


def build_conclusion():
    """Pages 48-50: Conclusion"""
    elements = []
    
    # ── PAGE 48: Roadmap ──
    elements.append(PageBreak())
    elements.append(Paragraph("CONCLUSION & NEXT STEPS", style_section_title))
    elements.append(Paragraph("Roadmap de développement et lancement", style_section_sub))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Roadmap de Déploiement", style_h2))
    elements.append(spacer(5))
    
    roadmap_data = [
        [Paragraph("Phase", style_h3),Paragraph("Période", style_h3), Paragraph("Livrables", style_h3), Paragraph("Budget", style_h3)],
        [Paragraph("Phase 0: Prépa", style_body), Paragraph("Mois 1-2", style_body), Paragraph("Branding, maquettes, étude marché, legal, fournisseurs", style_body), Paragraph("70 000 MAD", style_body)],
        [Paragraph("Phase 1: MVP", style_body), Paragraph("Mois 3-5", style_body), Paragraph("Site SPA (Hero + Produits + Panier simple), Stripe, premier stock", style_body), Paragraph("200 000 MAD", style_body)],
        [Paragraph("Phase 2: Launch", style_body), Paragraph("Mois 6", style_body), Paragraph("Campagne marketing, pop-up Casablanca, communauté Discord", style_body), Paragraph("80 000 MAD", style_body)],
        [Paragraph("Phase 3: Immersion", style_body), Paragraph("Mois 7-9", style_body), Paragraph("Scène 3D complète, configurateur, mascotte, lore section", style_body), Paragraph("150 000 MAD", style_body)],
        [Paragraph("Phase 4: Guild", style_body), Paragraph("Mois 10-12", style_body), Paragraph("Système guildes, quêtes, badges, profil utilisateur complet", style_body), Paragraph("80 000 MAD", style_body)],
        [Paragraph("Phase 5: Scale", style_body), Paragraph("An 2", style_body), Paragraph("Marque propre, pop-ups nationaux, ligne vêtements, application mobile", style_body), Paragraph("300 000 MAD", style_body)],
    ]
    t = Table(roadmap_data, colWidths=[100, 80, 210, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    
    # ── PAGE 49: Équipe ──
    elements.append(PageBreak())
    elements.append(Paragraph("ÉQUIPE & RECRUTEMENT", style_section_title))
    elements.append(neon_line())
    elements.append(spacer(8))
    
    elements.append(Paragraph("Équipe Nécessaire", style_h2))
    elements.append(Paragraph(
        "L'équipe idéale pour lancer VAPE NOCTURNE combine des profils techniques créatifs "
        "et des talents marketing orientés communauté.",
        style_body))
    elements.append(spacer(8))
    
    team_data = [
        [Paragraph("Poste", style_h3), Paragraph("Type", style_h3), Paragraph("Budget (MAD/mois)", style_h3), Paragraph("Compétences clés", style_h3)],
        [Paragraph("Lead Dev Frontend", style_body), Paragraph("Freelance/CTO", style_body), Paragraph("15 000 - 20 000", style_body), Paragraph("Next.js, Three.js, React Three Fiber, WebGL", style_body)],
        [Paragraph("Dev Backend", style_body), Paragraph("Freelance", style_body), Paragraph("10 000 - 15 000", style_body), Paragraph("Node.js, tRPC, Prisma, PostgreSQL, Stripe", style_body)],
        [Paragraph("UI/UX Designer", style_body), Paragraph("Freelance", style_body), Paragraph("10 000 - 15 000", style_body), Paragraph("Design system, animations, maquettes Figma", style_body)],
        [Paragraph("Artiste 3D", style_body), Paragraph("Freelance", style_body), Paragraph("8 000 - 12 000", style_body), Paragraph("Blender, modélisation, animation, textures", style_body)],
        [Paragraph("Community Manager", style_body), Paragraph("CDI temps plein", style_body), Paragraph("6 000 - 8 000", style_body), Paragraph("TikTok, Discord, Instagram, contenu viral", style_body)],
        [Paragraph("Chef produit/fondateur", style_body), Paragraph("CDI temps plein", style_body), Paragraph("15 000 - 20 000", style_body), Paragraph("Vision, gestion, finance, réseau", style_body)],
    ]
    t = Table(team_data, colWidths=[120, 100, 130, 140])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DEEP_PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), SOFT_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, CYAN_ELECTRIC),
        ('BACKGROUND', (0, 1), (-1, -1), DARK_PURPLE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK_PURPLE, HexColor('#250A4D')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(spacer(10))
    
    elements.append(Paragraph("Où Recruter", style_h3))
    elements.append(Paragraph(
        "• <b>Freelances :</b> Malt.ma, Upwork, Fiverr — privilégier les freelances marocains<br/>"
        "• <b>CDI :</b> Rekrute.ma, Maroc Annuaire, LinkedIn Maroc<br/>"
        "• <b>Stage/Alternance :</b> Écoles d'ingénieurs (INPT, ENSIAS, FSTM), écoles d'art (ESBAC, ISAD)<br/>"
        "• <b>Communauté :</b> Discord dev Maroc, Meetup Casablanca Digital, GitHub",
        style_body))
    
    # ── PAGE 50: Contact & Back Cover ──
    elements.append(PageBreak())
    elements.append(Spacer(1, 60*mm))
    elements.append(Paragraph("CONTACT & PROCHAINES ÉTAPES", style_section_title))
    elements.append(neon_line(width=60, color=NEON_PINK, thickness=2))
    elements.append(spacer(20))
    
    elements.append(Paragraph("Prêt à donner vie à VAPE NOCTURNE ?", style_cover_sub))
    elements.append(spacer(20))
    
    contact_items = [
        "📧 Email : contact@vapenocturne.ma",
        "🌐 Site : www.vapenocturne.ma",
        "📱 Instagram : @vapenocturne",
        "🎵 TikTok : @vapenocturne",
        "💬 Discord : discord.gg/vapenocturne",
        "📍 Siège : Casablanca, Maroc",
    ]
    for c in contact_items:
        elements.append(Paragraph(c, ParagraphStyle('Contact', fontName='DejaVuSans', fontSize=14, leading=20, textColor=CYAN_ELECTRIC, alignment=TA_CENTER, spaceBefore=4, spaceAfter=4)))
    elements.append(spacer(20))
    
    elements.append(neon_line(width=40, color=CYAN_ELECTRIC, thickness=1))
    elements.append(spacer(15))
    
    elements.append(Paragraph(
        "「 La fumée des ténèbres éclaire ta voie 」",
        ParagraphStyle('FinalQuote', fontName='DejaVuSerif', fontSize=16, leading=22, textColor=GOLD, alignment=TA_CENTER, spaceBefore=10, spaceAfter=10)))
    elements.append(spacer(20))
    
    elements.append(Paragraph(
        "Document généré le " + datetime.now().strftime('%d/%m/%Y à %H:%M') + "<br/>"
        "Version 1.0 — Confidentiel — Tous droits réservés",
        style_cover_sub2))
    elements.append(spacer(10))
    
    # Closing
    elements.append(Paragraph(
        "01000110 01001001 01001110 00100000 00111010 00101001",
        ParagraphStyle('Binary', fontName='DejaVuMono', fontSize=8, leading=10, textColor=DEEP_PURPLE, alignment=TA_CENTER)))
    
    return elements


# ─────────────────────────────────────────────────────────
# MAIN — GÉNÉRATION DU PDF
# ─────────────────────────────────────────────────────────

def generate_pdf(output_path):
    """Generate the complete 50-page PDF"""
    
    W, H = A4
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=35*mm,
        rightMargin=35*mm,
        topMargin=30*mm,
        bottomMargin=30*mm,
        title="VAPE NOCTURNE — Projet E-commerce Maroc",
        author="VAPE NOCTURNE Team",
        subject="Projet e-commerce vape & chicha électronique - Style anime/néon"
    )
    
    # Build all sections
    all_elements = []
    
    # Section groups (each group starts with its own template)
    sections = [
        ("cover", build_cover),
        ("market", build_market_analysis),
        ("architecture", build_architecture),
        ("design", build_design_system),
        ("tech", build_tech_stack),
        ("marketing", build_marketing),
        ("financial", build_financial),
        ("conclusion", build_conclusion),
    ]
    
    page_count = 0
    for name, builder in sections:
        elements = builder()
        all_elements.extend(elements)
        # Count pages by counting PageBreaks + 1
        page_count += sum(1 for e in elements if isinstance(e, PageBreak)) + 1
    
    # Build with page templates
    def on_first_page(canvas, doc):
        cover_page_template(canvas, doc)
        # Title on cover
        canvas.saveState()
        canvas.restoreState()
    
    def on_later_pages(canvas, doc):
        page_header_footer(canvas, doc)
    
    doc.build(all_elements, onFirstPage=on_first_page, onLaterPages=page_header_footer)
    
    return output_path


if __name__ == '__main__':
    os.makedirs('/home/user/mourad-ghazi', exist_ok=True)
    output = '/home/user/mourad-ghazi/VAPE_NOCTURNE_Projet_50pages.pdf'
    print(f"⚡ Génération du PDF en cours...")
    generate_pdf(output)
    import os
    size = os.path.getsize(output)
    print(f"✅ PDF généré avec succès !")
    print(f"📄 Fichier : {output}")
    print(f"📏 Taille : {size/1024:.1f} Ko")
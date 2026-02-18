# Vacuum-Karte für Home Assistant (Dreame)

**Eine einzelne Lovelace-Karte** mit Map, **Dark-/Hell-Modus**, **Raum-Dropdown**, **Status** (Saugkraft, Batterie, Fläche, Zeit, Modus, aktueller Raum) und **Steuerung** (Nur Saugen, Saugen & Wischen, Nur Wischen, Start, Stopp). Keine View nötig – alles in einer Karte.

## Voraussetzungen

- **Home Assistant** mit Dreame Vacuum Integration (Tasshack) – Saugroboter bereits integriert
- **Xiaomi Vacuum Map Card** (PiotrMachowski) über HACS installiert – für die **interaktive Map** in der Karte (optional; ohne sie wird die Map-Kamera als Bild angezeigt)

## Enthaltene Dateien

| Datei | Beschreibung |
|-------|--------------|
| `Cursor-Saugroboter.js` | **Eine Karte**: Map, Dark/Hell, Raum-Dropdown, Status, Steuerung – mit visuellem Editor |
| `vacuum-karte.yaml` | Alternative: Lovelace-View (falls du lieber eine ganze View nutzen willst) |
| `home-assistant-config-snippets.yaml` | Hilfs-Entities: `input_select` (Raum), Script „Raum starten“ – für Raum-Dropdown |
| `themes-vacuum-map.yaml` | Optionale Theme-Variablen |
| `hacs.json` | HACS-Manifest |
| `README.md` | Diese Anleitung |

## Eine Karte – Konfiguration

Die **Cursor Saugroboter-Karte** ist **eine einzelne Karte** (keine View). Du fügst sie einmal hinzu und konfigurierst alle Entity-IDs im visuellen Editor.

### Visueller Editor

1. **Karte hinzufügen** → „Cursor Saugroboter“ wählen.
2. Karte öffnen → **⋮** → **Konfigurieren** → **Visuellen Editor anzeigen**.
3. Im Editor eintragen:
   - **Titel der Karte** (z. B. „Saugroboter“)
   - **Vacuum-Entity (Pflicht)** und **Map-Kamera (Pflicht)** – **Entity-Suche**: Einfach tippen, die Liste filtert bei jedem Buchstaben (Vacuum: `vacuum.…`, Kamera: `camera.…`, Raum: `input_select.…`, Script: `script.…`). Entität aus der Liste wählen.
   - **Raum-Dropdown** und **Script „Raum starten“** (optional) – ebenfalls per Suche auswählbar.
   - **Karten-Hintergrund (Standard)** – Dark oder Hell
4. **Speichern**.

### YAML-Konfiguration

```yaml
type: custom:cursor-saugroboter-card
title: Saugroboter
vacuum_entity: vacuum.dreame_vacuum_r2449k
map_camera: camera.dreame_vacuum_r2449k_map
room_select_entity: input_select.saugroboter_raum
room_script_entity: script.saugroboter_raum_reinigen
default_theme: Dark
```

- **`vacuum_entity`** (Pflicht): Entity-ID des Saugroboters.
- **`map_camera`** (Pflicht): Entity-ID der Map-Kamera (Current Map).
- **`room_select_entity`** (optional): Dropdown für Raumauswahl.
- **`room_script_entity`** (optional): Script zum Starten der Raumreinigung.
- **`default_theme`** (optional): `Dark` oder `Hell` – Standard für den Karten-Hintergrund (umschaltbar auf der Karte).

### Inhalt der Karte

- **Karten-Hintergrund** – Dropdown Dark/Hell (direkt auf der Karte).
- **Raum-Dropdown** und Button **„Raum starten“** (wenn konfiguriert).
- **Status** – Batterie, Saugkraft, Fläche, Zeit, Modus, aktueller Raum.
- **Buttons** – Nur Saugen, Saugen & Wischen, Nur Wischen, Start, Stopp.
- **Map** – interaktiv (wenn Xiaomi Vacuum Map Card installiert), sonst Kamerabild.

## HACS-Repository hinzufügen

1. **HACS** → **Frontend** → **⋮** → **Benutzerdefinierte Repositories**
2. **Repository:** `https://github.com/huedde/Cursor-Saugroboter` (oder dein Fork)
3. **Typ:** **Dashboard** oder **Plugin**
4. **Hinzufügen** → „Cursor Saugroboter“ installieren.

Danach **eine Karte** zum Dashboard hinzufügen („Cursor Saugroboter“) und Vacuum-Entity sowie Map-Kamera im Editor eintragen.

## Einrichtung (Schritte)

### 1. Entity-IDs ermitteln

Unter **Einstellungen → Geräte & Dienste → Dreame Vacuum** dein Gerät öffnen. Dort findest du:

- **Vacuum:** `vacuum.xxx`
- **Map (Current Map):** `camera.xxx_map`

Diese beiden trägst du in der **Cursor Saugroboter-Karte** unter **Vacuum-Entity** und **Map-Kamera** ein (visueller Editor oder YAML).

### 2. Raum-Dropdown (optional)

Wenn du die **Raumauswahl** auf der Karte nutzen willst:

- **input_select** für Räume anlegen (z. B. `input_select.saugroboter_raum`) mit Optionen wie „Ganzer Boden“, „B1.12“, „B1.13“ usw.
- **Script** „Raum starten“ anlegen (z. B. `script.saugroboter_raum_reinigen`) – siehe `home-assistant-config-snippets.yaml`. Darin die Vacuum-Entity und die Segment-IDs für die Räume eintragen.
- In der Karte **Raum-Dropdown** und **Script „Raum starten“** eintragen.

Segment-IDs: Entwicklerwerkzeuge → Status → deine `vacuum.xxx` → Attribute „rooms“ ansehen.

### 3. Xiaomi Vacuum Map Card (optional)

Für die **interaktive Map** in der Karte die **Xiaomi Vacuum Map Card** über HACS installieren. Ohne sie wird die Map-Kamera als Bild angezeigt.

## Alternative: Lovelace-View

Statt der einen Karte kannst du weiterhin die **View** aus `vacuum-karte.yaml` nutzen (Dashboard → Ansicht hinzufügen → YAML von `vacuum-karte.yaml` einfügen und Entity-IDs ersetzen). Die eine Karte ersetzt diese View aber vollständig.

## Mehrere Saugroboter

Für jeden weiteren Roboter eine **eigene Cursor-Saugroboter-Karte** hinzufügen und darin die passende Vacuum-Entity und Map-Kamera eintragen.

## Hinweise

- Die Modi „Sweeping“, „Mopping“, „Sweeping and mopping“ können je nach Gerät abweichen. Optionen in Entwicklerwerkzeuge → Status der `select.xxx_cleaning_mode` prüfen.

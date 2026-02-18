# Vacuum-Karte für Home Assistant (Dreame)

Verbesserte Vacuum-Karte mit **Dark-/Hell-Modus** für den Kartenhintergrund, **Raumauswahl per Dropdown**, reduzierten Funktionen (nur Saugen, Wischen, Saugen & Wischen) und **aktuellen Status** (Saugkraft, Batterie, Fläche, Reinigungszeit usw.). Nutzt die **Current Map** der Dreame-Integration mit angepasster Optik.

## Voraussetzungen

- **Home Assistant** mit Dreame Vacuum Integration (Tasshack) – Saugroboter bereits integriert
- **Xiaomi Vacuum Map Card** (PiotrMachowski) über HACS installiert  
  - HACS → Frontend → „Xiaomi Vacuum Map Card“ suchen und installieren
- **card-mod** (optional, für Dark/Hell-Styling der Karte) über HACS
- **Conditional Card** (in HA Core enthalten)

## Enthaltene Dateien

| Datei | Beschreibung |
|-------|--------------|
| `vacuum-karte.yaml` | Lovelace-View: Karte, Status, Raum-Dropdown, Modi (Saugen/Wischen), Dark/Hell-Karte |
| `home-assistant-config-snippets.yaml` | Hilfs-Entities: `input_select` (Raum, Karten-Modus) und Script „Raum starten“ |
| `themes-vacuum-map.yaml` | Optionale Theme-Variablen für Map-Card (Dark/Hell) |
| `Cursor-Saugroboter.js` | Lovelace-Info-Karte mit visuellem Editor (für HACS-konforme Repo-Struktur) |
| `hacs.json` | HACS-Manifest für dieses Repository |
| `README.md` | Diese Anleitung |

## Konfiguration der Cursor-Saugroboter-Karte (Info-Karte)

Die **Cursor Saugroboter-Karte** ist eine kleine Info-Karte, die nach der HACS-Installation angezeigt werden kann. Sie unterstützt den **visuellen Editor** und **YAML**.

### Visueller Editor

1. Karte zum Dashboard hinzufügen („Karte hinzufügen“ → „Cursor Saugroboter“).
2. Auf die Karte klicken → **⋮** → **Konfigurieren**.
3. Oben rechts **„Visuellen Editor anzeigen“** wählen (falls noch YAML angezeigt wird).
4. Im visuellen Editor kannst du:
   - **Titel der Karte** – Überschrift der Karte (z. B. „Saugroboter – Hinweis“).
   - **View-Pfad** – Pfad der Vacuum-View im Dashboard (z. B. `saugroboter`, wie in `vacuum-karte.yaml` unter `path: saugroboter`).
   - **Button „Zur Vacuum-Karte“ anzeigen** – Checkbox: Soll auf der Karte ein Button angezeigt werden, der direkt zur Vacuum-View führt?
   - **Button-Text** – Text des Buttons (z. B. „Zur Vacuum-Karte öffnen“).
5. **Speichern** klicken.

### YAML-Konfiguration

Falls du die Karte per YAML bearbeitest:

```yaml
type: custom:cursor-saugroboter-card
title: Cursor Saugroboter          # optional, Standard: "Cursor Saugroboter"
view_path: saugroboter             # optional, Pfad der Vacuum-View (path in vacuum-karte.yaml)
show_view_button: true             # optional, Button anzeigen (Standard: true)
button_text: Zur Vacuum-Karte öffnen  # optional, Button-Beschriftung
```

- **`title`** (optional): Überschrift der Karte.
- **`view_path`** (optional): Pfad der Vacuum-View im Dashboard. Wenn gesetzt und Button aktiv, erscheint ein Link-Button zur View (z. B. `/lovelace/saugroboter`).
- **`show_view_button`** (optional): `true`/`false` – Button „Zur Vacuum-Karte“ anzeigen oder ausblenden.
- **`button_text`** (optional): Beschriftung des Buttons.

### Hinweis zum visuellen Editor

Die Karte implementiert **getConfigElement()** und **getStubConfig()**. Dadurch zeigt Lovelace den visuellen Editor mit dem Feld „Titel der Karte“ und dem Hinweistext an, statt „Visueller Editor wird nicht unterstützt“. Die eigentliche Vacuum-Steuerung (Map, Dark/Hell, Raum-Dropdown, Status) bleibt die **View** aus `vacuum-karte.yaml`.

## HACS-Repository hinzufügen

Wenn du dieses Repository in HACS als **benutzerdefiniertes Repository** einbinden willst:

1. **HACS** → **Frontend** → **⋮** → **Benutzerdefinierte Repositories**
2. **Repository:** `https://github.com/huedde/Cursor-Saugroboter` (oder dein Fork)
3. **Typ:** **Dashboard** (oder **Plugin**) auswählen – HACS erwartet ein Plugin/Dashboard mit einer `.js`-Datei; diese ist vorhanden.
4. **Hinzufügen** klicken.

Nach dem Hinzufügen kannst du „Cursor Saugroboter“ installieren. Die eigentliche Vacuum-Karte ist die **YAML-View** (`vacuum-karte.yaml`) – diese View musst du wie unter „Einrichtung“ beschrieben manuell in dein Dashboard übernehmen und die Entity-IDs anpassen.

## Einrichtung (Schritte)

### 1. Entity-IDs ermitteln

Unter **Einstellungen → Geräte & Dienste → Dreame Vacuum** dein Gerät (z. B. „Saugfried“) öffnen. Dort findest du u. a.:

- **Vacuum:** `vacuum.xxx` (z. B. `vacuum.dreame_vacuum_r2449k`)
- **Map (Current Map):** `camera.xxx_map` (z. B. `camera.dreame_vacuum_r2449k_map`)
- **Name-Teil:** Der Teil zwischen `vacuum.` und dem Ende (z. B. `dreame_vacuum_r2449k`) wird für Sensoren/Selects genutzt: `sensor.xxx_battery_level`, `select.xxx_suction_level`, `select.xxx_cleaning_mode` usw.

Notiere dir: `vacuum.xxx`, `camera.xxx_map`, `xxx` (Name).

### 2. Hilfs-Entities anlegen

- **Karten-Hintergrund (Dark/Hell)**  
  Hilfsmittel → Hilfsmittel erstellen → Dropdown  
  - Name: z. B. „Karten-Hintergrund“  
  - Optionen: `Dark`, `Hell`  
  - Entity-ID: `input_select.vacuum_map_theme`

- **Raum zum Reinigen**  
  Ein weiteres Dropdown:  
  - Name: z. B. „Raum zum Reinigen“  
  - Optionen: z. B. `Ganzer Boden`, `B1.12`, `B1.13`, … (deine Raumnamen; Segment-IDs siehe unten)  
  - Entity-ID: `input_select.saugroboter_raum`

**Segment-IDs für Räume:**  
Entwicklerwerkzeuge → Status → deine `vacuum.xxx` auswählen → Attribute „rooms“ ansehen. Dort siehst du pro Raum die ID (Segment-ID) und den Namen. Die Optionen im Dropdown sollten zu diesen Raumnamen passen; im Script musst du ggf. Raumnamen auf Segment-IDs mappen (siehe `home-assistant-config-snippets.yaml`).

- **Script „Raum starten“**  
  In `home-assistant-config-snippets.yaml` ist ein Script `script.saugroboter_raum_reinigen` vorgegeben. Dieses in deine `configuration.yaml` unter `script:` übernehmen und **alle** `vacuum.dreame_vacuum_r2449k` durch deine echte `vacuum.xxx` Entity-ID ersetzen. Für jeden Raum in `input_select.saugroboter_raum` eine passende `choose`-Option mit der richtigen `segments: [id]` ergänzen. Anschließend Home Assistant neu starten oder „Konfiguration prüfen“ und neu laden.

### 3. Lovelace-View einbinden

- **Neue View (empfohlen):**  
  Dashboard → ⋮ → Konfigurieren → Ansichten → „Ansicht hinzufügen“.  
  In der neuen View auf „⋮“ → „YAML bearbeiten“ und den **kompletten Inhalt** von `vacuum-karte.yaml` einfügen.

- **Entity-IDs ersetzen:**  
  In der eingefügten View **alle** Vorkommen von  
  - `vacuum.dreame_vacuum_r2449k` → deine `vacuum.xxx`  
  - `camera.dreame_vacuum_r2449k_map` → deine `camera.xxx_map`  
  - `dreame_vacuum_r2449k` (in sensor/select-Entities) → dein `xxx` (Name ohne `vacuum.`)  
  ersetzen. Speichern.

### 4. Xiaomi Vacuum Map Card – Räume (optional)

In der Vacuum Map Card gibt es eine Option **„Generate rooms config“**. Damit kannst du die Räume der Karte generieren und bei Bedarf Zonen/ Räume direkt auf der Karte nutzen. Das Dropdown in dieser View startet die Reinigung unabhängig davon über das Script.

### 5. Theme (optional)

Wenn du die Karten-Optik global über ein Theme steuern willst, kannst du die Variablen aus `themes-vacuum-map.yaml` in dein bestehendes Theme oder ein neues Theme übernehmen. Die View nutzt aber bereits **conditional** zwei Karten (Dark / Hell) mit festem Styling; der Nutzer wählt über `input_select.vacuum_map_theme` zwischen „Dark“ und „Hell“.

## Funktionen der Karte

- **Karten-Hintergrund:** Auswahl „Dark“ oder „Hell“ über das Dropdown „Karten-Hintergrund“; die angezeigte Karte wechselt entsprechend (conditional cards).
- **Raumauswahl:** Dropdown „Raum zum Reinigen“ → „Raum starten“ startet entweder die ganze Wohnung („Ganzer Boden“) oder die Segment-Reinigung für den gewählten Raum.
- **Modi:** Buttons „Nur Saugen“, „Saugen & Wischen“, „Nur Wischen“ setzen den Reinigungsmodus; „Start“/„Stopp“ starten bzw. stoppen den Saugroboter.
- **Status:** Batterie, Saugkraft, gereinigte Fläche, Reinigungszeit, Reinigungsmodus, aktueller Raum werden angezeigt.
- **Map:** Es wird die **Current Map** der Dreame-Integration verwendet (`camera.xxx_map`), mit angepasster Optik (Dark/Hell) und reduzierten Tiles/Icons.

## Mehrere Saugroboter

Für jeden weiteren Roboter eine **eigene View** anlegen (Kopie von `vacuum-karte.yaml`) und darin die Entity-IDs durch die des jeweiligen Roboters ersetzen. Optional für jeden Roboter ein eigenes `input_select` für Raum und ein eigenes Script mit der passenden `vacuum.xxx` Entity-ID anlegen.

## Hinweise

- Die Optionen von `select.xxx_cleaning_mode` können je nach Gerät leicht abweichen (z. B. „Sweeping“, „Mopping“, „Sweeping and mopping“). Falls eine Option nicht funktioniert, in Entwicklerwerkzeuge → Status die möglichen Optionen der Entity prüfen und die Buttons in der View anpassen.
- **card-mod** wird nur für das Styling der Map-Karte genutzt. Wenn card-mod nicht installiert ist, werden die Karten trotzdem angezeigt, aber ohne die angepassten Farben (Standard-Look der Xiaomi Vacuum Map Card).

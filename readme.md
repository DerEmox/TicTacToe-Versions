
# TicTacToe Versions

Ein Projekt mit mehreren TicTacToe-Versionen.

## Features

- TicTacToe => normale Version
- TicTacToe Advanced => normale Version, aber mit einer Option für einen Bot sowie einer für die Auswahl des Startspielers
- TicTacToe Ultimate => 9x9 TicTacToe mit 9 kleineren TicTacToe-Feldern
- (TicTacToe Ultimate Online => TicTacToe Ultimate auf zwei Geräten /!\ Benötigt zusätzliche Installation von _Firebase by Google_, welches hier nicht erklärt wird.)

## Installation

Projekt klonen
```bash
git clone https://github.com/DerEmox/tictactoe-versions.git
```

Zum Projektverzeichnis navigieren
```bash
cd TicTacToe-Versions
```

Abhängigkeiten installieren (Node.js v23)
```bash
npm install
```

Website starten
```bash
npm run dev
```

# Benutzung:
## TicTacToe

Normale TicTacToe-Version:

![TicTacToe basic](https://files.catbox.moe/9efcme.png)

## TicTacToe Advanced

Einstellungen hier öffnen:

![TicTacToe Advanced Settings Button](https://files.catbox.moe/wse7ew.png)

Einstellungen erscheinen dann:

![TicTacToe Advanced Settings](https://files.catbox.moe/3r10ah.png)

Gegen den Bot kann man nur *unentschieden* oder *verloren* spielen.

## TicTacToe Ultimate

Das Spielfeld besteht aus neun kleineren:

![TicTacToe Ultimate](https://files.catbox.moe/f537a3.png)

Zu Beginn darf der erste Spieler überall setzen.  
Danach darf immer nur in das entsprechende große Feld gesetzt werden, welches dem vorherigen Spielzug entspricht (markiert durch gelbe Umrandung).

Beispiel:

![TicTacToe Ultimate](https://files.catbox.moe/1wcz9g.png)

Spieler "X" hat in dem TicTacToe-Feld in der Mitte __links oben__ gesetzt, "O" muss jetzt in dem TicTacToe-Feld __links oben__ setzen und so weiter.  
Ist das TicTacToe-Feld bereits entschieden, darf überall gesetzt werden:

![TicTacToe Ultimate](https://files.catbox.moe/xa7d3t.png)

Hier hat "O" zuletzt im TicTacToe-Feld _oben mitte_ im Feld _oben links_ gesetzt, da das TicTacToe-Feld _oben links_ bereits belegt ist, darf "X" überall setzen.

---

by  
![Logo](https://files.catbox.moe/bv8l06.png)

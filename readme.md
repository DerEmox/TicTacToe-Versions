
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

![TicTacToe basic](https://cdn.discordapp.com/attachments/1296159076954411068/1383907307892773026/Screenshot_2025-06-15_222917.png?ex=68507f9d&is=684f2e1d&hm=378182bda031b04b34a33c620e3ed425c636cd451b62117ae89c7819fff94928&)

## TicTacToe Advanced

Einstellungen hier öffnen:

![TicTacToe Advanced Settings Button](https://cdn.discordapp.com/attachments/1296159076954411068/1383907826065477855/image.png?ex=68508019&is=684f2e99&hm=a8d73db3a5c5dfd66c62d6fc128f012d6663e275ed8b1e56fcbff5def83a4613&)

Einstellungen erscheinen dann:

![TicTacToe Advanced Settings](https://cdn.discordapp.com/attachments/1296159076954411068/1383908211018563694/image.png?ex=68508075&is=684f2ef5&hm=634c14c07c4722e77da582e184cdeec106cd1fb88392e72e0c93e66d65571abf&)

Gegen den Bot kann man nur *unentschieden* oder *verloren* spielen.

## TicTacToe Ultimate

Das Spielfeld besteht aus neun kleineren:

![TicTacToe Ultimate](https://cdn.discordapp.com/attachments/1296159076954411068/1383908644541698168/image.png?ex=685080dc&is=684f2f5c&hm=c16c8cacd629fcd7283b7ecbe7ac22bb697fb4f2afa248f2f4b6fe9a88c7a655&)

Zu Beginn darf der erste Spieler überall setzen.  
Danach darf immer nur in das entsprechende große Feld gesetzt werden, welches dem vorherigen Spielzug entspricht (markiert durch gelbe Umrandung).

Beispiel:

![TicTacToe Ultimate](https://cdn.discordapp.com/attachments/1296159076954411068/1383909355769954375/image.png?ex=68508186&is=684f3006&hm=151c314f60980aa8888ef4b40829747a8f84c02cde3508f77b88b36216dc0459&)

Spieler "X" hat in dem TicTacToe-Feld in der Mitte __links oben__ gesetzt, "O" muss jetzt in dem TicTacToe-Feld __links oben__ setzen und so weiter.  
Ist das TicTacToe-Feld bereits entschieden, darf überall gesetzt werden:

![TicTacToe Ultimate](https://cdn.discordapp.com/attachments/1296159076954411068/1383910929271619685/image.png?ex=685082fd&is=684f317d&hm=8f24f15f71c6b61eed279174e5fff7b7016362ffc2a02fab01ab4cad3f60cced&)

Hier hat "O" zuletzt im TicTacToe-Feld _oben mitte_ im Feld _oben links_ gesetzt, da das TicTacToe-Feld _oben links_ bereits belegt ist, darf "X" überall setzen.

---

by  
![Logo](https://cdn.discordapp.com/attachments/1296159076954411068/1383912765504356373/logo.png?ex=685084b3&is=684f3333&hm=10608cd405f058c786682465efeab2538fb000dad385de8627294dde106fcfbd&)

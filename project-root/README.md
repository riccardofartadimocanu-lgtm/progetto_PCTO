# PROGETTO PCTO

## Descrizione del progetto

Il progetto consiste in una web application sviluppata in Python che permette il caricamento, la visualizzazione e la modifica di immagini tramite un’interfaccia grafica interattiva.

L’applicazione consente all’utente di:

* caricare immagini dal file explorer;
* effettuare zoom avanti e indietro sull’immagine;
* spostarsi all’interno dell’immagine tramite funzione di pan;
* inserire punti direttamente sull’immagine;
* salvare i punti selezionati per utilizzi successivi.

I punti salvati rappresentano coordinate in pixel che verranno utilizzate successivamente per il calcolo di coordinate reali.

---

# Requisiti

Per il corretto funzionamento dell’applicazione è necessario:

* avere installato Python 3.14;
* avere installato le dipendenze presenti nel file `requirements.txt`;
* avviare il server Flask in loopback locale.

---

# Avvio del progetto

## 1. Installazione dipendenze

Aprire il terminale nella cartella del progetto ed eseguire:

```bash
pip install -r requirements.txt
```

---

## 2. Avvio del server

Eseguire:

```bash
python/py main.py
```

Successivamente aprire il browser all’indirizzo:

```text
http://127.0.0.1:5000
```

---

# Funzionalità principali

## Caricamento immagine

Il pulsante “Carica immagine” permette di selezionare un’immagine tramite il file explorer del sistema operativo.

---

## Modalità Edit

Il pulsante “Edit” abilita:

* zoom dell’immagine;
* spostamento (pan) tramite tasto destro del mouse;
* inserimento dei punti sull’immagine.

Il pulsante Edit:

* non funziona se non è stata caricata un’immagine;
* viene automaticamente disabilitato dopo il salvataggio.

---

## Inserimento punti

Quando la modalità Edit è attiva è possibile:

* cliccare sull’immagine;
* aggiungere punti;
* visualizzare le coordinate dei punti inseriti.

Le coordinate vengono salvate in pixel relativi all’immagine originale e visualizzate nella tabella accanto.

---

## Zoom

Con la rotella del mouse è possibile:

* ingrandire l’immagine;
* rimpicciolire l’immagine.

Lo zoom è disponibile solamente durante la modalità Edit.

---

## Pan

Tenendo premuto il tasto destro del mouse è possibile spostarsi all’interno dell’immagine.

Il pan è disponibile solamente durante la modalità Edit.

---

## Salvataggio

Il pulsante “Save”:

* salva i punti inseriti;
* blocca ulteriori modifiche;
* disabilita la modalità Edit fino al caricamento di una nuova immagine.

Il pulsante Save non funziona se non sono presenti punti.

---

## Tabella Punti

La tabella dei punti:

* mostra le coorindate in pixel;
* permette la cancellazione del punto cliccandoci sopra;

La tabella dei punti non permette l'elminazione dei punti una volta salvato.

---

# Tecnologie utilizzate

## Backend

* Python 3.14
* Flask

---

## Frontend

* HTML
* CSS
* JavaScript

---

## Formati dati

* JSON per il salvataggio dei dati e delle coordinate dei punti

---

# Struttura del progetto

```text
progetto_PCTO/
│
├── project-root/
│   ├── main.py
│   ├── requirements.txt
│   ├── README.md
│
├── src/
│   ├── core/
│   │   ├── pipeline.py
│   │
│   ├── ui/
│       ├── static/
│       │   ├── script.js
│       │   ├── style.css
│       │
│       ├── templates/
│           ├── pagina.html
```

---

# Note

L’applicazione è attualmente in fase di sviluppo e rappresenta la base per future implementazioni riguardanti:

* conversione coordinate pixel → coordinate reali;
* gestione avanzata dei dataset;
* salvataggio persistente dei progetti;
* elaborazione automatica delle immagini;
* integrazione con pipeline di analisi.

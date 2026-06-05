# PROGETTO PCTO

## Descrizione del progetto

Il progetto consiste in una web application sviluppata in Python che permette il caricamento, la visualizzazione e la modifica di immagini tramite un’interfaccia grafica interattiva.

L’applicazione consente all’utente di:

* caricare immagini dal file explorer;
* effettuare zoom avanti e indietro sull’immagine;
* spostarsi all’interno dell’immagine tramite funzione di pan;
* inserire punti direttamente sull’immagine;
* visualizzare le coordinate dei punti inseriti;
* eliminare punti non ancora salvati;
* esportare i punti in formato JSON;
* caricare punti precedentemente salvati tramite file JSON;
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

Aprire il terminale nella cartella `project-root` ed eseguire:

```bash
pip install -r requirements.txt
```

---

## 2. Avvio del server

Eseguire:

```bash
python main.py
```

oppure

```bash
py main.py
```

Successivamente aprire il browser all’indirizzo:

```text
http://127.0.0.1:5000
```

---

# Funzionalità principali

## Caricamento immagine

Il pulsante **Carica immagine** permette di selezionare un’immagine tramite il file explorer del sistema operativo.

Una volta caricata, l’immagine viene visualizzata all’interno dell’area di lavoro.

---

## Modalità Edit

Il pulsante **Edit** abilita:

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

Le coordinate vengono salvate in pixel relativi all’immagine originale e visualizzate nella tabella laterale.

---

## Tabella Punti

La tabella dei punti:

* mostra le coordinate dei punti inseriti;
* aggiorna automaticamente il numero di punti presenti;
* permette la cancellazione dei punti prima del salvataggio;
* mantiene i dati in sola lettura dopo il salvataggio.

Una volta salvati, i punti non possono più essere modificati o eliminati.

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

Il pulsante **Save**:

* salva i punti inseriti;
* blocca ulteriori modifiche;
* disabilita la modalità Edit fino al caricamento di una nuova immagine.

Il pulsante Save non funziona se non sono presenti punti.

---

## Esportazione JSON

Il pulsante **Export JSON** permette di esportare i punti inseriti in un file JSON.

Il file contiene:

* coordinate dei punti;
* identificativi dei punti;
* informazioni necessarie per il successivo caricamento e utilizzo dei dati.

L’esportazione consente di conservare il lavoro svolto e trasferirlo tra diverse sessioni dell’applicazione.

---

## Importazione JSON

Il pulsante **Load JSON** permette di caricare un file JSON precedentemente esportato.

Durante il caricamento:

* vengono ricostruiti i punti salvati;
* vengono ripristinate le coordinate associate;
* la tabella dei punti viene aggiornata automaticamente.

---

## Gestione dati

I dati dei punti vengono gestiti tramite strutture JSON che consentono:

* facile esportazione;
* facile importazione;
* compatibilità tra frontend e backend;
* estensibilità per future implementazioni.

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

* JSON per il salvataggio e il caricamento dei punti
* JSON per la comunicazione tra frontend e backend

---

# Architettura del progetto

L'applicazione segue una struttura modulare composta da:

## Frontend

Responsabile della gestione dell'interfaccia utente:

* caricamento immagini;
* gestione canvas;
* zoom;
* pan;
* inserimento punti;
* esportazione/importazione JSON.

## Backend

Responsabile della gestione dei dati e della logica applicativa:

* ricezione delle richieste dal frontend;
* elaborazione dei dati;
* gestione della pipeline;
* salvataggio e caricamento delle informazioni.

## Pipeline

La pipeline rappresenta il componente incaricato di coordinare il flusso dei dati all'interno dell'applicazione.

Le sue responsabilità includono:

* gestione dei punti inseriti;
* preparazione dei dati per il salvataggio;
* caricamento dei dati esportati;
* integrazione futura con sistemi di analisi automatica.

---

# Struttura del progetto

```text
progetto_PCTO/
│
├── project-root/
│   ├── main.py
│   ├── requirements.txt
│   ├── README.md
│   │
│   └── src/
│       ├── core/
│       │   ├── __init__.py
│       │   └── pipeline.py
│       │
│       └── ui/
│           ├── static/
│           │   ├── script.js
│           │   └── style.css
│           │
│           └── templates/
│               └── pagina.html
```

---

# Sviluppi futuri

L’applicazione rappresenta una base per future implementazioni riguardanti:

* conversione coordinate pixel → coordinate reali;
* gestione avanzata dei dataset;
* salvataggio persistente dei progetti;
* elaborazione automatica delle immagini;
* introduzione di detector dedicati all'analisi delle immagini;
* integrazione con pipeline di elaborazione avanzata;
* validazione automatica dei punti inseriti;
* esportazione in formati aggiuntivi.

---

# Note

L'applicazione è attualmente in fase di sviluppo. La struttura adottata consente l'estensione delle funzionalità senza modifiche sostanziali all'architettura esistente, favorendo la separazione tra interfaccia grafica, logica applicativa e gestione dei dati.

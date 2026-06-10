# Progetto PCTO – Sistema di Annotazione e Calibrazione di Immagini

## Descrizione del Progetto

Il progetto consiste in una web application sviluppata in Python e Flask che permette il caricamento, la visualizzazione, l'annotazione e la calibrazione geometrica di immagini tramite un'interfaccia grafica interattiva.

L'applicazione consente di selezionare punti di interesse sull'immagine, associare coordinate reali ai punti acquisiti ed effettuare una calibrazione prospettica per ottenere una rappresentazione corretta dell'immagine e delle coordinate associate.

I dati acquisiti possono essere esportati e successivamente riutilizzati per analisi, elaborazioni automatiche e conversioni tra coordinate immagine e coordinate reali.

---

# Obiettivi del Progetto

L'applicazione è stata progettata per:

* acquisire punti di interesse da immagini;
* memorizzare coordinate pixel e coordinate reali;
* calibrare immagini mediante punti di riferimento;
* correggere distorsioni prospettiche;
* generare dataset strutturati;
* preparare dati per future pipeline di Computer Vision e Image Processing.

---

# Funzionalità Principali

## Caricamento Immagine

L'utente può selezionare un'immagine tramite il file explorer del sistema operativo.

Una volta caricata:

* l'immagine viene visualizzata nell'area di lavoro;
* vengono inizializzati gli strumenti di navigazione;
* è possibile attivare la modalità di modifica.

---

## Modalità Edit

La modalità Edit abilita:

* inserimento punti;
* zoom;
* pan;
* visualizzazione coordinate.

La modalità è disponibile solo dopo il caricamento di un'immagine.

---

## Inserimento Punti

Durante la modalità Edit l'utente può:

* selezionare punti direttamente sull'immagine;
* visualizzare le coordinate;
* associare informazioni aggiuntive ai punti.

Per ogni punto vengono registrate:

* coordinata pixel X;
* coordinata pixel Y;
* coordinata reale X;
* coordinata reale Y.

---

## Gestione Coordinate

L'applicazione gestisce due sistemi di riferimento:

### Coordinate Pixel

Rappresentano la posizione originale del punto sull'immagine.

Esempio:

```text
(x, y)
```

### Coordinate Reali

Rappresentano la posizione fisica associata al punto.

Esempio:

```text
(xm, ym)
```

Queste coordinate vengono utilizzate durante la fase di calibrazione e nelle successive elaborazioni.

---

## Tabella dei Punti

La tabella laterale mostra:

* ID del punto;
* coordinate pixel;
* coordinate reali;
* stato del punto.

Funzionalità:

* aggiornamento automatico;
* eliminazione dei punti non salvati;
* blocco delle modifiche dopo il salvataggio.

---

## Zoom

La rotella del mouse consente di:

* ingrandire l'immagine;
* ridurre l'immagine;
* lavorare con maggiore precisione.

---

## Pan

Tenendo premuto il tasto destro del mouse è possibile:

* spostarsi all'interno dell'immagine;
* navigare immagini di grandi dimensioni.

---

# Sistema di Calibrazione

## Calibrazione Geometrica

L'applicazione integra un sistema di calibrazione prospettica che consente di correggere la deformazione dell'immagine.

La procedura richiede almeno:

```text
4 punti di riferimento
```

associati a coordinate reali note.

---

## Trasformazione Omografica

Durante la calibrazione viene calcolata una matrice di omografia che permette di:

* correggere la prospettiva;
* riallineare l'immagine;
* convertire coordinate immagine in coordinate reali.

Il processo genera:

* immagine calibrata;
* coordinate trasformate;
* fattore di scala.

---

## Visualizzazione Risultato

Dopo la calibrazione viene mostrata:

* l'immagine corretta;
* l'anteprima del risultato;
* la possibilità di scaricare il file generato.

---

## Download PNG

L'immagine calibrata può essere esportata in formato PNG.

Questo permette di conservare il risultato della trasformazione per utilizzi successivi.

---

# Salvataggio dei Dati

## Save

Il pulsante Save:

* salva definitivamente i punti;
* blocca ulteriori modifiche;
* garantisce l'integrità dei dati raccolti.

---

# Esportazione JSON

I dati possono essere esportati in formato JSON.

Il file contiene:

* ID immagine;
* ID setup;
* coordinate pixel;
* coordinate reali;
* stato dei punti;
* informazioni di validazione;
* dati necessari al successivo caricamento.

---

# Esportazione CSV

L'applicazione permette anche l'esportazione in formato CSV.

Il file può essere utilizzato per:

* fogli di calcolo;
* software statistici;
* elaborazioni automatiche;
* pipeline esterne.

---

# Importazione JSON

È possibile caricare file JSON precedentemente esportati.

Durante l'importazione:

* vengono ricostruiti i punti;
* vengono ripristinate le coordinate;
* vengono recuperati i metadati associati.

---

# Validazione Automatica

Prima dell'esportazione viene eseguito un controllo automatico dei dati.

La validazione verifica:

* coordinate mancanti;
* coordinate reali assenti;
* punti duplicati;
* punti vicini ai bordi dell'immagine;
* completezza delle informazioni.

Ogni punto può essere classificato come:

```text
COMPLETO
WARNING
INCOMPLETO
```

---

# Stima delle Coordinate Reali

Il sistema supporta la generazione di una posizione reale stimata basata sui dati disponibili.

Questa funzionalità rappresenta il primo passo verso future elaborazioni automatiche e sistemi di analisi avanzata.

---

# Metadati Gestiti

Per ogni sessione possono essere memorizzati:

* ID Immagine;
* ID Setup;
* coordinate pixel;
* coordinate reali;
* stato della validazione;
* informazioni di calibrazione.

---

# Requisiti

Per eseguire il progetto è necessario:

* Python 3.14 o superiore;
* Flask;
* dipendenze presenti nel file `requirements.txt`.

---

# Installazione

## Installazione dipendenze

```bash
pip install -r requirements.txt
```

---

# Avvio dell'Applicazione

Avviare il server Flask:

```bash
python main.py
```

oppure:

```bash
py main.py
```

Aprire successivamente il browser all'indirizzo:

```text
http://127.0.0.1:5000
```

---

# Workflow Operativo

1. Caricare un'immagine.
2. Inserire ID immagine e ID setup.
3. Attivare la modalità Edit.
4. Inserire i punti di interesse.
5. Associare le coordinate reali.
6. Salvare i punti.
7. Eseguire la calibrazione.
8. Visualizzare il risultato.
9. Scaricare l'immagine calibrata.
10. Esportare i dati in JSON o CSV.

---

# Tecnologie Utilizzate

## Backend

* Python
* Flask

## Frontend

* HTML5
* CSS3
* JavaScript

## Elaborazione Dati

* JSON
* CSV

## Elaborazione Geometrica

* Trasformazioni omografiche
* Calibrazione prospettica
* Conversione coordinate

---

# Architettura del Progetto

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

# Sviluppi Futuri

Le future evoluzioni del progetto includono:

* calibrazione automatica;
* riconoscimento automatico dei punti;
* integrazione con algoritmi di Computer Vision;
* supporto multi-immagine;
* gestione avanzata dei dataset;
* database persistente;
* esportazione in ulteriori formati;
* analisi automatica delle misure;
* integrazione con modelli di intelligenza artificiale.

---

# Stato del Progetto

Il progetto è attualmente in fase di sviluppo avanzato e rappresenta una piattaforma modulare per l'acquisizione, la calibrazione e l'analisi di dati provenienti da immagini.

L'architettura adottata garantisce scalabilità, manutenibilità ed estensibilità, consentendo l'integrazione di future funzionalità senza modifiche sostanziali alla struttura esistente.

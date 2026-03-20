# Petstore API - Load Testing Project

Projekt za opterećajno testiranje **Petstore API-a** koristeći dva moćna alata: **JMeter** i **k6**. Ovaj repozitorij sadrži konfiguracije, skripte i rezultate detaljne analize performansi API-a.

---

## Pregled Projekta

Projekt implementira različite vrste testiranja:

- **Smoke Tests** - Brzi testovi za provjeru osnovne funkcionalnosti
- **Load Tests** - Testiranje API-a sa realističnim opterećenjem
- **Stress Tests** - Testiranje do točke sloma sistema
- **Spike Tests** - Simulacija naglog porasta prometa

---

## Korišteni Alati

### JMeter
- **Putanja:** `JMeter/`
- **Konfiguracija:** `petstore-comprehensive.jmx`
- **Opis:** Apache JMeter za detaljno testiranje HTTP zahtjeva sa bogatim mogućnostima analize
- **Rezultati:** CSV i JTL formati sa interaktivnim HTML izvještajima

### k6
- **Putanja:** `k6/`
- **Skripte:** 
  - `petstore-load-test.js` - Load testing
  - `smoke-test.js` - Smoke testiranje
  - `stress-test.js` - Stress testiranje
  - `spike-test.js` - Spike testiranje
  - `quick-test.js` - Brzi testovi
- **Opis:** Moderni alat za load testing sa JS/Python API-jem
- **Rezultati:** Detaljni JSON i HTML izvještaji

---

## Rezultati i Analiza

### k6 Izvještaj
Pregledajte detaljne rezultate k6 analize na linku ispod:

**[K6 Load Test Results - Grafički Prikaz](https://idzafic1.github.io/loadTestPetStoreAPI/results/report.html)**

Izvještaj sadrži:
- Real-time metrike performansi
- Analizu odgovora vremena (Response Time)
- Throughput analizu
- Detaljne grafike i statistiku

### JMeter Rezultati
- **CSV Rezultati:** `JMeter/results/jmeter-report.csv`
- **JTL Format:** `JMeter/results/results.jtl`
- **HTML Izvještaj:** `JMeter/results/jmeter-report/index.html`

---

## Pokretanje Testova

### JMeter Testovi

```bash
cd JMeter
bash run-jmeter-test.sh
```

Rezultati će biti generirani u direktoriju `results/`.

### k6 Testovi

#### Load Test
```bash
cd k6
k6 run petstore-load-test.js
```

#### Smoke Test
```bash
k6 run smoke-test.js
```

#### Stress Test
```bash
k6 run stress-test.js
```

#### Spike Test
```bash
k6 run spike-test.js
```

#### Automatizirano pokretanje
```bash
bash autoRun.sh
# ili
bash run-and-save.sh
```

---

## Struktura Direktorija

```
├── JMeter/
│   ├── petstore-comprehensive.jmx      # JMeter test plan
│   ├── run-jmeter-test.sh              # Skripta za pokretanje
│   └── results/                        # Rezultati testiranja
│       ├── jmeter-report.csv
│       ├── results.jtl
│       └── jmeter-report/              # HTML izvještaj
│
├── k6/
│   ├── petstore-load-test.js           # Load test skripta
│   ├── smoke-test.js                   # Smoke test skripta
│   ├── stress-test.js                  # Stress test skripta
│   ├── spike-test.js                   # Spike test skripta
│   ├── quick-test.js                   # Brzi test
│   ├── petstore-collection.json        # Postman kolekcija
│   ├── petstore-environment.json       # Okruženje
│   ├── autoRun.sh                      # Automatizirano pokretanje
│   └── results/                        # Rezultati
│       ├── report.html                 # HTML izvještaj
│       └── history/                    # Historija testova
│
└── README.md                           # Ovaj file
```

---

## API Testirane Operacije

Testovi pokrivaju sljedeće operacije Petstore API-a:

- **GET /pet/{id}** - Preuzimanje ljubimca po ID-u
- **POST /pet** - Dodavanje novog ljubimca
- **PUT /pet** - Ažuriranje podataka o ljubimcu
- **DELETE /pet/{id}** - Brisanje ljubimca
- **POST /pet/{id}/uploadImage** - Upload slike
- **POST /store/order** - Kreiranje narudžbe
- **GET /store/order/{id}** - Preuzimanje narudžbe
- **POST /user/login** - Login korisnika

---

## Ključne Metrike

### Praćene Metrike

| Metrika | Opis |
|---------|------|
| **Response Time (p95, p99)** | Vrijeme odgovora servera |
| **Throughput (RPS)** | Broj zahtjeva po sekundi |
| **Error Rate** | Postotak neuspješnih zahtjeva |
| **Availability** | Dostupnost servera |
| **Max VUs** | Maksimalan broj simuliranih korisnika |

---

## Preporuke za Analizu

1. **Prvo pokrenite** smoke test za provjeru osnovne funkcionalnosti
2. **Zatim load test** sa realističnim brojem korisnika
3. **Analizirajte** response time i error rate
4. **Identificirajte** bottlenecke pomoću grafičkog prikaza
5. **Optimizirajte** API ili infrastrukturu prema nalazima

---

## Zahtjevi

### Za JMeter
- Java JDK/JRE verzija 8 ili viša
- JMeter 5.4+

### Za k6
- k6 1.40+
- Node.js (za generiranje izvještaja)

### Instalacija

**JMeter:**
```bash
# Linux/Mac
brew install jmeter

# Ili preuzmite sa https://jmeter.apache.org/
```

**k6:**
```bash
# Linux
sudo apt-get install k6

# Mac
brew install k6

# Ili sa https://k6.io/docs/getting-started/installation/
```


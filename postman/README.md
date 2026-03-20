**Petstore API test-suite**

Prije pokretanja testova osigurajte da imate dostupne Node.js i npm.

1. Instalirajte Newman ako već nije prisutan:
   ```bash
   npm install -g newman
   ```
2. Pokrenite kolekciju zajedno sa konfiguracijskim okruženjem:
   ```bash
   newman run petstore-collection.json -e petstore-environment.json
   ```

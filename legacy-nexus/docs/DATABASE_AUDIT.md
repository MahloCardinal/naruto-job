# Verifica database carte NEXUS

## Esito
- Record nel catalogo consolidato: **290**
- ID univoci: **290**
- Record senza ID, nome, rarità o URL: **0**
- Duplicati ID: **0**

## Distribuzione verificata
| Gruppo | Carte |
|---|---:|
| Season 1 | 85 |
| Season 2 | 100 |
| Season 3 | 100 |
| Event Scroll | 5 |
| **Totale** | **290** |

## Nota sui JSON sorgente
I tre JSON originali sono stati conservati senza modifiche in `data/`. I file Season 1 e Season 2 contengono anche elementi grafici e di navigazione del sito ufficiale, oltre alle carte. Per questo motivo il numero grezzo di record è 90 e 105, ma dopo aver escluso i 5 elementi non-carta presenti in ciascun file, si ottengono rispettivamente 85 e 100 carte. La Season 3 contiene 100 carte.

Il catalogo normalizzato `data/cards.json` è stato ricavato dal catalogo consolidato NEXUS già preparato, che comprende anche le 5 Event Scroll. I dati originali restano disponibili per confronto e audit; non sono stati cancellati o sovrascritti.

## Campi disponibili
Ogni carta include almeno `id`, `season`, `name`, `rarity`, `url`. Le cinque Event Scroll includono inoltre i dati aggiuntivi disponibili nel catalogo consolidato.

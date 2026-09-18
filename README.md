# Sofias romreise

Et lite 3D-eventyr på norsk bokmål, laget for en femåring og berøring på iPad. Oppdatert 18. september 2026.

## Spill

- Start ved et brunt hus i skogen på jorda. Sofia går om bord i raketten før avgang.
- Velg sola, Merkur, Venus, jorda, Mars, Jupiter, Saturn, Uranus, Neptun eller Pluto.
- Dra med fingeren for å se skogen eller planeten fra forskjellige vinkler.
- På reisen: trykk på bokstavene i navnet. De store knappene erstatter iPad-tastaturet helt.
- Riktig bokstav øker farten; et helt navn gir ekstra kraft. Feil bokstav bremser litt, men riktig neste bokstav vises som hjelp. Hjelpen kan slås av.
- Fremdriftslinjen viser reisen. Ved boost skyter raketten synlig frem mot planeten, flammen blir lengre og blåhvit, og fartsstriper og boostringer dukker opp. Farten faller mykt tilbake til vanlig fart etter noen sekunder.
- Planeter på veien passerer i 3D under reisen, med navneskilt, lyd og norsk opplesning. På vei fra jorda til Pluto passerer vi Mars, Jupiter, Saturn, Uranus og Neptun. Reisen hjem viser omvendt rekkefølge. En rutelinje viser hvilke planeter som er passert og hvilke som gjenstår.
- Hver bokstav som trykkes, leses med norsk bokstavnavn. Planetpasseringer og ankomstfakta får snakke ferdig uten å bli kuttet av nye bokstavtrykk.
- Ny lydpakke: knapper, nedtelling, avgang, motorlyd som følger farten, boost, feiltrykk, passering, ankomst og redning. Lyd dempes under opplesning og stoppes ved pause/lyd av.
- Du kommer frem selv om du ikke skriver. Det er ingen liv eller poeng som kan mistes.
- Ved sola brenner raketten opp. En redningskapsel tar Sofia trygt hjem på noen sekunder, og en ny rakett venter.
- Opplesning, lyder, bokstavhjelp, roligere effekter og pause er tilgjengelig. Spillet pauses når nettleserfanen skjules under reisen.
- Sofias oppdagelser lagres lokalt på enheten og beholdes ved ny sidelasting. Etter to ulike planetbesøk får raketten SOFIA-graffiti, etter fem får den lilla og rosa farger, og når alle ti reisemål er oppdaget får den regnbuespor. Jorda er oppdaget fra start. Sola teller ikke mot de to/fem planetbesøkene, men må også oppdages for regnbuesporet. Pluto teller som et planetbesøk i belønningssystemet.
- Sofia blir tiltalt med navn i hilsener, ros, avgang, planetpasseringer og ankomst. Gjentatte besøk gir ikke nye planetpoeng. Belønningene følger raketten også etter solbesøket.

## Prøv med én fil

`dist/index.html` er hele spillet i én fil. På PC kan filen åpnes direkte i en vanlig nettleser. Ingen installasjon, server, CDN eller nedlastede 3D-filer er nødvendig.

På iPad er en publisert nettadresse i Safari den anbefalte måten. Filforhåndsvisning i Filer-appen eller inne i en melding er ikke en full nettleser og kan blokkere JavaScript.

## Publiser på Vercel

1. Legg prosjektfilene fra ZIP-en i et GitHub-repository.
2. Importer repositoryet som et nytt prosjekt i Vercel. Velg mappen som inneholder `vercel.json` som prosjektrot.
3. Vercel-konfigurasjonen velger ingen rammeverkspreset, kjører `node build.cjs` og publiserer `dist`.
4. Publiser og åpne adressen i Safari på iPaden.

Det trengs ingen miljøvariabler, API-nøkler eller database. Prosjektet har ingen npm-avhengigheter.

Du kan også publisere den ferdige `dist`-mappen som en statisk nettside. Med Vercel CLI fra prosjektmappen: `npx vercel --prod` (krever innlogging på egen konto).

Konfigurasjonsreferanser: [Vercel Project Configuration](https://vercel.com/docs/project-configuration) og [Configuring a Build](https://vercel.com/docs/builds/configure-a-build).

## iPad

Åpne Vercel-adressen i Safari. Spillet er tilpasset både stående og liggende visning. Du kan bruke Safari-menyen for å legge siden til på Hjem-skjermen. Alle knapper er laget for berøring; dra i 3D-scenen for å snu kameraet. Lyd må starte etter et trykk, slik mobilnettlesere krever.

Opplesningen bruker en tilgjengelig norsk stemme på enheten. Hvis den ikke er tilgjengelig, fungerer teksten og spillet fortsatt. En fysisk iPad og Safari-lyd er ikke testet i dette miljøet.

## Avstander og fakta

Sola er en stjerne, det er åtte planeter, og Pluto er en dvergplanet. Gass- og iskjempene utforskes fra rommet, uten landing på en fast overflate.

Reisetiden bruker forskjellen mellom gjennomsnittlige baneavstander fra sola, med en komprimert kvadratrotsskala. Dette er ikke planetenes faktiske innbyrdes avstand akkurat nå. Passeringene følger planetenes rekkefølge fra sola, med komprimerte visuelle posisjoner. Planetene står ikke på rekke i virkeligheten, og romfartøy trenger ikke besøke alle mellomliggende planeter. Spillet bruker denne forenklede ruten for å lære rekkefølgen. Størrelser, farger, bevegelse, fart og effekter er stiliserte for lek. Sola ser gul ut i spillet; den er ikke en gul steinplanet.

Fra jorda ved vanlig fart, uten nedtelling:

| Reisemål | Tid |
| --- | ---: |
| Sola | 1 min 20 sek |
| Merkur | 1 min 15 sek |
| Venus | 1 min |
| Mars | 1 min 10 sek |
| Jupiter | 2 min 5 sek |
| Saturn | 2 min 45 sek |
| Uranus | 3 min 40 sek |
| Neptun | 4 min 25 sek |
| Pluto | 5 min |

Bokstavkraft gjør reisen raskere. Feil kan gjøre reisen litt lengre. Farten går gradvis tilbake mot vanlig fart. Nærmeste planet fra jorda i denne modellen, Venus, tar 60 sekunder ved vanlig fart. Alle tidligere reisetider er ganget med fem. Nedtelling, pauser og redningssekvens kommer i tillegg.

Kilder: [NASA – planetene](https://science.nasa.gov/solar-system/planets/), [NASA – Pluto](https://science.nasa.gov/dwarf-planets/pluto/).

## Utvikling

- `npm run dev`: lokal visning med Node på port 4173.
- `npm run build`: lager den selvstendige HTML-filen i `dist`.
- `npm test`: kontrollerer reisetider, alle 100 reisemålskombinasjoner, passeringer begge veier, boost og normalisering av fart, norsk talekø, prioritering av planetopplesning og belønningsterskler for unike besøk.

`engine.js` er en liten WebGL-motor med ekte 3D-perspektiv, belyste geometriske modeller og dybdebuffer. En programvarerenderer med Canvas og egen dybdebuffer brukes hvis WebGL ikke er tilgjengelig. Ingen tredjepartspakker eller eiendeler er nødvendige.

Validering: syntakskontroll og tester av reisetider, ruterekkefølge, boost og talekø. Nettleserkontroll av berøringsknapper, boost, reiserute, planetpasseringer, lagret fremgang, rakettfarger, SOFIA-graffiti og regnbuespor. Terskler og taleprioritet er i tillegg testet automatisk. Faktisk lyd og norsk uttale på en fysisk iPad gjenstår å verifisere. Første versjon ble også kontrollert for Mars-ankomst og solbesøk med trygg retur. Layout kontrollert i nettleservinduer på 1024 × 768 og 768 × 1024. Nettlesermiljøet brukte programvarerendereren; maskinvare-WebGL og fysisk iPad er ikke verifisert. Valgfri WebMCP-integrasjon er funksjonsdetektert, men testnettleseren eksponerte ikke denne API-en.

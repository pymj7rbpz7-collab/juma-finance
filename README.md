# pairo

Haushaltsbuch für CHF und EUR. Läuft als Web-App auf iPhone, iPad und Mac und gleicht die Einträge über dein Konto zwischen allen Geräten ab. Alle Einträge werden auf dem Gerät mit AES-256 verschlüsselt, bevor sie das Gerät verlassen.

## Einrichten (einmalig, etwa 15 Minuten)

### 1. Supabase: Konto und Abgleich

1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt anlegen (Region z. B. Frankfurt oder Zürich).
2. **SQL Editor** öffnen, den Inhalt von `supabase/schema.sql` einfügen und ausführen.
3. **Authentication > Sign In / Providers > Email**: „Confirm email“ ausschalten. (Bleibt es an, musst du nach dem Erstellen des Kontos einmal einen Link in einer E-Mail öffnen und unter *Authentication > URL Configuration* die Adresse deiner App als „Site URL“ eintragen.)
4. **Project Settings > API**: „Project URL“ und den öffentlichen Schlüssel („anon“ bzw. „publishable“) kopieren und in `config.js` eintragen:

   ```js
   window.JUMA_CONFIG = {
     supabaseUrl: 'https://deinprojekt.supabase.co',
     supabaseKey: 'eyJ…'
   };
   ```

   Beide Werte sind öffentlich und dürfen auf GitHub liegen. Den „service_role“- bzw. „secret“-Schlüssel niemals eintragen.

### 2. GitHub: App veröffentlichen

1. Neues Repository anlegen (öffentlich, damit GitHub Pages kostenlos ist) und alle Dateien dieses Ordners hochladen.
2. **Settings > Pages**: „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
3. Nach ein bis zwei Minuten ist die App unter `https://DEINNAME.github.io/REPONAME/` erreichbar.

### 3. Konto erstellen

1. Die Adresse öffnen, „Neues Konto erstellen“ wählen, E-Mail und Passwort eingeben.
2. Danach in Supabase unter **Authentication > Sign In / Providers** „Allow new users to sign up“ ausschalten. So kann sich niemand sonst in deinem Projekt registrieren.

### 4. Auf den Geräten installieren

- **Mac:** Adresse in Safari öffnen, dann *Ablage > Zum Dock hinzufügen*. pairo liegt danach als eigene App im Dock und im Launchpad. (In Chrome: Symbol „Installieren“ in der Adresszeile.)
- **iPhone und iPad:** Adresse in Safari öffnen, *Teilen > Zum Home-Bildschirm*.

Auf jedem Gerät einmal mit E-Mail und Passwort anmelden. Danach fragt die App nur noch nach dem Passwort.

## Funktionen

- **Übersicht:** Dashboard mit Kennzahlen, Verlauf, grössten Ausgaben, letzten Einträgen, nächsten Fixposten, Konten und Sparzielen. Auf Mac und iPad mit Seitenleiste.
- **Einträge:** Ausgaben und Einnahmen in CHF und EUR, CSV-Import von der Bank, Suche über alle Monate.
- **Planung:** Fixkosten und Verträge werden am gewählten Tag automatisch eingetragen, mit optionaler Kündigungsfrist. Dazu Budgets je Kategorie und Sparziele.
- **Prognose:** Die Übersicht zeigt, was nach den noch ausstehenden Fixkosten bis Monatsende frei bleibt.
- **Tage:** Ausgaben pro Tag als Diagramm mit Durchschnitt, heutigen Ausgaben und dem höchsten Tag; ein Tipp auf einen Tag zeigt seine Einträge. Die Eintragsliste zeigt die Summe je Tag.
- **Auswertung:** Ausgaben je Kategorie mit Budget, Verlauf über zwölf Monate, Monatsvergleich nach Durchschnitt pro Tag, Kontostände je Konto.
- **Vermögen:** Nettovermögen aus Konten, Anlagen (Depot, ETFs, Krypto, Vorsorge) und Krediten, Verlauf über die Monate, Notgroschen-Check.
- **Steuern:** Einträge und Fixposten als Werbungskosten, Sonderausgaben, aussergewöhnliche Belastungen oder Schweizer Quellensteuer markieren; Jahresübersicht und CSV-Export.
- **Dranbleiben:** Wochen-Rückblick, Hinweis am Abend, wenn heute nichts erfasst ist, und Sparquote.
- **Mehr:** Wechselkurs, eigene Kategorien und Konten mit Startsaldo, Sicherung als Datei oder Text.

## Gut zu wissen

- **Ein Passwort für alles.** Es meldet dich an und verschlüsselt deine Einträge. An den Server geht nur ein daraus abgeleiteter Wert, nie das Passwort selbst. Es lässt sich nicht zurücksetzen: Ohne Passwort sind die Einträge nicht wiederherstellbar.
- **Abgleich.** Änderungen erscheinen auf den anderen Geräten innerhalb von Sekunden, spätestens wenn die App wieder in den Vordergrund kommt.
- **Offline.** Die App startet auch ohne Internet mit dem letzten Stand des Geräts. Offline erfasste Einträge werden hochgeladen, sobald die Verbindung zurück ist. Wird derselbe Monat gleichzeitig auf zwei Geräten offline geändert, gewinnt das Gerät, das zuletzt abgleicht.
- **Supabase kostenlos.** Kostenlose Projekte können nach längerer Zeit ohne Nutzung pausiert werden. Die Daten bleiben erhalten; im Supabase-Dashboard lässt sich das Projekt wieder starten.
- **Ohne `config.js`-Werte** läuft die App weiter, speichert dann aber nur auf dem jeweiligen Gerät.

## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Die ganze App |
| `config.js` | Verbindung zu deinem Supabase-Projekt |
| `supabase/schema.sql` | Tabelle und Zugriffsregeln |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installation und Offline-Betrieb |
| `vendor/supabase.js` | Supabase-Bibliothek (v2.45.4) |

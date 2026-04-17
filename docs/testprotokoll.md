# MiniTwitter – Testprotokoll

**Modul:** ICT Modul 223  
**Datum:** 2026-04-16  
**Umgebung:** Docker Compose (`docker compose up`) · Frontend: http://localhost:8080 · Backend: http://localhost:3000  
**Browser:** Chrome

---

## Testfälle

### TC-01 – Registrierung (Erfolgsfall)
| | |
|---|---|
| **Vorbedingung** | Kein Benutzer mit Username `testuser` vorhanden |
| **Schritte** | 1. `/#/register` öffnen · 2. Username `testuser`, Passwort `test123`, Bestätigung `test123` eingeben · 3. „Create account" klicken |
| **Erwartetes Ergebnis** | Weiterleitung auf Feed, Navbar zeigt `@testuser` |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-02 – Registrierung: Benutzername bereits vergeben
| | |
|---|---|
| **Vorbedingung** | Benutzer `testuser` existiert bereits |
| **Schritte** | 1. `/#/register` öffnen · 2. Username `testuser`, gültiges Passwort eingeben · 3. „Create account" klicken |
| **Erwartetes Ergebnis** | Fehlermeldung: „Username is already taken" |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-03 – Anmeldung (Erfolgsfall)
| | |
|---|---|
| **Vorbedingung** | Benutzer `testuser` / `test123` existiert |
| **Schritte** | 1. `/#/login` öffnen · 2. Zugangsdaten eingeben · 3. „Sign in" klicken |
| **Erwartetes Ergebnis** | Weiterleitung auf Feed, JWT in `localStorage` gespeichert |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-04 – Anmeldung: falsches Passwort
| | |
|---|---|
| **Vorbedingung** | Benutzer `testuser` existiert |
| **Schritte** | 1. `/#/login` öffnen · 2. Korrekter Username, falsches Passwort · 3. „Sign in" klicken |
| **Erwartetes Ergebnis** | Fehlermeldung: „Invalid username or password" |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-05 – Beitrag erstellen
| | |
|---|---|
| **Vorbedingung** | Als `testuser` angemeldet |
| **Schritte** | 1. Feed öffnen · 2. Text `Hello MiniTwitter!` eingeben · 3. „Post" klicken |
| **Erwartetes Ergebnis** | Beitrag erscheint oben im Feed mit Autor `@testuser` |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-06 – Eigenen Beitrag bearbeiten
| | |
|---|---|
| **Vorbedingung** | `testuser` hat mindestens einen Beitrag |
| **Schritte** | 1. Beitrag anklicken · 2. „Edit" klicken · 3. Inhalt ändern · 4. „Save" klicken |
| **Erwartetes Ergebnis** | Beitrag zeigt den aktualisierten Inhalt |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-07 – Eigenen Beitrag löschen
| | |
|---|---|
| **Vorbedingung** | `testuser` hat mindestens einen Beitrag |
| **Schritte** | 1. Im Feed „Delete" beim eigenen Beitrag klicken · 2. Bestätigen |
| **Erwartetes Ergebnis** | Beitrag wird aus dem Feed entfernt |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-08 – Fremden Beitrag nicht bearbeiten können (Rolle: user)
| | |
|---|---|
| **Vorbedingung** | `testuser` (Rolle: user) und `otheruser` existieren; `otheruser` hat einen Beitrag |
| **Schritte** | 1. Als `testuser` anmelden · 2. Beitrag von `otheruser` öffnen |
| **Erwartetes Ergebnis** | Kein „Edit"- oder „Delete"-Button sichtbar |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-09 – Kommentar erstellen
| | |
|---|---|
| **Vorbedingung** | Angemeldet, mindestens ein Beitrag vorhanden |
| **Schritte** | 1. Beitrag anklicken · 2. Kommentartext eingeben · 3. „Reply" klicken |
| **Erwartetes Ergebnis** | Kommentar erscheint unter dem Beitrag |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-10 – Kommentar bearbeiten und löschen
| | |
|---|---|
| **Vorbedingung** | `testuser` hat einen Kommentar verfasst |
| **Schritte** | 1. Kommentar mit „Edit" bearbeiten und speichern · 2. Kommentar mit „Delete" löschen |
| **Erwartetes Ergebnis** | Inhalt aktualisiert / Kommentar entfernt |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-11 – Beitrag liken
| | |
|---|---|
| **Vorbedingung** | Angemeldet, mindestens ein Beitrag vorhanden |
| **Schritte** | 1. ♥-Button bei einem Beitrag klicken |
| **Erwartetes Ergebnis** | Like-Zähler erhöht sich um 1 |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-12 – Like zurücknehmen (Toggle)
| | |
|---|---|
| **Vorbedingung** | `testuser` hat einen Beitrag bereits geliked |
| **Schritte** | 1. ♥-Button erneut klicken |
| **Erwartetes Ergebnis** | Like-Zähler verringert sich um 1 (Reaktion entfernt) |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-13 – Profil: Benutzername ändern
| | |
|---|---|
| **Vorbedingung** | Als `testuser` angemeldet |
| **Schritte** | 1. `/#/profile` öffnen · 2. Neuen Username `testuser2` eingeben · 3. „Update profile" klicken |
| **Erwartetes Ergebnis** | Erfolgsmeldung; Navbar zeigt `@testuser2` |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-14 – Moderator kann beliebigen Beitrag löschen
| | |
|---|---|
| **Vorbedingung** | `moduser` (Rolle: moderator), `testuser` hat einen Beitrag |
| **Schritte** | 1. Als `moduser` anmelden · 2. Beitrag von `testuser` öffnen · 3. „Delete" klicken |
| **Erwartetes Ergebnis** | Beitrag wird gelöscht |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-15 – Admin kann Benutzer sperren
| | |
|---|---|
| **Vorbedingung** | `adminuser` (Rolle: admin), `testuser` existiert |
| **Schritte** | 1. Als `adminuser` anmelden · 2. `/#/admin` öffnen · 3. „Lock" neben `testuser` klicken |
| **Erwartetes Ergebnis** | Schloss-Symbol erscheint; `testuser` erhält beim nächsten Login „Account locked" |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-16 – Admin kann Benutzerrolle ändern
| | |
|---|---|
| **Vorbedingung** | `adminuser` (Rolle: admin), `testuser` hat Rolle: user |
| **Schritte** | 1. Als `adminuser` anmelden · 2. `/#/admin` öffnen · 3. Dropdown bei `testuser` auf `moderator` setzen |
| **Erwartetes Ergebnis** | Rolle wird aktualisiert |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

### TC-17 – Unauthentifizierter Zugriff wird umgeleitet
| | |
|---|---|
| **Vorbedingung** | Nicht angemeldet |
| **Schritte** | 1. `http://localhost:8080/#/feed` direkt aufrufen |
| **Erwartetes Ergebnis** | Automatische Weiterleitung auf `/#/login` |
| **Ergebnis** |Pass|
| **Bemerkungen** | |

---

## Automatisierte Unit-Tests

**Framework:** Jest 29 + ts-jest  
**Datei:** `backend/src/service/__tests__/UserService.updateUsername.test.ts`  
**Ausführen:** `npm test` im Verzeichnis `backend/`  
**Getestete Methode:** `UserService.updateProfile()` — ausschliesslich der Username-Zweig

Die Datenbank wird vollständig durch Jest-Mocks ersetzt (`AppDataSource.getRepository`), sodass kein laufender Docker-Container benötigt wird.

| # | Beschreibung | Erwartetes Verhalten |
|---|---|---|
| UT-01 | Gültiger neuer Username | Gibt `{ id, username, role }` zurück; `save()` wird mit neuem Username aufgerufen |
| UT-02 | Username mit Leerzeichen am Rand | Leerzeichen werden getrimmt; gespeicherter Wert enthält keine Whitespace |
| UT-03 | Username identisch mit aktuellem | Kein Fehler; `save()` wird aufgerufen |
| UT-04 | Username kürzer als 3 Zeichen (Typ) | Wirft `ValidationError` |
| UT-05 | Username kürzer als 3 Zeichen (Meldung) | Fehlermeldung: „Username must be at least 3 characters" |
| UT-06 | Username länger als 50 Zeichen (Typ) | Wirft `ValidationError` |
| UT-07 | Username länger als 50 Zeichen (Meldung) | Fehlermeldung: „Username must not exceed 50 characters" |
| UT-08 | Username bereits von anderem User vergeben | Fehlermeldung: „Username is already taken" |
| UT-09 | User-ID existiert nicht (Typ) | Wirft `NotFoundError` |
| UT-10 | User-ID existiert nicht (Meldung) | Fehlermeldung: „User not found" |
| UT-11 | `dto.username` ist `undefined` | Username bleibt unverändert; `save()` wird trotzdem aufgerufen |

---

## Zusammenfassung

### Manuelle Tests
| Gesamt | Bestanden | Fehlgeschlagen | Nicht ausgeführt |
|--------|-----------|----------------|------------------|
| 17 | 17 | – | – |

### Automatisierte Unit-Tests
| Gesamt | Bestanden | Fehlgeschlagen | Nicht ausgeführt |
|--------|-----------|----------------|------------------|
| 11 | – | – | 11 (noch nicht ausgeführt) |

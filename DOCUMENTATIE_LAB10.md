# Laboratorul 10 - Dependency Injection și Service Lifetimes

## Implementare pentru Proiectul de Diagnosticare Auto

---

## 1. Business Layer (Nivel Servicii)

### Structura Implementată

```
lib/
├── services/                    # Business Layer
│   ├── user.service.ts         # Logică users
│   ├── diagnostic.service.ts   # Logică diagnosticare
│   ├── subscription.service.ts # Logică abonamente
│   ├── cache.service.ts        # Caching
│   └── logger.service.ts       # Logging
├── models/                      # Data Access Layer
│   ├── base.model.ts
│   ├── user.model.ts
│   ├── diagnostic.model.ts
│   └── subscription.model.ts
└── di/                          # Dependency Injection
    ├── interfaces.ts            # Service Interfaces
    ├── container.ts             # DI Container
    └── configurator.ts          # Service Configuration
```

### Logica de Business Implementată

#### UserService
- Validare email unic la actualizare
- Verificare abonament activ înainte de ștergere
- Cache pentru performanță
- Logging comprehensiv

#### DiagnosticService
- Verificare permisiuni utilizator (free trial limits)
- Diagnostic AI cu calitate bazată pe tier (Free/Standard/Premium)
- Incrementare contor utilizare
- Invalidare cache

---

## 2. Dependency Injection

### Interfețe (similar cu ICarDbContext din .NET)

**Fișier: `lib/di/interfaces.ts`**

```typescript
export interface IUserService {
  getAllActiveUsers(): Promise<any[]>
  getUserWithDetails(userId: string): Promise<any>
  updateUser(userId: string, data: any): Promise<any>
  deleteUser(userId: string): Promise<boolean>
}

export interface IDiagnosticService {
  canUserDiagnose(userId: string): Promise<{ can: boolean; reason?: string }>
  performDiagnostic(userId: string, vehicleInfo: any, symptoms: string): Promise<any>
}
```

### DI Container (similar cu Autofac)

**Fișier: `lib/di/container.ts`**

Implementează pattern-ul Service Locator cu suport pentru 3 lifetimes:

```typescript
export enum ServiceLifetime {
  SINGLETON = 'singleton',  // O instanță pentru întreaga aplicație
  SCOPED = 'scoped',       // O instanță per request
  TRANSIENT = 'transient'  // Instanță nouă la fiecare utilizare
}

export class DIContainer {
  register<T>(token: string, factory: () => T, lifetime: ServiceLifetime): void
  resolve<T>(token: string): T
  clearScope(): void  // Pentru SCOPED
}
```

### Configurator (similar cu ContainerConfigurer.ConfigureContainer())

**Fișier: `lib/di/configurator.ts`**

```typescript
export class DIConfigurator {
  // Configurare SINGLETON
  static configureSingleton(): void {
    container.registerSingleton('IUserService', () => new UserService())
    container.registerSingleton('IDiagnosticService', () => new DiagnosticService())
  }

  // Configurare SCOPED
  static configureScoped(): void {
    container.registerScoped('IUserService', () => new UserService())
    container.registerScoped('IDiagnosticService', () => new DiagnosticService())
  }

  // Configurare TRANSIENT
  static configureTransient(): void {
    container.registerTransient('IUserService', () => new UserService())
    container.registerTransient('IDiagnosticService', () => new DiagnosticService())
  }
}
```

---

## 3. Service Lifetimes - Comparație Detaliată

### 3.1 SINGLETON

**Caracteristici:**
- O singură instanță pentru întreaga aplicație
- Instanța este creată la prima utilizare și reutilizată mereu
- Memoria este alocată o singură dată

**Când se folosește:**
- Servicii fără state (stateless)
- Cache-uri globale
- Logging
- Configurații

**Avantaje:**
- Performanță maximă (fără overhead de creare instanțe)
- Memorie minimă
- Partajare date între toate request-urile

**Dezavantaje:**
- Nu este thread-safe implicit
- State-ul este partajat global (poate cauza probleme)
- Testare mai dificilă

**Exemplu din aplicație:**
```typescript
container.registerSingleton('ICacheService', () => new CacheService())
// Aceeași instanță de cache pentru toată aplicația
```

**Diagrama:**
```
Request 1 ──┐
Request 2 ──┼──> ACEEAȘI INSTANȚĂ (CacheService #1)
Request 3 ──┘
```

---

### 3.2 SCOPED

**Caracteristici:**
- O instanță per "scope" (de obicei per request HTTP)
- Instanța este partajată în cadrul aceluiași request
- La sfârșitul request-ului, instanța este distrusă

**Când se folosește:**
- Servicii cu business logic
- Servicii care lucrează cu context-ul request-ului
- Operații pe baza de date per request

**Avantaje:**
- Izolare între request-uri diferite
- Performanță bună (o singură instanță per request)
- Thread-safe între request-uri
- Testare ușoară

**Dezavantaje:**
- Overhead moderat de creare instanțe
- Memorie mai mare decât SINGLETON
- Necesită management explicit al scope-ului

**Exemplu din aplicație:**
```typescript
container.registerScoped('IUserService', () => new UserService())
// Instanță nouă pentru fiecare request, dar reutilizată în request
```

**Diagrama:**
```
Request 1 ──> UserService #1 (instanță pentru Request 1)
Request 2 ──> UserService #2 (instanță pentru Request 2)
Request 3 ──> UserService #3 (instanță pentru Request 3)
```

---

### 3.3 TRANSIENT

**Caracteristici:**
- Instanță nouă la fiecare injectare/utilizare
- Nu există reutilizare
- Garbage collected după utilizare

**Când se folosește:**
- Servicii lightweight, stateless
- Operații temporare
- Testare și debugging
- Când thread-safety este critică

**Avantaje:**
- Izolare completă
- Thread-safe implicit
- Fără side-effects între utilizări
- Testare foarte ușoară

**Dezavantaje:**
- Performanță mai scăzută (overhead maxim)
- Memorie mai mare
- Pressure pe garbage collector

**Exemplu din aplicație:**
```typescript
container.registerTransient('IDiagnosticService', () => new DiagnosticService())
// Instanță nouă de fiecare dată când este folosit
```

**Diagrama:**
```
Usage 1 ──> DiagnosticService #1
Usage 2 ──> DiagnosticService #2
Usage 3 ──> DiagnosticService #3
Usage 4 ──> DiagnosticService #4
```

---

## 4. Comparație Side-by-Side

| Criteriu | SINGLETON | SCOPED | TRANSIENT |
|----------|-----------|--------|-----------|
| **Instanțe create** | 1 pentru toată aplicația | 1 per request | 1 per utilizare |
| **Memorie** | Minimă | Moderată | Maximă |
| **Performanță** | Maximă | Bună | Mai scăzută |
| **Thread-safety** | Problematică | Bună | Excelentă |
| **Izolare** | Niciuna | Per request | Completă |
| **Când se folosește** | Cache, Logger, Config | Business Services | Operații temporare |
| **Testare** | Dificilă | Ușoară | Foarte ușoară |

---

## 5. Exemple Practice din Aplicație

### 5.1 Strategie SINGLETON pentru toate serviciile

```typescript
// În lib/di/configurator.ts
DIConfigurator.configureSingleton()

// Rezultat:
container.resolve('IUserService')      // Instanță #1
container.resolve('IUserService')      // Aceeași instanță #1
container.resolve('IUserService')      // Aceeași instanță #1
```

**Observație:** Cache-ul funcționează perfect, dar state-ul este partajat global!

---

### 5.2 Strategie SCOPED pentru servicii de business

```typescript
// În lib/di/configurator.ts
DIConfigurator.configureScoped()

// Request 1:
container.resolve('IUserService')      // Instanță #1 (Request 1)
container.resolve('IUserService')      // Aceeași instanță #1
container.clearScope()                 // Curăță la sfârșitul request-ului

// Request 2:
container.resolve('IUserService')      // Instanță #2 (Request 2)
container.resolve('IUserService')      // Aceeași instanță #2
```

**Observație:** Izolare perfectă între request-uri, performanță bună!

---

### 5.3 Strategie TRANSIENT pentru testare

```typescript
// În lib/di/configurator.ts
DIConfigurator.configureTransient()

// Fiecare utilizare:
container.resolve('IUserService')      // Instanță #1
container.resolve('IUserService')      // Instanță #2
container.resolve('IUserService')      // Instanță #3
```

**Observație:** Izolare maximă, dar overhead mare!

---

### 5.4 Strategie MIXED (Recomandată pentru Producție)

```typescript
// În lib/di/configurator.ts
DIConfigurator.configureMixed()

// Logger și Cache - SINGLETON (stateless, shared)
container.registerSingleton('ILoggerService', ...)
container.registerSingleton('ICacheService', ...)

// Business Services - SCOPED (per request)
container.registerScoped('IUserService', ...)
container.registerScoped('IDiagnosticService', ...)
```

**Observație:** Cel mai bun echilibru între performanță, memorie și izolare!

---

## 6. Cum să Comutați între Lifetimes

### Pas 1: Editați `lib/di/configurator.ts`

```typescript
// Decomentează linia dorită:

// DIConfigurator.configureSingleton()  // Toate SINGLETON
// DIConfigurator.configureScoped()     // User/Diagnostic SCOPED
DIConfigurator.configureMixed()      // Recomandat: Mixed strategy
// DIConfigurator.configureTransient()  // Toate TRANSIENT
```

### Pas 2: Verificați console logs

```
[DI] Configuring container with MIXED lifetime strategy
[DI] Registering service: ILoggerService with lifetime: singleton
[DI] Registering service: ICacheService with lifetime: singleton
[DI] Registering service: IUserService with lifetime: scoped
[DI] Registering service: IDiagnosticService with lifetime: scoped
```

### Pas 3: Testați diferențele

```typescript
// Test SINGLETON
const service1 = container.resolve('IUserService')
const service2 = container.resolve('IUserService')
console.log(service1 === service2)  // true pentru SINGLETON

// Test SCOPED
container.clearScope()
const service3 = container.resolve('IUserService')
console.log(service1 === service3)  // false (după clearScope)

// Test TRANSIENT
const service4 = container.resolve('IUserService')
const service5 = container.resolve('IUserService')
console.log(service4 === service5)  // false pentru TRANSIENT
```

---

## 7. Utilizare în Aplicație

### Exemplu: Admin CRUD Actions

```typescript
// app/actions/admin-crud-actions.ts

import { container } from '@/lib/di/container'
import { SERVICE_TOKENS } from '@/lib/di/configurator'
import type { IUserService } from '@/lib/di/interfaces'

export async function getAllUsers() {
  // Rezolvă serviciul din container (DI)
  const userService = container.resolve<IUserService>(SERVICE_TOKENS.USER_SERVICE)
  
  // Folosește serviciul
  const users = await userService.getAllActiveUsers()
  return { users }
}
```

### Exemplu: Diagnostic Actions

```typescript
// app/actions/diagnostic-actions.ts

import { container } from '@/lib/di/container'
import { SERVICE_TOKENS } from '@/lib/di/configurator'
import type { IDiagnosticService } from '@/lib/di/interfaces'

export async function generateDiagnosis(userId: string, symptoms: string) {
  // Rezolvă serviciul
  const diagnosticService = container.resolve<IDiagnosticService>(
    SERVICE_TOKENS.DIAGNOSTIC_SERVICE
  )
  
  // Folosește serviciul
  const result = await diagnosticService.performDiagnostic(userId, vehicleInfo, symptoms)
  return result
}
```

---

## 8. Concluzie

### Recomandări:

1. **Producție**: Folosiți **MIXED strategy**
   - SINGLETON pentru Logger, Cache
   - SCOPED pentru Business Services

2. **Development**: Folosiți **SCOPED** pentru toate
   - Debugging mai ușor
   - Izolare între request-uri

3. **Testing**: Folosiți **TRANSIENT** pentru toate
   - Izolare completă
   - Fără side-effects

### Beneficii DI:
- Cod mai testabil
- Dependency inversion principle
- Coupling redus
- Flexibilitate în configurare
- Lifecycle management explicit

---

**Implementat conform cerințelor Laboratorului 10**
- ✅ Business Layer complet
- ✅ Dependency Injection cu container
- ✅ Interfețe pentru toate serviciile
- ✅ Suport SINGLETON, SCOPED, TRANSIENT
- ✅ Documentație detaliată cu comparații

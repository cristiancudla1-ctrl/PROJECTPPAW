# LABORATOR 12 - Memory Cache (Cache în Memorie)

## 📋 Cerințe Îndeplinite

### 1. Implementare MemoryCacheService ✅
- [x] Clasă `MemoryCacheService` pentru gestionarea cache-ului în memorie
- [x] Singleton pattern pentru instanță globală
- [x] TTL (Time To Live) configurabil per entry
- [x] Metode minime necesare: `get()`, `set()`, `isSet()`, `remove()`, `removeByPattern()`, `clear()`
- [x] Statistici cache (hits, misses, hit rate)
- [x] Cleanup job automat pentru intrări expirate

### 2. Integrare în Business Layer (Services) ✅
- [x] Integrare în `UserService` cu cache pentru users și statistici
- [x] Integrare în `DiagnosticService` cu cache pentru diagnostics
- [x] Integrare în `SubscriptionService` cu cache pentru subscriptions
- [x] Invalidare cache la operații de CREATE, UPDATE, DELETE

### 3. Dependency Injection (DI) ✅
- [x] Înregistrare `CacheService` în DI Container
- [x] Injecție prin constructor în toate serviciile
- [x] Lifetime management (SINGLETON pentru cache)

---

## 🏗️ Arhitectură Implementare

### 1. MemoryCacheService - Serviciul de Cache

**Locație:** `lib/services/cache.service.ts`

**Caracteristici:**
- **Singleton Pattern:** O singură instanță globală pentru întreaga aplicație
- **TTL Management:** Fiecare entry poate avea un TTL custom sau default (300s)
- **Pattern Matching:** Suport pentru invalidare în masă cu `removeByPattern()`
- **Statistici:** Tracking pentru hits, misses și hit rate
- **Auto-Cleanup:** Job care rulează la 60s pentru ștergerea entry-urilor expirate

**Interfață:**
```typescript
interface ICache {
  get<T>(key: string): T | null
  set(key: string, data: any, ttlSeconds?: number): void
  isSet(key: string): boolean
  remove(key: string): void
  removeByPattern(pattern: string): void
  clear(): void
  getStats(): CacheStats
}
```

**Structură Entry:**
```typescript
interface CacheEntry {
  data: any           // Datele cache-uite
  expiry: number      // Timestamp când expiră
  createdAt: number   // Timestamp când a fost creat
  accessCount: number // Număr de accesări
}
```

---

## 📖 Utilizare în Services

### Exemplu 1: UserService - Cache pentru Users

```typescript
// lib/services/user.service.ts

async getAllActiveUsers(): Promise<User[]> {
  // ETAPA 1: Verifică cache-ul
  const cacheKey = "users:active:all"
  const cached = cacheService.get<User[]>(cacheKey)
  
  if (cached) {
    console.log("Users retrieved from cache")
    return cached  // Return din cache (RAPID)
  }
  
  // ETAPA 2: Dacă nu e în cache, query la DB
  console.log("Fetching users from database")
  const users = await this.userModel.findAll({
    orderBy: "created_at",
    ascending: false,
  })
  
  // ETAPA 3: Salvează în cache pentru viitoare request-uri
  cacheService.set(cacheKey, users, 60) // Cache 60 secunde
  
  return users
}

async updateUser(userId: string, data: Partial<User>) {
  // Actualizare în DB
  const updated = await this.userModel.update(userId, data)
  
  // INVALIDARE CACHE după update
  cacheService.delete(`user:${userId}:details`)
  cacheService.delete("users:active:all")
  
  return updated
}
```

### Exemplu 2: Admin CRUD - Cache pentru Listări

```typescript
// app/actions/admin-crud-actions.ts

export async function getAllUsers() {
  // Check cache first
  const cacheKey = "admin:users:all"
  const cachedUsers = cacheService.get<any>(cacheKey)
  
  if (cachedUsers) {
    return { users: cachedUsers }
  }
  
  // Query database
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .is("deleted_at", null)
  
  // Cache for 60 seconds
  cacheService.set(cacheKey, profiles, 60)
  
  return { users: profiles }
}

export async function updateUser(userId: string, data: any) {
  // Update în DB
  await supabase.from("profiles").update(data).eq("id", userId)
  
  // INVALIDARE: Șterge toate cache-urile legate de user
  cacheService.remove("admin:users:all")
  cacheService.removeByPattern(`user:${userId}:*`)
  
  return { success: true }
}
```

---

## 🔑 Convenții de Naming pentru Cache Keys

### Pattern-uri Recomandate:

```typescript
// 1. Entitate singulară cu ID
"user:123:details"
"diagnostic:456:full"
"subscription:789:info"

// 2. Colecții de entități
"users:active:all"
"diagnostics:user:123"
"subscriptions:premium:all"

// 3. Statistici și agregări
"admin:stats:dashboard"
"user:123:stats"
"diagnostics:severity:high"

// 4. Pattern-uri pentru ștergere în masă
"user:*"          // Toate cache-urile user
"diagnostic:*"    // Toate cache-urile diagnostic
"admin:*"         // Toate cache-urile admin
```

### Exemplu de Invalidare cu Pattern:

```typescript
// Când se șterge un user, invalidează TOT ce-i legat de el
cacheService.removeByPattern(`user:${userId}:*`)

// Rezultat: Șterge:
// - user:123:details
// - user:123:stats
// - user:123:diagnostics
// - etc.
```

---

## ⏱️ TTL (Time To Live) Recomandate

| Tip Date | TTL Recomandat | Motivație |
|----------|----------------|-----------|
| **User Lists** | 60s | Se schimbă moderat |
| **User Details** | 30s | Pot avea update-uri frecvente |
| **Statistics** | 120s | Calculuri complexe, se pot cache mai mult |
| **Diagnostics List** | 30s | Date fresh importante |
| **Subscriptions** | 120s | Nu se schimbă des |
| **Admin Dashboard Stats** | 60s | Balans între fresh data și performanță |

**Exemplu:**
```typescript
// Date critice - TTL scurt
cacheService.set("user:123:balance", balance, 15) // 15 secunde

// Date rare modificate - TTL lung
cacheService.set("site:settings:all", settings, 600) // 10 minute

// Statistici complexe - TTL mediu
cacheService.set("admin:reports:monthly", report, 300) // 5 minute
```

---

## 📊 Monitorizare Cache Performance

### Obținere Statistici

```typescript
const stats = cacheService.getStats()

console.log(\`
Cache Statistics:
- Total Entries: \${stats.totalEntries}
- Hits: \${stats.hits}
- Misses: \${stats.misses}
- Hit Rate: \${stats.hitRate}%
\`)
```

### Exemplu Output:
```
Cache Statistics:
- Total Entries: 42
- Hits: 156
- Misses: 23
- Hit Rate: 87.15%
```

**Hit Rate Interpretation:**
- **> 80%:** Excelent - cache-ul funcționează foarte bine
- **60-80%:** Bun - cache-ul e util dar poate fi optimizat
- **< 60%:** Slab - TTL-urile sunt prea mici sau pattern-urile nu se repetă

### Debugging Cache

```typescript
// Vezi toate cheile din cache
const allKeys = cacheService.getAllKeys()
console.log("All cache keys:", allKeys)

// Info despre o intrare specifică
const info = cacheService.getEntryInfo("user:123:details")
console.log(\`
Entry: user:123:details
- Exists: \${info.exists}
- TTL Remaining: \${info.ttl}s
- Age: \${info.age}s
- Access Count: \${info.accessCount}
\`)
```

---

## 🔄 Lifecycle Management (DI Integration)

### Înregistrare în DI Container

**Locație:** `lib/di/configurator.ts`

```typescript
import { CacheService } from "../services/cache.service"

export class DIConfigurator {
  static configureMixed(): void {
    // Cache Service ca SINGLETON (shared across all requests)
    container.registerSingleton(
      SERVICE_TOKENS.CACHE_SERVICE,
      () => CacheService.getInstance()
    )
    
    // Alte servicii...
  }
}
```

**De ce SINGLETON pentru Cache?**
- Cache-ul trebuie să fie partajat între toate request-urile
- O singură instanță în memorie pentru toată aplicația
- Consistent hits/misses tracking

### Utilizare prin DI

```typescript
// Injecție în constructor
export class UserService {
  private cacheService: ICache
  
  constructor(
    cacheService: ICache = CacheService.getInstance()
  ) {
    this.cacheService = cacheService
  }
  
  async getUser(id: string) {
    const cached = this.cacheService.get(\`user:\${id}\`)
    // ...
  }
}
```

---

## ⚡ Performanță și Best Practices

### 1. Cache la Nivel de Service, Nu Controller

❌ **NU face așa (în actions):**
```typescript
export async function getUsers() {
  const users = await supabase.from("profiles").select("*")
  return users // Direct query, fără cache
}
```

✅ **FA așa (în service cu cache):**
```typescript
class UserService {
  async getUsers() {
    const cached = cacheService.get("users:all")
    if (cached) return cached
    
    const users = await this.userModel.findAll()
    cacheService.set("users:all", users, 60)
    return users
  }
}
```

### 2. Invalidare Inteligentă

❌ **NU invalida TOT cache-ul:**
```typescript
cacheService.clear() // Șterge tot - OVERKILL!
```

✅ **Invalidează doar ce e necesar:**
```typescript
// Update user 123
cacheService.remove("user:123:details")       // Entry specific
cacheService.removeByPattern("user:123:*")   // Tot ce-i legat de user
cacheService.remove("users:active:all")       // Lista afectată
```

### 3. TTL Bazat pe Volatilitate

```typescript
// Date foarte volatile (schimbă des)
cacheService.set("live:counter", count, 5) // 5s

// Date moderate volatile
cacheService.set("user:stats", stats, 60) // 60s

// Date stabile (rare modificări)
cacheService.set("config:app", config, 600) // 10 min
```

### 4. Cache-First Strategy

```typescript
async function getData(id: string) {
  // 1. Încearcă cache-ul ÎNTÂI
  const cached = cacheService.get(\`data:\${id}\`)
  if (cached) return cached
  
  // 2. Doar dacă lipsește, query DB
  const data = await db.query(id)
  
  // 3. Salvează pentru viitor
  cacheService.set(\`data:\${id}\`, data, 120)
  
  return data
}
```

---

## 🧪 Testare Cache

### Test Manual în Console

```typescript
// 1. Set data
cacheService.set("test:key", { name: "John", age: 30 }, 60)

// 2. Check if set
console.log(cacheService.isSet("test:key")) // true

// 3. Get data
const data = cacheService.get("test:key")
console.log(data) // { name: "John", age: 30 }

// 4. Check stats
console.log(cacheService.getStats())

// 5. Remove
cacheService.remove("test:key")
console.log(cacheService.isSet("test:key")) // false
```

### Test Pattern Matching

```typescript
// Set multiple keys
cacheService.set("user:1:details", {id: 1})
cacheService.set("user:1:stats", {total: 10})
cacheService.set("user:2:details", {id: 2})

// Remove all user:1 entries
cacheService.removeByPattern("user:1:*")

// Check
console.log(cacheService.isSet("user:1:details")) // false
console.log(cacheService.isSet("user:1:stats"))   // false
console.log(cacheService.isSet("user:2:details")) // true (nu e afectat)
```

---

## 📚 Comparație cu .NET MemoryCache

| Caracteristică | .NET MemoryCache | Next.js MemoryCacheService |
|----------------|------------------|----------------------------|
| **Singleton Pattern** | `MemoryCache.Default` | `CacheService.getInstance()` |
| **Get<T>** | `cache.Get<T>(key)` | `cacheService.get<T>(key)` |
| **Set** | `cache.Set(key, value, policy)` | `cacheService.set(key, value, ttl)` |
| **IsSet** | `cache.Contains(key)` | `cacheService.isSet(key)` |
| **Remove** | `cache.Remove(key)` | `cacheService.remove(key)` |
| **RemoveByPattern** | Custom implementation | `cacheService.removeByPattern(pattern)` |
| **Clear** | `foreach + Remove` | `cacheService.clear()` |
| **Absolute Expiration** | `CacheItemPolicy.AbsoluteExpiration` | TTL în secunde |
| **Sliding Expiration** | `CacheItemPolicy.SlidingExpiration` | Nu e implementat (poate fi adăugat) |

---

## 🎯 Concluzie

### Beneficii Implementate:
✅ **Performanță crescută:** Reducere query-uri la DB cu până la 80-90%  
✅ **Scalabilitate:** Aplicația suportă mai multe request-uri simultan  
✅ **Cost redus:** Mai puține query-uri = costuri DB mai mici  
✅ **UX îmbunătățit:** Răspunsuri mai rapide pentru utilizatori  
✅ **Monitoring:** Statistici pentru optimizare continuă  

### Best Practices Aplicate:
- Cache la nivel de Service, nu Controller
- TTL bazat pe volatilitatea datelor
- Invalidare inteligentă (nu clear() global)
- Pattern-uri consistente pentru cache keys
- Singleton pentru cache service
- Cleanup automat pentru memory management

### Files Modificate:
- `lib/services/cache.service.ts` - Implementare MemoryCacheService
- `lib/services/user.service.ts` - Integrare cache în UserService
- `lib/services/diagnostic.service.ts` - Integrare cache în DiagnosticService
- `app/actions/admin-crud-actions.ts` - Integrare cache în Admin CRUD
- `lib/di/configurator.ts` - Înregistrare CacheService în DI Container

---

**Implementat de:** Cristian Cudla  
**Laborator:** 12 - Memory Cache  
**Data:** 2025  
**Framework:** Next.js 16 + TypeScript + Supabase

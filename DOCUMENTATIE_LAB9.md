# Laborator 9 - Implementare Ștergere Fizică și Logică

## Obiective Implementate

1. ✅ Implementare ștergere fizică (Hard Delete) pentru Diagnostics
2. ✅ Implementare ștergere logică (Soft Delete) pentru Users și Subscriptions
3. ✅ Actualizare query-uri pentru a exclude entitățile șterse logic

---

## 1. Ștergere Fizică (Hard Delete)

### Entitate: **Diagnostics**

**Motivație:** Diagnosticele nu sunt folosite ca cheie străină în alte tabele, deci pot fi șterse fizic fără a pierde istoricul aplicației.

### Implementare

**Fișier:** `app/actions/admin-crud-actions.ts`

```typescript
export async function deleteDiagnostic(diagnosticId: string) {
  const supabase = await createClient()
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    // Hard delete - physically remove from database
    const { error } = await supabase
      .from("diagnostics")
      .delete()
      .eq("id", diagnosticId)

    if (error) {
      console.log("[v0] Error hard-deleting diagnostic:", error, { diagnosticId })
      return { error: "Eroare la ștergerea diagnosticului" }
    }

    revalidatePath("/admin/diagnostics")
    console.log("[v0] Diagnostic hard-deleted (physical removal):", { diagnosticId })
    return { success: true, type: "hard" }
  } catch (error) {
    console.log("[v0] Error in deleteDiagnostic:", error, { diagnosticId })
    return { error: "Eroare la ștergerea diagnosticului" }
  }
}
```

**Caracteristici:**
- Elimină complet înregistrarea din baza de date
- Folosește `.delete()` pentru ștergere permanentă
- Returnează `type: "hard"` pentru identificare
- Revalidează cache-ul după ștergere

---

## 2. Ștergere Logică (Soft Delete)

### Entități: **Users (Profiles)** și **Subscriptions**

**Motivație:** Users și Subscriptions sunt chei străine pentru alte tabele (Diagnostics). Ștergerea lor fizică ar implica pierderea istoricului complet.

### Schema Baza de Date

**Scriptul SQL:** `scripts/009_add_soft_delete_columns.sql`

```sql
-- Add deleted_at column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to diagnostics (for future use)
ALTER TABLE public.diagnostics
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted_at ON public.subscriptions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_diagnostics_deleted_at ON public.diagnostics(deleted_at);

-- Update RLS policies to exclude soft-deleted records
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "subscriptions_select_all" ON public.subscriptions;
CREATE POLICY "subscriptions_select_all"
  ON public.subscriptions FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "diagnostics_select_own" ON public.diagnostics;
CREATE POLICY "diagnostics_select_own"
  ON public.diagnostics FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
```

### Implementare Ștergere Logică

**Fișier:** `app/actions/admin-crud-actions.ts`

```typescript
export async function deleteUser(userId: string) {
  try {
    const supabase = await createClient()
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      return { error: "Nu ai permisiuni de admin" }
    }

    // Soft delete - mark as deleted instead of removing from database
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error soft-deleting user:", error)
      return { error: "Eroare la ștergerea utilizatorului" }
    }

    console.log("[v0] User soft-deleted:", { userId })
    revalidatePath("/admin/users")
    return { success: true, type: "soft" }
  } catch (error) {
    console.error("[v0] Error in deleteUser:", error)
    return { error: error instanceof Error ? error.message : "Eroare la ștergerea utilizatorului" }
  }
}
```

**Caracteristici:**
- Setează `deleted_at` la timestamp-ul curent
- NU elimină înregistrarea din baza de date
- Returnează `type: "soft"` pentru identificare
- Păstrează toate relațiile și istoricul

### Implementare Restaurare

```typescript
export async function restoreUser(userId: string) {
  try {
    const supabase = await createClient()
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      return { error: "Nu ai permisiuni de admin" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: null })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error restoring user:", error)
      return { error: "Eroare la restaurarea utilizatorului" }
    }

    console.log("[v0] User restored:", { userId })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in restoreUser:", error)
    return { error: error instanceof Error ? error.message : "Eroare la restaurarea utilizatorului" }
  }
}
```

---

## 3. Actualizare Query-uri

### Excludere Entități Șterse Logic

Toate query-urile au fost actualizate pentru a exclude entitățile cu `deleted_at IS NOT NULL`.

#### Exemplu: getAllUsers()

```typescript
export async function getAllUsers() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      *,
      subscriptions (
        tier,
        is_active,
        free_diagnostics_used,
        free_diagnostics_limit
      )
    `)
    .is("deleted_at", null)  // Exclude deleted users
    .order("created_at", { ascending: false })

  // ...
}
```

#### Exemplu: getAllSubscriptions()

```typescript
export async function getAllSubscriptions() {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      profiles!inner (
        id,
        full_name,
        email
      )
    `)
    .is("deleted_at", null)              // Exclude deleted subscriptions
    .is("profiles.deleted_at", null)      // Exclude subscriptions of deleted users
    .order("created_at", { ascending: false })

  // ...
}
```

#### Exemplu: Statistics

```typescript
export async function getAdminStats() {
  // Count only active (not soft-deleted) users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null)

  // Get diagnostics from active users only
  const { data: diagnostics } = await supabase
    .from("diagnostics")
    .select("severity, profiles!inner(deleted_at)")
    .is("profiles.deleted_at", null)

  // ...
}
```

---

## 4. Interfață Utilizator

### Confirmări Diferite Pentru Fiecare Tip

**Users (Soft Delete):**
```typescript
if (!confirm(`Sigur vrei să ștergi logic utilizatorul ${email}?\n\nAcesta va fi marcat ca șters dar va rămâne în baza de date pentru istoric.`)) {
  return
}
```

**Diagnostics (Hard Delete):**
```typescript
if (!confirm("Sigur vrei să ștergi fizic acest diagnostic?\n\nAcesta va fi eliminat permanent din baza de date (HARD DELETE).")) {
  return
}
```

### Tooltipuri Explicative

```tsx
<Button
  title="Ștergere logică - utilizatorul va fi marcat ca șters"
>
  <Trash2 className="h-4 w-4" />
</Button>

<Button
  title="Ștergere fizică - diagnosticul va fi eliminat permanent"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## 5. Comparație: Soft Delete vs Hard Delete

| Aspect | Soft Delete (Users, Subscriptions) | Hard Delete (Diagnostics) |
|--------|-----------------------------------|---------------------------|
| **Operație** | UPDATE deleted_at = CURRENT_TIMESTAMP | DELETE FROM table WHERE id = ? |
| **Date în DB** | Rămân în baza de date | Sunt eliminate permanent |
| **Recuperare** | Posibilă prin UPDATE deleted_at = NULL | Imposibilă |
| **Istoric** | Păstrat complet | Pierdut |
| **Performanță** | Mai multe înregistrări în DB | Mai puține înregistrări |
| **Query-uri** | Trebuie filtrate cu WHERE deleted_at IS NULL | Nu necesită filtrare |
| **Use Case** | Entități cu relații (FK) | Entități fără relații |

---

## 6. Avantaje și Dezavantaje

### Soft Delete

**Avantaje:**
- ✅ Păstrează istoricul complet
- ✅ Permite restaurare rapidă
- ✅ Menține integritatea referențială
- ✅ Auditabilitate completă
- ✅ Previne pierderea accidentală de date

**Dezavantaje:**
- ❌ Baza de date crește în timp
- ❌ Query-urile devin mai complexe
- ❌ Necesită indexare pe deleted_at
- ❌ Trebuie gestionat în toate query-urile

### Hard Delete

**Avantaje:**
- ✅ Baza de date rămâne curată
- ✅ Query-uri mai simple
- ✅ Performanță mai bună
- ✅ Respectă GDPR (dreptul de a fi uitat)

**Dezavantaje:**
- ❌ Pierdere permanentă de date
- ❌ Imposibil de recuperat
- ❌ Poate rupe relații în cascadă
- ❌ Risc de ștergere accidentală

---

## 7. Best Practices Implementate

1. **Verificare Admin** - Toate operațiile de ștergere verifică permisiunile admin
2. **Confirmări Explicite** - UI cere confirmare diferită pentru fiecare tip
3. **Logging Comprehensiv** - Toate ștergările sunt loggate cu detalii
4. **Revalidare Cache** - Cache-ul este invalidat după modificări
5. **Error Handling** - Try-catch pe toate operațiile
6. **Type Safety** - Returnează tipul operației (`type: "soft" | "hard"`)
7. **RLS Policies** - Politici de securitate la nivel de bază de date

---

## 8. Teste Recomandate

### Test Soft Delete (Users)
1. Șterge un utilizator din panoul admin
2. Verifică că nu mai apare în lista utilizatorilor
3. Verifică în baza de date că deleted_at este setat
4. Verifică că diagnosticele utilizatorului NU apar în statistici
5. Restaurează utilizatorul (dacă funcția este implementată)

### Test Hard Delete (Diagnostics)
1. Șterge un diagnostic din panoul admin
2. Verifică că nu mai apare în listă
3. Verifică în baza de date că înregistrarea este complet eliminată
4. Încearcă să accesezi diagnosticul - ar trebui să dea eroare 404

---

## Concluzie

Implementarea respectă cerințele Laboratorului 9:
- ✅ **Exercițiul 1:** Ștergere fizică pentru Diagnostics
- ✅ **Exercițiul 2:** Ștergere logică pentru Users și Subscriptions
- ✅ Actualizare query-uri Get și GetAll pentru excludere entități șterse logic
- ✅ Documentație completă cu exemple de cod

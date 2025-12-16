"use server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const diagnosticSchema = z.object({
  diagnosis: z.string().describe("Detailed diagnosis of the car problem"),
  severity: z.enum(["low", "medium", "high", "critical"]).describe("Severity level of the issue"),
  recommendations: z.array(z.string()).describe("Step-by-step recommendations to fix the issue"),
  estimatedCost: z
    .object({
      min: z.number().describe("Minimum estimated cost in USD"),
      max: z.number().describe("Maximum estimated cost in USD"),
    })
    .describe("Estimated repair cost range"),
  urgency: z.string().describe("How urgent is this repair"),
  possibleCauses: z.array(z.string()).describe("Possible causes of the problem"),
  preventiveMeasures: z.array(z.string()).describe("How to prevent this in the future"),
})

export async function generateDiagnosis(data: {
  symptoms: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  requestImage?: boolean // Added flag to request part image
}) {
  try {
    console.log("[Diagnostics] Diagnostic request received:", {
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      hasSymptoms: !!data.symptoms,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[Diagnostics] User authentication failed:", userError)
      return { error: "Trebuie să fiți autentificat pentru a folosi diagnosticarea" }
    }

    console.log("[Diagnostics] Checking subscription status", { userId: user.id })
    // Check subscription and permissions
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (subError || !subscription) {
      console.error("[Diagnostics] Error fetching subscription:", subError, { userId: user.id })
      return { error: "Nu s-a găsit abonamentul" }
    }

    if (!subscription.is_active) {
      console.warn("[Diagnostics] Abonament inactiv", { userId: user.id })
      return { error: "Abonament inactiv" }
    }

    if (subscription.tier === "free") {
      const remaining = subscription.free_diagnostics_limit - subscription.free_diagnostics_used
      console.log("[Diagnostics] Free tier diagnostic check:", { userId: user.id, remaining })
      if (remaining <= 0) {
        console.warn("[Diagnostics] Ați atins limita de diagnosticări gratuite. Vă rugăm să faceți upgrade.", {
          userId: user.id,
        })
        return { error: "Ați atins limita de diagnosticări gratuite. Vă rugăm să faceți upgrade." }
      }
    }

    console.log("[Diagnostics] Generating AI diagnostic", { userId: user.id })
    // Generate AI diagnostic
    const { generateObject } = await import("ai")
    const { createGroq } = await import("@ai-sdk/groq")

    const groq = createGroq({
      apiKey: process.env.API_KEY_GROQ_API_KEY,
    })

    const vehicleInfo = `${data.vehicleYear || ""} ${data.vehicleMake || ""} ${data.vehicleModel || ""}`.trim()

    const { object: diagnostic } = await generateObject({
      model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
      schema: z.object({
        diagnosis: z.string(),
        severity: z.enum(["low", "medium", "high", "critical"]),
        estimated_cost_usd: z.string(),
        estimated_cost_ron: z.string(), // Added RON conversion
        urgency: z.string(),
        recommendations: z.array(z.string()),
        possible_causes: z.array(z.string()),
        preventive_measures: z.array(z.string()),
        main_part_name: z.string().optional(), // Added main part identification
      }),
      prompt: `Ești un sistem expert de diagnosticare auto. RĂSPUNDE EXCLUSIV ÎN LIMBA ROMÂNĂ.

Vehicul: ${vehicleInfo || "Vehicul necunoscut"}
Simptome: ${data.symptoms}

Oferă o analiză diagnostică completă în ROMÂNĂ cu:
1. Diagnosis (diagnoza) - explicație detaliată a problemei ÎN ROMÂNĂ
2. Severity (severitate) - unul dintre: low, medium, high, critical
3. Estimated cost USD - interval de cost în dolari (ex: "500-1500")
4. Estimated cost RON - interval de cost în lei românești (conversie: 1 USD = 4.5 RON, ex: "2250-6750 lei")
5. Urgency (urgență) - cât de repede trebuie rezolvată problema, ÎN ROMÂNĂ
6. Recommendations (recomandări) - 3-5 pași concreți pentru a rezolva problema, ÎN ROMÂNĂ
7. Possible causes (cauze posibile) - 2-4 cauze probabile, ÎN ROMÂNĂ
8. Preventive measures (măsuri preventive) - 2-3 moduri de a preveni problema în viitor, ÎN ROMÂNĂ
9. Main part name (numele piesei principale) - numele în engleză al piesei principale afectate pentru căutare imagine (ex: "fuel injector", "alternator", "brake pad")

IMPORTANT: Tot textul trebuie să fie în limba română, exceptând main_part_name care trebuie în engleză pentru căutare.`,
    })

    let partImageUrl = null
    if (data.requestImage && diagnostic.main_part_name) {
      partImageUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(
        `automotive ${diagnostic.main_part_name} part diagram`,
      )}`
    }

    // Save diagnostic to database
    const { data: saved, error: saveError } = await supabase
      .from("diagnostics")
      .insert({
        user_id: user.id,
        vehicle_make: data.vehicleMake || null,
        vehicle_model: data.vehicleModel || null,
        vehicle_year: data.vehicleYear || null,
        symptoms: data.symptoms,
        ai_diagnosis: diagnostic.diagnosis,
        severity: diagnostic.severity,
        estimated_cost: diagnostic.estimated_cost_ron, // Save RON cost
        ai_recommendations: JSON.stringify(diagnostic.recommendations),
      })
      .select()
      .single()

    if (saveError || !saved) {
      console.error("[Diagnostics] Error saving diagnostic to database:", saveError, { userId: user.id })
      return { error: "Eroare la salvarea diagnosticului" }
    }

    // Increment usage counter for free tier
    if (subscription.tier === "free") {
      await supabase
        .from("subscriptions")
        .update({
          free_diagnostics_used: subscription.free_diagnostics_used + 1,
        })
        .eq("user_id", user.id)
    }

    console.log("[Diagnostics] Diagnostic generated and saved successfully", {
      userId: user.id,
      diagnosticId: saved.id,
      hasImage: !!partImageUrl,
      tier: subscription.tier,
    })

    return {
      success: true,
      diagnostic: {
        id: saved.id,
        ai_diagnosis: diagnostic.diagnosis,
        severity: diagnostic.severity,
        estimatedCost: diagnostic.estimated_cost_ron, // Return RON cost
        estimatedCostUSD: diagnostic.estimated_cost_usd,
        urgency: diagnostic.urgency,
        recommendations: diagnostic.recommendations,
        possibleCauses: diagnostic.possible_causes,
        preventiveMeasures: diagnostic.preventive_measures,
        partImageUrl, // Include image URL if generated
        mainPartName: diagnostic.main_part_name,
        remainingDiagnostics:
          subscription.tier === "free"
            ? subscription.free_diagnostics_limit - subscription.free_diagnostics_used - 1
            : null,
      },
    }
  } catch (error) {
    console.error("[Diagnostics] Unexpected error in generateDiagnosis:", error)
    return { error: "Eroare neașteptată. Vă rugăm să încercați din nou." }
  }
}

export async function getUserDiagnostics(limit = 10) {
  try {
    console.log("[Diagnostics] Fetching user diagnostics with limit:", limit)
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[Diagnostics] User authentication failed:", userError)
      return { error: "Trebuie să fiți autentificat" }
    }

    const { data: diagnostics, error } = await supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[Diagnostics] Error fetching diagnostics:", error, { userId: user.id })
      return { error: "Eroare la încărcarea istoricului" }
    }

    console.log("[Diagnostics] User diagnostics retrieved:", {
      userId: user.id,
      count: diagnostics?.length || 0,
    })

    return { diagnostics: diagnostics || [] }
  } catch (error) {
    console.error("[Diagnostics] Error in getUserDiagnostics:", error)
    return { error: "Eroare la încărcarea istoricului" }
  }
}

export async function getSubscriptionStatus() {
  try {
    console.log("[Diagnostics] Checking subscription status")
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[Diagnostics] User authentication failed:", userError)
      return { error: "Trebuie să fiți autentificat" }
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("[Diagnostics] Error fetching subscription:", error, { userId: user.id })
      return { error: "Eroare la verificarea abonamentului" }
    }

    console.log("[Diagnostics] Subscription status retrieved:", { userId: user.id, tier: subscription.tier })
    return { subscription }
  } catch (error) {
    console.error("[Diagnostics] Error in getSubscriptionStatus:", error)
    return { error: "Eroare la verificarea abonamentului" }
  }
}

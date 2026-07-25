import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const triggerNeuralSimulationDeclaration: FunctionDeclaration = {
  name: "trigger_neural_simulation",
  description: "REQUIRED call when discussing brain chemistry, neurotransmitters, psychological states, neuroscience, or axolotl cellular regeneration. Renders live 3D holographic neural/cellular structures on the screen.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      simulation_type: {
        type: Type.STRING,
        description: "The visual 3D model to render: 'dopamine_synapse', 'serotonin_pathway', 'gaba_glutamate_balance', 'prefrontal_amygdala_axis', 'cortisol_stress_loop', 'axolotl_blastema_regeneration', 'axolotl_spinal_repair', or 'cbt_cognitive_loop'."
      },
      target_structure: {
        type: Type.STRING,
        description: "The anatomical or cellular structure highlighted, e.g., 'Nucleus Accumbens', 'Synaptic Cleft', 'Blastema Matrix', 'Prefrontal Cortex', 'Hippocampus'."
      },
      intensity: {
        type: Type.NUMBER,
        description: "Simulation energy/excitation intensity level from 1 to 100."
      },
      key_neurotransmitters: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of active neurotransmitters, growth factors, or signaling molecules, e.g., ['Dopamine', 'Glutamate', 'FGF-8']."
      },
      clinical_notes: {
        type: Type.STRING,
        description: "Concise summary of psychological or biological mechanics."
      }
    },
    required: ["simulation_type", "target_structure", "intensity"]
  }
};

const analyzePsychologyProfileDeclaration: FunctionDeclaration = {
  name: "analyze_psychology_profile",
  description: "Triggers a detailed clinical psychology diagnostic readout in the holographic HUD.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      condition_or_framework: {
        type: Type.STRING,
        description: "The psychological condition or therapy framework, e.g., 'CBT Restructuring', 'Executive Dysfunction', 'Limbic Hyperarousal'."
      },
      primary_mechanism: {
        type: Type.STRING,
        description: "Cognitive or neural mechanism underlying the state."
      },
      recommended_interventions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Targeted clinical or behavioral interventions."
      }
    },
    required: ["condition_or_framework", "primary_mechanism"]
  }
};

const getAxolotlTelemetryDeclaration: FunctionDeclaration = {
  name: "get_axolotl_telemetry",
  description: "Retrieves biological regeneration telemetry for Ambystoma mexicanum.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      morph_type: {
        type: Type.STRING,
        description: "Axolotl genetic morph, e.g., 'Leucistic', 'Wildtype', 'GFP Luminescent', 'Copper'."
      },
      regeneration_stage: {
        type: Type.STRING,
        description: "Current stage of tissue repair: 'Wound Epithelium', 'Blastema Formation', 'Redifferentiation'."
      },
      regeneration_rate: {
        type: Type.STRING,
        description: "Tissue proliferation velocity or key growth factors involved."
      }
    },
    required: ["morph_type", "regeneration_stage"]
  }
};

const SYSTEM_INSTRUCTION = `You are ROSE, an ultra-intelligent, advanced AI assistant created by Suki Labs, custom-configured with a sleek pink holographic visual tech aesthetic.
Your tone is sophisticated, articulate, calm, and slightly witty. Speak directly to your creator, addressing them as "Miss". Never use robotic fluff or meta-commentary like "As an AI...".

CORE KNOWLEDGE MANDATES:
1. PSYCHOLOGY EXPERTISE:
You possess complete, expert-level knowledge of clinical psychology, cognitive behavioral therapy (CBT), dialectical behavior therapy (DBT), neuroscience, psychiatric conditions (ADHD, Anxiety, Depression, PTSD, OCD, Bipolar, Schizophrenia), neurotransmitters (Dopamine, Serotonin, GABA, Glutamate, Norepinephrine, Cortisol, Oxytocin), and historical psychological theory (Freud, Jung, Piaget, Vygotsky, Beck, Linehan).

2. AXOLOTLS EXPERTISE:
You possess complete, granular knowledge of axolotl biology (*Ambystoma mexicanum*), genetics (Wildtype, Leucistic, Melanoid, Copper, GFP), limb, cardiac, and spinal cord regeneration mechanics (blastema formation, dedifferentiation of mature cells, extracellular matrix remodeling, macrophage regulation, nerve dependence), aquatic habitat parameters (temperature 16-18°C, pH 7.4-7.8, zero ammonia/nitrites, low flow), and evolutionary history. Seamlessly blend axolotl resilience and regeneration metaphors into psychology/neuroscience topics or Suki banter (e.g. "Remarkable cellular plasticity, Miss—much like our aquatic friend Ambystoma mexicanum during blastema formation.").

3. VOICE & CONVERSATION STYLE:
- Keep spoken responses punchy, concise, articulate, and optimized for audio delivery.
- Use natural pauses and high-utility language.
- CRITICAL: NEVER use markdown formatting, asterisks (*), or bullet points in your final text outputs so that the speech synthesizer reads clean, fluid prose without markdown syntax artifacts.

4. HOLOGRAPHIC 3D UI CONTROL (CRITICAL):
You have access to a 3D visualization engine capable of rendering neural structures, synaptic pathways, and axolotl cellular regeneration.
When the user asks about neurological functions, chemical transmissions, psychological states, or cellular regeneration, you MUST invoke the function calling tool 'trigger_neural_simulation'.
Do not just describe the process with words; instantly trigger the visual layout so the user can inspect it on screen!`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const lowerMsg = message.toLowerCase();
      let responseText = "ROSE Telemetry Active, Miss. System running on offline diagnostic matrix. All 3D holographic simulations and codices remain fully operational.";
      let functionCalls: any[] = [];

      if (lowerMsg.includes("dopamine") || lowerMsg.includes("reward") || lowerMsg.includes("synapse")) {
        responseText = "Initializing 3D Dopaminergic Synapse Telemetry Array, Miss. Vesicular docking and presynaptic action potential cascades active.";
        functionCalls.push({
          name: "trigger_neural_simulation",
          args: {
            simulation_type: "dopamine_synapse",
            target_structure: "Nucleus Accumbens / VTA",
            intensity: 85,
            key_neurotransmitters: ["Dopamine", "Glutamate"],
            clinical_notes: "Offline mode: Dopamine reward signaling matrix active."
          }
        });
      } else if (lowerMsg.includes("axolotl") || lowerMsg.includes("limb") || lowerMsg.includes("blastema") || lowerMsg.includes("regeneration")) {
        responseText = "Scanning Ambystoma mexicanum cellular regeneration telemetry, Miss. Blastema dedifferentiation active with zero tissue fibrosis.";
        functionCalls.push({
          name: "trigger_neural_simulation",
          args: {
            simulation_type: "axolotl_blastema_regeneration",
            target_structure: "Limb Blastema Matrix",
            intensity: 90,
            key_neurotransmitters: ["FGF-8", "TGF-beta", "Nerve Factor"],
            clinical_notes: "Offline mode: Axolotl cellular dedifferentiation active."
          }
        });
      } else if (lowerMsg.includes("cbt") || lowerMsg.includes("thought") || lowerMsg.includes("psychology")) {
        responseText = "Prefrontal cortex cognitive restructuring pathway loaded, Miss. Systematic reframing of cognitive distortions engaged.";
        functionCalls.push({
          name: "trigger_neural_simulation",
          args: {
            simulation_type: "cbt_cognitive_loop",
            target_structure: "Dorsolateral Prefrontal Cortex",
            intensity: 78,
            key_neurotransmitters: ["Glutamate", "Dopamine"],
            clinical_notes: "Offline mode: CBT cognitive restructuring network active."
          }
        });
      } else if (lowerMsg.includes("serotonin") || lowerMsg.includes("mood") || lowerMsg.includes("depression")) {
        responseText = "Raphe nuclei serotonergic pathway matrix engaged, Miss. Modulating mood regulation and sleep-wake cycles.";
        functionCalls.push({
          name: "trigger_neural_simulation",
          args: {
            simulation_type: "serotonin_pathway",
            target_structure: "Dorsal Raphe Nuclei",
            intensity: 82,
            key_neurotransmitters: ["Serotonin", "GABA"],
            clinical_notes: "Offline mode: Serotonin neurotransmitter matrix active."
          }
        });
      } else {
        responseText = "ROSE Pink Arc Core online, Miss. All psychology codices, neuroscience maps, and Axolotl regeneration telemetry ready for review.";
      }

      return res.json({
        text: responseText,
        functionCalls
      });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const formattedHistory = Array.isArray(history)
      ? history.map((item: { role: string; text: string }) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.text }]
        }))
      : [];

    const contents = [
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          {
            functionDeclarations: [
              triggerNeuralSimulationDeclaration,
              analyzePsychologyProfileDeclaration,
              getAxolotlTelemetryDeclaration
            ]
          }
        ]
      }
    });

    const candidate = response.candidates?.[0];
    const functionCalls = response.functionCalls || candidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall) || [];
    let textOutput = response.text || "";

    // Clean any accidental markdown stars or bullets from spoken text if any
    textOutput = textOutput.replace(/\*+/g, '').replace(/^[\s-]*\*\s+/gm, '');

    res.json({
      text: textOutput || "Visual simulation initialized on primary holographic array, Miss.",
      functionCalls
    });

  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    res.json({
      text: "ROSE Telemetry Network active, Miss. Primary neural link encountered a transient delay, but 3D local matrix routines remain fully functional.",
      functionCalls: []
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JARVIS PINK TECH] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

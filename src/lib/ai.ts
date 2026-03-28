import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Using gemini-2.0-flash for state-of-the-art speed and reasoning
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
});

/**
 * Generates a high-impact cold outreach email from Abhay Bansal
 */
export async function generateTailoredEmail(resumeText: string, jdText: string) {
  const prompt = `
    Identity: You are writing on behalf of Abhay Bansal.
    Target: A Hiring Manager or Recruiter for the specific role in the Job Description.
    Objective: Start a professional conversation by solving a problem or adding immediate value.

    Email Framework (The "Abhay Bansal" Signature Style):
    1. Subject Line: Must be hyper-relevant (e.g., "Engineering at [Company] // Solving [Specific Need]").
    2. The Hook: Open with a specific observation about their company's tech stack, a recent project, or growth trajectory. 
    3. The Proof: Map exactly 2 high-impact achievements from Abhay's RESUME that directly solve a pain point mentioned in the JD. 
    4. The Close: A low-friction, professional call-to-action (CTA) that asks for a brief conversation.
    5. Signature: Sincerely, Abhay Bansal.

    Strict Constraints:
    - Tone: Confident, data-driven, and respectful.
    - Style: No corporate "fluff" or generic greetings (No "I hope you are well").
    - Length: Under 110 words.
    - Formatting: Use <br/> for line breaks. No markdown (No bold/italics).
    - Output: Valid JSON.

    INPUT DATA:
    ABHAY'S RESUME: ${resumeText.slice(0, 5000)}
    TARGET JD: ${jdText.slice(0, 5000)}
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            subject: { type: SchemaType.STRING },
            body: { type: SchemaType.STRING },
          },
          required: ["subject", "body"],
        },
        temperature: 0.65, // Balanced for creativity and professional accuracy
      },
    });

    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("[GEMINI_GENERATE_ERROR]", err);
    throw new Error("Failed to generate high-conversion outreach.");
  }
}

/**
 * Routes the JD to the most relevant resume in Abhay's library
 */
export async function pickBestResume(
  jdText: string, 
  resumes: { id: string, category: string, text: string }[]
) {
  const prompt = `
    Analyze the following Job Description and select the most relevant resume from Abhay Bansal's library.
    
    JOB DESCRIPTION: 
    ${jdText.substring(0, 2500)}
    
    AVAILABLE RESUMES:
    ${resumes.map(r => `[RESUME_ID: ${r.id}] Category: ${r.category} | Highlights: ${r.text.substring(0, 500)}`).join("\n---\n")}
    
    Selection Criteria: Pick the resume that demonstrates the strongest technical proficiency in the primary technologies mentioned in the JD.
    Return ONLY the raw [RESUME_ID] string.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Near-zero for objective matching
      }
    });

    const id = result.response.text().trim();
    
    // Cross-reference to ensure we have a valid ID match
    const found = resumes.find(r => id.includes(r.id));
    return found ? found.id : resumes[0].id;
  } catch (err) {
    console.error("[GEMINI_ROUTING_ERROR]", err);
    return resumes[0].id;
  }
}
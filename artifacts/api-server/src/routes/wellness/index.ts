import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { textToSpeech } from "@workspace/integrations-openai-ai-server/audio";
import {
  GetSportRecommendationBody,
  GetFoodRecommendationBody,
  AnalyzeFoodImageBody,
  TextToSpeechBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/wellness/sport-recommendation", async (req, res) => {
  try {
    const body = GetSportRecommendationBody.parse(req.body);
    const { weight, height, age, gender, healthIssues = [], fitnessGoal, language } = body;

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const bmiRounded = Math.round(bmi * 10) / 10;

    let bmiCategory: string;
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal weight";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    const langInstruction = language === "ar"
      ? "IMPORTANT: Respond entirely in Arabic. All sport names, descriptions, benefits, and cautions must be in Arabic."
      : "Respond in English.";

    const prompt = `You are a certified fitness and health advisor. Based on the following profile, recommend 3-4 sports/exercises.

${langInstruction}

Profile:
- BMI: ${bmiRounded} (${bmiCategory})
- Age: ${age}
- Gender: ${gender}
- Health Issues: ${healthIssues.length > 0 ? healthIssues.join(", ") : "None"}
- Fitness Goal: ${fitnessGoal || "General health and fitness"}

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{
  "recommendations": [
    {
      "sport": "sport name",
      "description": "brief description",
      "duration": 30,
      "intensity": "low|moderate|high",
      "benefits": ["benefit1", "benefit2", "benefit3"]
    }
  ],
  "cautions": ["caution1 if any health issues", "caution2"]
}

Important rules:
- For heart conditions: only recommend low intensity, avoid high impact
- For joint problems: recommend swimming, cycling, yoga - avoid running
- For high blood pressure: low to moderate intensity only
- For diabetes: regular moderate exercise, avoid extreme intensity
- For obesity (BMI>30): low impact activities first
- For underweight: avoid excessive cardio, focus on strength
- Be specific and helpful, include safety cautions for health issues`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { recommendations: [], cautions: [] };
    }

    res.json({
      bmi: bmiRounded,
      bmiCategory,
      recommendations: parsed.recommendations ?? [],
      cautions: parsed.cautions ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Error in sport recommendation");
    res.status(500).json({ error: "Failed to get sport recommendation" });
  }
});

router.post("/wellness/food-recommendation", async (req, res) => {
  try {
    const body = GetFoodRecommendationBody.parse(req.body);
    const { sport, currentWeight, targetWeight, height, age, gender, healthIssues = [], language } = body;

    const heightM = height / 100;
    const bmi = currentWeight / (heightM * heightM);
    const isLosingWeight = targetWeight < currentWeight;
    const weightDiff = Math.abs(currentWeight - targetWeight);

    const foodLangInstruction = language === "ar"
      ? "IMPORTANT: Respond entirely in Arabic. All meal types, food names, portions, benefits, and tips must be in Arabic."
      : "Respond in English.";

    const prompt = `You are a certified nutritionist and sports dietitian. Create a meal plan for an athlete.

${foodLangInstruction}

Profile:
- Sport: ${sport}
- Current Weight: ${currentWeight} kg
- Target Weight: ${targetWeight} kg (${isLosingWeight ? "losing" : "gaining"} ${weightDiff.toFixed(1)} kg)
- BMI: ${(bmi).toFixed(1)}
- Age: ${age}, Gender: ${gender}
- Health Issues: ${healthIssues.length > 0 ? healthIssues.join(", ") : "None"}

Respond ONLY with valid JSON (no markdown) in this exact format:
{
  "dailyCalorieTarget": 2000,
  "meals": [
    {
      "mealType": "Breakfast",
      "foods": [
        {
          "name": "food name",
          "portion": "1 cup / 200g",
          "calories": 350,
          "protein": 25,
          "carbs": 40,
          "fat": 8,
          "benefits": "good for energy and muscle recovery"
        }
      ]
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}

Provide 4 meal types: Breakfast, Lunch, Dinner, and Snack. Each meal should have 2-3 food items. Calculate realistic calorie targets based on the sport and weight goals. Make foods complement the sport activity.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { dailyCalorieTarget: 2000, meals: [], tips: [] };
    }

    res.json({
      dailyCalorieTarget: parsed.dailyCalorieTarget ?? 2000,
      meals: parsed.meals ?? [],
      tips: parsed.tips ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Error in food recommendation");
    res.status(500).json({ error: "Failed to get food recommendation" });
  }
});

router.post("/wellness/analyze-food-image", async (req, res) => {
  try {
    const body = AnalyzeFoodImageBody.parse(req.body);
    const { imageBase64, language } = body;

    const imageUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const scanLangInstruction = language === "ar"
      ? "IMPORTANT: Respond entirely in Arabic. All food names, portions, ingredients, and the advice field must be written in Arabic."
      : "Respond in English.";

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
            {
              type: "text",
              text: `Analyze this food image and identify all food items visible. For each food, estimate calories, macronutrients and list the main ingredients.

${scanLangInstruction}

Respond ONLY with valid JSON (no markdown) in this exact format:
{
  "foods": [
    {
      "name": "food name",
      "estimatedPortion": "1 cup / 200g",
      "calories": 350,
      "protein": 15,
      "carbs": 45,
      "fat": 10,
      "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
    }
  ],
  "totalCalories": 450,
  "advice": "brief nutritional advice about this meal"
}

Be realistic with portions and calorie estimates. Always include 3-6 main ingredients per food item. If you cannot identify specific foods clearly, still provide best estimates.`,
            },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        foods: [],
        totalCalories: 0,
        confidence: "low",
        advice: "Could not analyze the image clearly.",
      };
    }

    res.json({
      foods: parsed.foods ?? [],
      totalCalories: parsed.totalCalories ?? 0,
      confidence: parsed.confidence ?? "low",
      advice: parsed.advice ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Error analyzing food image");
    res.status(500).json({ error: "Failed to analyze food image" });
  }
});

router.post("/wellness/tts", async (req, res) => {
  try {
    const body = TextToSpeechBody.parse(req.body);
    const { text } = body;

    const buffer = await textToSpeech(text, "nova", "mp3");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (err) {
    req.log.error({ err }, "Error in TTS");
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

export default router;

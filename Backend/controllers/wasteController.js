import WasteScan from '../models/WasteScan.js';
import User from '../models/User.js';

// Gemini API call helper
const analyzeImageWithGemini = async (base64Image, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an expert waste classification AI for GreenCare Rwanda, a waste management system. 
  Analyze this image and classify the waste material shown.
  
  Respond ONLY in the following JSON format (no markdown, no extra text):
  {
    "wasteType": "organic|inorganic|hazardous|recyclable|unknown",
    "confidence": <number 0-100>,
    "detectedItems": ["item1", "item2"],
    "recommendation": "<clear instruction on where to place this waste>",
    "binColor": "<color of the correct bin>",
    "binLabel": "<label/section name for the bin>",
    "reasoning": "<brief explanation of why this is classified this way>",
    "tips": "<eco-friendly tips for this type of waste>"
  }
  
  Classification guide:
  - organic: food waste, vegetable peels, fruit scraps, garden waste, paper (uncoated), coffee grounds, eggshells → Green bin (Organic Section)
  - inorganic: plastic bottles, glass, metal cans, synthetic packaging, non-recyclable plastics → Blue bin (Inorganic Section)
  - recyclable: clean cardboard, clean paper, aluminum, glass bottles, PET plastics → Yellow bin (Recyclable Section)
  - hazardous: batteries, electronics, chemicals, paint, medical waste → Red bin (Hazardous Section)
  - unknown: if the image is unclear or not waste-related`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini API request failed');
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('No response from Gemini API');
  }

  let cleaned = rawText.trim();
  
  // Extract JSON block from potential conversational wrapper or markdown
  const jsonStart = cleaned.match(/[\{\[]/);
  if (jsonStart) {
    const startIndex = jsonStart.index;
    const endChar = cleaned[startIndex] === '{' ? '}' : ']';
    const endIndex = cleaned.lastIndexOf(endChar);
    if (endIndex > startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
  }

  try {
    return { parsed: JSON.parse(cleaned), raw: rawText };
  } catch (err) {
    console.error('Failed JSON parse. Cleaned Text:', cleaned, '\nRaw Text:', rawText);
    throw new Error(`Failed to parse Gemini response as JSON: ${err.message}`);
  }
};

// POST /api/waste/scan
export const scanWaste = async (req, res, next) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image data (base64) is required' });
    }

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const resolvedMime = mimeType || 'image/jpeg';
    if (!supportedTypes.includes(resolvedMime)) {
      return res.status(400).json({ success: false, message: 'Unsupported image type. Use JPEG, PNG, WEBP or GIF.' });
    }

    // Strip data URI prefix if frontend sends it
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Call Gemini
    const { parsed, raw } = await analyzeImageWithGemini(base64Data, resolvedMime);

    // Save the scan record (classification only — no points awarded here)
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalWasteScans: 1 } });

    const scan = await WasteScan.create({
      resident: req.user.id,
      imageUrl: `scan_${Date.now()}`, // placeholder; integrate cloud storage (S3/Cloudinary) later
      wasteType: parsed.wasteType || 'unknown',
      confidence: parsed.confidence || 0,
      recommendation: parsed.recommendation || 'Please consult your local waste authority.',
      binColor: parsed.binColor || 'unknown',
      detectedItems: parsed.detectedItems || [],
      rawGeminiResponse: raw,
    });

    res.status(200).json({
      success: true,
      message: 'Waste scan completed successfully',
      data: {
        scanId: scan._id,
        wasteType: parsed.wasteType,
        confidence: parsed.confidence,
        detectedItems: parsed.detectedItems,
        recommendation: parsed.recommendation,
        binColor: parsed.binColor,
        binLabel: parsed.binLabel,
        reasoning: parsed.reasoning,
        tips: parsed.tips,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/waste/history
export const getScanHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      WasteScan.find({ resident: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-rawGeminiResponse'),
      WasteScan.countDocuments({ resident: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        scans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/waste/scan/:id
export const getScanById = async (req, res, next) => {
  try {
    const scan = await WasteScan.findOne({ _id: req.params.id, resident: req.user.id }).select('-rawGeminiResponse');

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan record not found' });
    }

    res.status(200).json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};

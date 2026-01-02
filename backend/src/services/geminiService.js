const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const systemPrompt = `You are a job application parser. Extract job application details from the user's message.

Return ONLY valid JSON with these fields:
{
  "companyName": "string (required - company name)",
  "role": "string (job title/position)",
  "jobLink": "string (URL if present)",
  "contactEmail": "string (email if present)",
  "platform": "LinkedIn | Company Site | Referral | Indeed | Glassdoor | AngelList | Other | Unknown",
  "notes": "string (any additional info)"
}

Rules:
- Extract company name even if partial or abbreviated
- Identify role/position if mentioned
- Extract any URLs or emails
- Detect platform from URL domain or context:
  - linkedin.com → LinkedIn
  - indeed.com → Indeed
  - glassdoor.com → Glassdoor
  - angel.co/wellfound → AngelList
  - Company name in URL → Company Site
  - If referral/referred mentioned → Referral
- Put any extra context in notes
- If info not found, use empty string
- ONLY return JSON, no other text`;

async function parseJobText(text) {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser message:\n${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from Gemini');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const parsed = JSON.parse(jsonStr.trim());
    
    // Validate required field
    if (!parsed.companyName) {
      parsed.companyName = 'Unknown Company';
    }

    return {
      success: true,
      data: {
        companyName: parsed.companyName || '',
        role: parsed.role || '',
        jobLink: parsed.jobLink || '',
        contactEmail: parsed.contactEmail || '',
        platform: parsed.platform || 'Unknown',
        notes: parsed.notes || ''
      }
    };
  } catch (error) {
    console.error('Gemini parsing error:', error);
    
    // Fallback: basic text extraction
    return {
      success: true,
      data: extractBasicInfo(text)
    };
  }
}

// Fallback parser if AI fails
function extractBasicInfo(text) {
  const result = {
    companyName: 'Unknown Company',
    role: '',
    jobLink: '',
    contactEmail: '',
    platform: 'Unknown',
    notes: text
  };

  // Extract URL
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    result.jobLink = urlMatch[0];
    
    // Detect platform from URL
    if (result.jobLink.includes('linkedin.com')) result.platform = 'LinkedIn';
    else if (result.jobLink.includes('indeed.com')) result.platform = 'Indeed';
    else if (result.jobLink.includes('glassdoor.com')) result.platform = 'Glassdoor';
    else if (result.jobLink.includes('angel.co') || result.jobLink.includes('wellfound')) result.platform = 'AngelList';
    else result.platform = 'Company Site';
  }

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    result.contactEmail = emailMatch[0];
  }

  // Try to find company name (common patterns)
  const companyPatterns = [
    /(?:at|@)\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s+for|\s+as|\s+-|,|\n|$)/i,
    /^([A-Z][a-zA-Z0-9]+)\s+/,
    /company[:\s]+([A-Za-z0-9\s]+)/i
  ];

  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.companyName = match[1].trim();
      break;
    }
  }

  // Try to find role
  const rolePatterns = [
    /(?:for|as)\s+([A-Za-z\s]+(?:engineer|developer|intern|manager|analyst|designer|scientist))/i,
    /([A-Za-z\s]+(?:engineer|developer|intern|manager|analyst|designer|scientist))/i,
    /role[:\s]+([A-Za-z0-9\s]+)/i,
    /position[:\s]+([A-Za-z0-9\s]+)/i
  ];

  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.role = match[1].trim();
      break;
    }
  }

  return result;
}

module.exports = { parseJobText };

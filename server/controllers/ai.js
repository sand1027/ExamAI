const axios = require("axios");

exports.generateQuestions = async (req, res) => {
  try {
    const { subject, topic, testType, numQuestions } = req.body;
    const professorId = req.user.id;

    // Validate input
    if (!subject || !topic || !testType || !numQuestions) {
      return res.status(400).json({
        success: false,
        message: "Subject, topic, testType, and numQuestions are required",
      });
    }

    if (!["objective", "subjective", "practical"].includes(testType)) {
      return res.status(400).json({
        success: false,
        message: "testType must be 'objective', 'subjective', or 'practical'",
      });
    }

    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({
        success: false,
        message: "Number of questions must be between 1 and 20",
      });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key is not configured",
      });
    }

    // Define prompts based on testType
    let systemPrompt;
    if (testType === "objective") {
      systemPrompt = `Generate ${numQuestions} multiple-choice questions about ${subject} focusing on ${topic}. 
        Format each question as follows:
        Q: [question]
        A: [option]
        B: [option]
        C: [option]
        D: [option]
        Correct: [letter]
        
        Ensure exactly one correct answer per question. Make questions challenging but fair.`;
    } else if (testType === "subjective") {
      systemPrompt = `Generate ${numQuestions} subjective, open-ended questions about ${subject} focusing on ${topic}. 
        Format each question as follows:
        Q: [question]
        A: [descriptive answer]
        
        Questions should require detailed, thoughtful responses. Provide a clear and accurate answer for each question.`;
    } else {
      systemPrompt = `Generate ${numQuestions} practical, programming-related questions about ${subject} focusing on ${topic}. 
        Format each question as follows:
        Q: [question]
        A: [code snippet or detailed explanation]
        
        Questions should involve writing code or explaining code solutions, suitable for a programming environment. Provide a correct and functional answer for each question.`;
    }

    // Make request to OpenRouter API
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate ${numQuestions} ${testType} questions about ${subject} focusing on ${topic}.`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "CareerConnectExam",
          },
        }
      );

      const generatedContent = response.data.choices[0].message.content;

      // Parse generated questions
      const questions = [];
      const questionBlocks = generatedContent.split(/Q: /).slice(1);

      questionBlocks.forEach((block, index) => {
        const lines = block
          .trim()
          .split("\n")
          .filter((line) => line.trim());
        if (testType === "objective" && lines.length < 6) {
          throw new Error("Invalid objective question format");
        }
        if (
          (testType === "subjective" || testType === "practical") &&
          lines.length < 2
        ) {
          throw new Error(`Invalid ${testType} question format`);
        }

        const questionText = lines[0].trim();
        const question = {
          qid: index + 1,
          question: questionText,
        };

        if (testType === "objective") {
          const optionA = lines[1].replace(/^A: /, "").trim();
          const optionB = lines[2].replace(/^B: /, "").trim();
          const optionC = lines[3].replace(/^C: /, "").trim();
          const optionD = lines[4].replace(/^D: /, "").trim();
          const correct = lines[5].replace(/^Correct: /, "").trim();

          question.options = {
            a: optionA,
            b: optionB,
            c: optionC,
            d: optionD,
          };
          question.answer = correct;
        } else {
          const answer = lines.slice(1).join("\n").replace(/^A: /, "").trim();
          question.answer = answer;
        }

        questions.push(question);
      });

      res.status(200).json({
        success: true,
        data: {
          questions,
        },
      });
    } catch (apiError) {
      console.error(
        "OpenRouter API error:",
        apiError.response?.data || apiError.message
      );
      throw new Error("Failed to generate questions from OpenRouter API");
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      success: false,
      message: "Error generating questions",
      error: error.message,
    });
  }
};

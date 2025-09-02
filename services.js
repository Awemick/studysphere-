// services.js
const OCR_SPACE_API_KEY = 'K85308176588957';
const HUGGING_FACE_API_KEY = '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';

export const ocrService = {
  async extractTextFromImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('apikey', OCR_SPACE_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    try {
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage.join(', '));
      }
      return data.ParsedResults[0].ParsedText;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }
};

export const aiService = {
  async generateFlashcards(text) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/google/flan-t5-large',
        {
          headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` },
          method: 'POST',
          body: JSON.stringify({
            inputs: `Generate flashcard questions and answers from the following text. Format as JSON: [{"question": "Q1", "answer": "A1"}]. Text: ${text.substring(0, 1000)}`
          }),
        }
      );
      const result = await response.json();
      if (result.error) throw new Error(result.error);

      const jsonMatch = result[0].generated_text.match(/\[.*\]/s);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);

      return this.generateSimpleFlashcards(text);
    } catch (error) {
      console.error('Hugging Face API Error:', error);
      return this.generateSimpleFlashcards(text);
    }
  },

  generateSimpleFlashcards(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.length > 10);
    const flashcards = [];

    for (let i = 0; i < Math.min(sentences.length, 5); i++) {
      const sentence = sentences[i].trim();
      if (sentence.length < 15) continue;

      const words = sentence.split(' ');
      const keyTermIndex = Math.floor(words.length / 2);
      const keyTerm = words[keyTermIndex];
      words[keyTermIndex] = '______';

      flashcards.push({
        question: words.join(' ') + '?',
        answer: keyTerm
      });
    }
    return flashcards;
  }
};

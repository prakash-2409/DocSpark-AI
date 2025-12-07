"""
AI processing module for text summarization and rewriting
"""
import os
from typing import Dict, List
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client (if API key is available)
client = None
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def process_text_with_ai(text: str) -> Dict[str, any]:
    """
    Process text with AI to generate summary, bullet points, and rewritten text
    
    Args:
        text: Original text to process
    
    Returns:
        Dictionary containing summary, bullet_points, and rewritten_text
    """
    if not client:
        # Return mock data if OpenAI API key is not configured
        return _generate_mock_response(text)
    
    try:
        # Generate summary
        summary = await _generate_summary(text)
        
        # Generate bullet points
        bullet_points = await _generate_bullet_points(text)
        
        # Generate rewritten text
        rewritten_text = await _rewrite_text(text)
        
        return {
            "summary": summary,
            "bullet_points": bullet_points,
            "rewritten_text": rewritten_text
        }
    except Exception as e:
        print(f"Error in AI processing: {str(e)}")
        # Fallback to mock data if API call fails
        return _generate_mock_response(text)


async def _generate_summary(text: str) -> str:
    """Generate a concise summary of the text"""
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates concise summaries."},
                {"role": "user", "content": f"Please provide a concise summary of the following text:\n\n{text[:4000]}"}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Error generating summary: {str(e)}")


async def _generate_bullet_points(text: str) -> List[str]:
    """Generate bullet points from the text"""
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts key points from text."},
                {"role": "user", "content": f"Please extract the key points from the following text as a bullet point list. Return only the bullet points, one per line, without any numbering:\n\n{text[:4000]}"}
            ],
            max_tokens=500,
            temperature=0.7
        )
        content = response.choices[0].message.content.strip()
        # Parse bullet points
        bullet_points = [line.strip().lstrip('-•*').strip() for line in content.split('\n') if line.strip()]
        return bullet_points
    except Exception as e:
        raise Exception(f"Error generating bullet points: {str(e)}")


async def _rewrite_text(text: str) -> str:
    """Rewrite and enhance the text"""
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that rewrites and enhances text to make it more clear, professional, and engaging."},
                {"role": "user", "content": f"Please rewrite and enhance the following text to make it more clear, professional, and engaging:\n\n{text[:4000]}"}
            ],
            max_tokens=1000,
            temperature=0.8
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Error rewriting text: {str(e)}")


def _generate_mock_response(text: str) -> Dict[str, any]:
    """
    Generate mock AI responses when OpenAI API is not available
    This allows the app to work without an API key for demonstration purposes
    """
    words = text.split()
    word_count = len(words)
    
    # Generate mock summary (first 50 words or less)
    summary_words = min(50, word_count)
    summary = " ".join(words[:summary_words])
    if word_count > summary_words:
        summary += "..."
    
    # Generate mock bullet points (extract some sentences)
    sentences = text.split('.')
    bullet_points = []
    for i, sentence in enumerate(sentences[:5]):
        cleaned = sentence.strip()
        if cleaned and len(cleaned) > 10:
            bullet_points.append(cleaned)
    
    if not bullet_points:
        bullet_points = [
            "Key point extracted from the document",
            "Another important aspect mentioned",
            "Additional detail from the content"
        ]
    
    # Generate mock rewritten text (capitalize first letter of each sentence)
    rewritten = text
    if len(rewritten) > 500:
        rewritten = rewritten[:500] + "...\n\n[Note: This is a demo mode. Configure OpenAI API key for full AI-powered rewriting.]"
    
    return {
        "summary": f"{summary}\n\n[Note: This is a demo mode. Configure OpenAI API key for AI-powered summaries.]",
        "bullet_points": bullet_points,
        "rewritten_text": rewritten
    }

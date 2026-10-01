from typing import List
from google import genai
from app.config import settings
from app.models.check_in import CheckIn

def generate_insight_from_checkins(check_ins: List[CheckIn]) -> str:
    if not check_ins:
        return "Start checking in daily to receive personalized insights about your wellbeing."
        
    if not settings.GEMINI_API_KEY:
        return "AI insights are currently disabled."
        
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    # Format the data for the LLM
    data_str = "Recent Check-ins:\n"
    for ci in check_ins:
        data_str += f"- Date: {ci.completed_at.strftime('%Y-%m-%d')}, Mood: {ci.mood.value}, Stress: {ci.stress.value}, Sleep: {ci.sleep.value}, Tags: {','.join([t.value for t in ci.tags])}\n"
        
    prompt = f"""
    You are an empathetic, professional AI wellbeing assistant for university students.
    Look at the student's recent daily check-in data and provide ONE short, insightful sentence (max 20 words) 
    noticing a trend or offering a supportive observation. Focus on correlations between mood, stress, sleep, and tags if visible. 
    Do not give medical advice. Be supportive and direct.
    
    {data_str}
    
    Insight:
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip().replace("\"", "")
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "Your recent check-ins show you've been consistent. Keep observing your patterns!"

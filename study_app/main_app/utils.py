import PyPDF2
from openai import OpenAI
from django.conf import settings
import json
import re
import random

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def process_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()

    # Generate summary
    summary = generate_summary(text)
    
    # Extract key concepts from the entire document
    key_concepts = extract_key_concepts(text)
    
    # Generate topics and subtopics
    topics = generate_topics_and_subtopics(text, key_concepts)
    
    # Generate flashcards for all key concepts
    flashcards = generate_flashcards(key_concepts, text)

    #mcqs = generate_mcqs(key_concepts, text)

    # Log for debugging
    #print(f"Flashcards generated: {flashcards}"
    return summary, key_concepts, topics, flashcards


def generate_summary(text):
    prompt = f"Summarize the following text in 200 words:\n\n{text[:4000]}..."
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes text."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in generate_summary: {str(e)}")
        return "An error occurred while generating the summary."

def extract_key_concepts(text):
    prompt = f"Extract exactly 6 key concepts from the following text. Present each concept as a short phrase with 6 to 10 words:\n\n{text[:4000]}..."
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts key concepts from text."},
                {"role": "user", "content": prompt}
            ]
        )
        concepts = response.choices[0].message.content.strip().split('\n')
        return [concept.strip() for concept in concepts if concept.strip()][:6]  # Ensure we have exactly 6 concepts
    except Exception as e:
        print(f"Error in extract_key_concepts: {str(e)}")
        return []



def clean_json_response(response_text):
    """
    Attempts to fix common JSON formatting issues in a GPT response.
    """
    # Remove any text before the first '{' and after the last '}'
    response_text = re.search(r'{.*}', response_text, re.DOTALL)
    
    if response_text:
        response_text = response_text.group()
    else:
        return None  # No valid JSON-like content found
    
    # Additional cleaning steps can be added here
    return response_text

def generate_topics_and_subtopics(text, key_concepts):
    topics = []
    
    for concept in key_concepts:
        prompt = f"""
            For the key concept '{concept}', based on the given '{text[:2000]}', provide:
            1. A detailed explanation limiting to 100 words
            2. At least 3 subtopics (more if relevant)

            Format your response strictly as a valid JSON object with the following structure:
            {{
                "explanation": "Detailed explanation here",
                "subtopics": [
                    {{"title": "Subtopic 1" }},
                    {{"title": "Subtopic 2" }},
                    ...
                ]
            }}

            Make sure the JSON is valid and contains no syntax errors.
            """

        
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that explains concepts and generates structured information."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            result = response.choices[0].message.content
            
            # Clean and validate JSON response
            cleaned_result = clean_json_response(result)
            
            if cleaned_result:
                try:
                    parsed_result = json.loads(cleaned_result)
                except json.JSONDecodeError:
                    print(f"Still invalid JSON after cleaning: {cleaned_result}")
                    parsed_result = {"explanation": "Error parsing JSON", "subtopics": []}
            else:
                print(f"No JSON found in response: {result}")
                parsed_result = {"explanation": "Error extracting JSON", "subtopics": []}
            
            topics.append({
                'title': concept,
                'description': parsed_result.get('explanation', "No explanation provided"),
                'subtopics': parsed_result.get('subtopics', []),
                'key_concept': concept
            })
        except Exception as e:
            print(f"Error in generate_topics_and_subtopics for concept {concept}: {str(e)}")
            topics.append({
                'title': concept,
                'description': "An error occurred while processing this concept.",
                'subtopics': [],
                'key_concept': concept
            })
    
    return topics



def generate_flashcards(key_concepts, text):
    all_flashcards = []  # List to store flashcards for all concepts
    
    for concept in key_concepts:
        prompt = f"""
        Generate between 1 and 5 question-answer pairs for the key concept '{concept}' based on the following text:

        {text[:2000]}

        Each flashcard should be formatted as:
        Q: [Question]
        A: [Answer]

        If you think fewer than 5 questions are sufficient to cover the concept, generate fewer.
        """
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates educational flashcards."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            result = response.choices[0].message.content
            
            # Parse the generated questions and answers
            qa_pairs = result.split("\n\n")
            
            flashcards_for_concept = []
            for pair in qa_pairs:
                if "Q:" in pair and "A:" in pair:
                    question, answer = pair.split("A:")
                    flashcards_for_concept.append({
                        'question': question.replace("Q:", "").strip(),
                        'answer': answer.strip(),
                        'key_concept': concept  # Include key concept to map later
                    })
            
            # Ensure no more than 5 flashcards per concept
            all_flashcards.extend(flashcards_for_concept[:5])
        
        except Exception as e:
            print(f"Error generating flashcards for concept '{concept}': {str(e)}")
    
    return all_flashcards  # Return flashcards for all key concepts



def convert_flashcards_to_mcqs(flashcards, num_questions=3):
    mcqs = []
    flashcards_copy = flashcards.copy()
    random.shuffle(flashcards_copy)
    
    for flashcard in flashcards_copy[:num_questions]:
        correct_answer = flashcard['answer']
        
        # Generate dummy options
        dummy_options = [fc['answer'] for fc in flashcards if fc['answer'] != correct_answer]
        dummy_options = random.sample(dummy_options, min(3, len(dummy_options)))
        
        # If we don't have enough dummy options, generate some
        while len(dummy_options) < 3:
            dummy_option = f"Dummy option {len(dummy_options) + 1}"
            dummy_options.append(dummy_option)
        
        options = [correct_answer] + dummy_options
        random.shuffle(options)
        
        mcq = {
            'question': flashcard['question'],
            'correct_answer': correct_answer,
            'options': options
        }
        mcqs.append(mcq)
    
    return mcqs
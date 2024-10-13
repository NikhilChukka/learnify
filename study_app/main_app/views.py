from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from .models import Document, Topic, Flashcard, MCQ
from .utils import process_pdf, convert_flashcards_to_mcqs
from collections import defaultdict
from django.utils.text import slugify
import json
from django.core.serializers.json import DjangoJSONEncoder
import random
from django.http import JsonResponse
from django.views.generic import TemplateView

class HomeView(View):
    def get(self, request):
        return render(request, 'main_app/home.html')

    def post(self, request):
        file = request.FILES.get('pdf_file')
        if file:
            if file.size > 10 * 1024 * 1024:  # 10MB limit
                return render(request, 'main_app/home.html', {'error': 'File size exceeds 10MB limit.'})
            
            if not file.name.lower().endswith('.pdf'):
                return render(request, 'main_app/home.html', {'error': 'Only PDF files are allowed.'})
            try:
                # Create a document record in the database
                document = Document.objects.create(title=file.name, file=file)
                
                # Call process_pdf to get summary, key concepts, topics, and flashcards
                summary, key_concepts, topics, flashcards = process_pdf(document.file.path)
                
                # Save summary and key concepts in the document
                document.summary = summary
                document.key_concepts = key_concepts
                document.save()
                
                # Save topics first
                topic_map = {}  # Dictionary to map key_concept to topic objects
                for topic_data in topics:
                    topic = Topic.objects.create(
                        document=document, 
                        title=topic_data['title'], 
                        description=topic_data['description'],
                        key_concept=topic_data['key_concept'],
                        subtopics=topic_data['subtopics']
                    )
                    # Map each key concept to its corresponding topic
                    topic_map[topic_data['key_concept']] = topic
                
                # Log topics created
                print(f"Topics created: {topic_map.keys()}")
                
                # Save flashcards by finding the correct topic for each flashcard
                for fc_data in flashcards:
                    # Use the key concept from flashcard data to get the correct topic
                    related_topic = topic_map.get(fc_data['key_concept'])
                    if related_topic:
                        Flashcard.objects.create(topic=related_topic, question=fc_data['question'], answer=fc_data['answer'])
                        print(f"Flashcard created for topic {related_topic.title}: {fc_data['question']} - {fc_data['answer']}")
                    else:
                        print(f"Could not find topic for key concept: {fc_data['key_concept']}")
                
                return redirect('summary', document_id=document.id)
            except Exception as e:
                return render(request, 'main_app/home.html', {'error': f"An error occurred while processing the file: {str(e)}"})
        
        return render(request, 'main_app/home.html', {'error': 'Please upload a PDF file.'})




class SummaryView(View):
    def get(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id)
            topics_by_concept = defaultdict(list)
            for topic in document.topics.all():
                topics_by_concept[slugify(topic.key_concept)].append(topic)
            context = {
                'document': document,
                'topics_by_concept': dict(topics_by_concept)
            }
            return render(request, 'main_app/summary.html', context)
        except Document.DoesNotExist:
            return render(request, 'main_app/home.html', {'error': 'Document not found.'})

# class FlashcardsView(View):
#     def get(self, request, topic_id):
#         try:
#             topic = Topic.objects.get(id=topic_id)
#             flashcards = list(topic.flashcards.values('question', 'answer'))
#             flashcards_json = json.dumps(flashcards, cls=DjangoJSONEncoder)
#             return render(request, 'main_app/flashcards.html', {
#                 'topic': topic,
#                 'flashcards': flashcards_json
#             })
#         except Topic.DoesNotExist:
#             return render(request, 'main_app/home.html', {'error': 'Topic not found.'})
        

        

class QuizView(View):
    def get(self, request):
        # Get all flashcards
        all_flashcards = list(Flashcard.objects.all())
        
        # Randomly select 5 flashcards (or less if there aren't 5)
        selected_flashcards = random.sample(all_flashcards, min(5, len(all_flashcards)))
        
        # Prepare quiz questions
        quiz_questions = []
        for flashcard in selected_flashcards:
            # Get 3 random wrong answers
            wrong_answers = [fc.answer for fc in all_flashcards if fc.answer != flashcard.answer]
            wrong_answers = random.sample(wrong_answers, min(3, len(wrong_answers)))
            
            # Combine correct and wrong answers, then shuffle
            options = [flashcard.answer] + wrong_answers
            random.shuffle(options)
            
            quiz_questions.append({
                'question': flashcard.question,
                'options': options,
                'correct_answer': flashcard.answer
            })
        
        context = {
            'quiz_questions': quiz_questions
        }
        return render(request, 'main_app/quiz.html', context)

    def post(self, request):
        submitted_answers = request.POST
        correct_answers = 0
        total_questions = 0

        for key, question in submitted_answers.items():
            if key.startswith('question_'):
                total_questions += 1
                answer_key = f'answer_{key.split("_")[1]}'
                user_answer = submitted_answers.get(answer_key)
                
                # Get all flashcards with this question
                flashcards = Flashcard.objects.filter(question=question)
                
                # Check if the user's answer matches any of the correct answers
                if flashcards.filter(answer=user_answer).exists():
                    correct_answers += 1

        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        context = {
            'score': round(score, 2),  # Round to 2 decimal places
            'correct_answers': correct_answers,
            'total_questions': total_questions
        }
        return render(request, 'main_app/quiz_results.html', context)
    
class FlashcardsView(View):
    def get(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)
        flashcards = list(topic.flashcards.values('question', 'answer'))
        
        # Debugging: Print the number of flashcards and the first flashcard
        print(f"Number of flashcards: {len(flashcards)}")
        if flashcards:
            print(f"First flashcard: {flashcards[0]}")
        
        flashcards_json = json.dumps(flashcards, cls=DjangoJSONEncoder)
        
        context = {
            'topic': topic,
            'flashcards': flashcards_json
        }
        return render(request, 'main_app/flashcards.html', context)
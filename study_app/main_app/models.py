from django.db import models
from django.db.models import JSONField

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    summary = models.TextField()
    key_concepts = models.JSONField(default=list)
    #mcqs = models.JSONField(default=list)


class Topic(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=255)
    description = models.TextField()
    key_concept = models.CharField(max_length=255, default="Unspecified Concept")
    subtopics = JSONField(default=list)

class Flashcard(models.Model):
    topic = models.ForeignKey('Topic', on_delete=models.CASCADE, related_name='flashcards')
    question = models.TextField()
    answer = models.TextField()

    class Meta:
        unique_together = ['topic', 'question']

    def __str__(self):
        return self.question

class MCQ(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='mcqs')
    question = models.TextField()
    correct_answer = models.CharField(max_length=255)
    options = JSONField(default=list)
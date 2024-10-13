from django.urls import path
from .views import HomeView, SummaryView, FlashcardsView, QuizView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('summary/<int:document_id>/', SummaryView.as_view(), name='summary'),
    path('flashcards/<int:topic_id>/', FlashcardsView.as_view(), name='flashcards'),
    path('quiz/', QuizView.as_view(), name='quiz'),
]
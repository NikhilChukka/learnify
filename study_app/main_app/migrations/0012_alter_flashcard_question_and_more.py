from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0011_alter_flashcard_question'),  # Replace XXXX with the actual previous migration number
    ]

    operations = [
        migrations.AlterField(
            model_name='flashcard',
            name='question',
            field=models.TextField(),
        ),
        migrations.AlterUniqueTogether(
            name='flashcard',
            unique_together={('topic', 'question')},
        ),
    ]
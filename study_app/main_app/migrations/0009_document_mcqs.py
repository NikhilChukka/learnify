# Generated by Django 5.1.2 on 2024-10-13 11:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0008_mcq'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='mcqs',
            field=models.JSONField(default=list),
        ),
    ]

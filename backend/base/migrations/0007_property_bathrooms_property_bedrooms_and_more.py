# Generated by Django 5.1 on 2024-09-18 05:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0006_application'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='bathrooms',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='property',
            name='bedrooms',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='property',
            name='parking',
            field=models.IntegerField(default=1),
        ),
    ]

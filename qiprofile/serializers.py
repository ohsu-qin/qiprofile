from rest_framework import serializers
from .models import (Subject, SubjectDetail)


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject


class SubjectDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectDetail

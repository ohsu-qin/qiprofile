import os
from rest_framework import viewsets
from .models import (Subject, Session)

class SubjectViewSet(viewsets.ModelViewSet):

    model = Subject

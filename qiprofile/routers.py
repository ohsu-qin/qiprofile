from rest_framework import routers
from .views import (SubjectViewSet, SubjectDetailViewSet)

router = routers.SimpleRouter()
router.register(r'api/subjects', SubjectViewSet)
router.register(r'api/subject-detail', SubjectDetailViewSet)

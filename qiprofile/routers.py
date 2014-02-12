from rest_framework import routers
from .views import SubjectViewSet

router = routers.DefaultRouter()
router.register(r'subjects', SubjectViewSet)

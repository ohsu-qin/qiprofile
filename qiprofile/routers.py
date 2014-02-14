from rest_framework import routers
from .views import (SubjectViewSet, SubjectDetailViewSet)

router = routers.SimpleRouter()
router.register(r'qiprofile/(?P<collection>\w+)/subjects', SubjectViewSet)
router.register(r'qiprofile/subject-detail', SubjectDetailViewSet)

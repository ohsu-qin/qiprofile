"""The Imaging Profile application routers."""

from rest_framework import routers
from .views import SubjectList

router = routers.DefaultRouter()
router.register(r'^/?$', SubjectList)

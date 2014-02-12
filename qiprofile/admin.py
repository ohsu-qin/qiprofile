from django.contrib import admin
from .models import (Project, Collection)

# Register the objects on the admin page.
admin.site.register(Project)
admin.site.register(Collection)

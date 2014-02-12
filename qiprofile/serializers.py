from rest_framework import serializers as ser
from .models import (Collection, Subject, Session, Modeling, TNM,
                     NottinghamGrade, HormoneReceptorStatus,
                     BreastPathology, SarcomaPathology)


class CollectionSerializer(ser.ModelSerializer):
    subjects = ser.HyperlinkedIdentityField('subjects', view_name='subjects', lookup_field='name')
    
    class Meta:
        model = Collection
        fields = ('id', 'name')


class SubjectSerializer(ser.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'name')

import os
from collections import defaultdict
from django.views.generic.list import ListView
from django.shortcuts import (render, get_object_or_404)
from django.templatetags.static import static
from .models import (Collection, Subject, Session)

class SubjectList(ListView):

    model = Subject

    def get_context_data(self, **kwargs):
        """
        Displays the subjects ordered by collection.

        The optional request parameter *project* specifies the project name.
        The default project is ``QIN``.

        :param request: the HTML request
        """
        context = super(SubjectList, self).get_context_data(**kwargs)
        prj_name = context.get('project', 'QIN')
        sbjs = context['subject_list']
        coll_sbj_dict = defaultdict(list)
        for sbj in sbjs.order_by('number'):
            coll_sbj_dict[sbj.collection].append(sbj)
        coll_sbj_list = [(coll, coll_sbj_dict[coll])
                         for coll in sorted(coll_sbj_dict.keys())]
        context['collection_subjects'] = coll_sbj_list

        return context

def home(request):
    """
    Displays the subjects ordered by collection.
    
    The optional request parameter *project* specifies the project name.
    The default project is ``QIN``.
    
    :param request: the HTML request
    """
    prj_name = request.GET.get('project') or 'QIN'
    sbjs = Subject.objects.filter(project__name=prj_name)
    coll_sbj_dict = defaultdict(list)
    for sbj in sbjs.order_by('number'):
        coll_sbj_dict[sbj.collection].append(sbj)
    coll_sbj_list = [(coll, coll_sbj_dict[coll])
                     for coll in sorted(coll_sbj_dict.keys())]
    context = dict(collection_subjects=coll_sbj_list)

    return render(request, 'qiprofile/home.html', context)


def help(request):
    """
    Displays the context-sensitive help page.
    The help pages are located in the static ``help`` subdirectory.
    The help page file name is *page*\ ``.html``, where *page* is
    the request ``page`` parameter.
    
    :param request: the HTML request
    """
    page = request.GET.get('page')
    url = "help/%s.html" % page
    path = os.path.dirname(__file__) + static(url)
    context = dict(ref=path)

    return render(request, 'qiprofile/help.html', context)


def subject(request, collection_name, subject_number):
    """
    Displays the subject sessions and clinical data.
    If the request parameter *id* is set, then the subject is looked
    up by this primary key. Otherwise, the lookup is by collection
    name and subject number.
    
    The optional request parameter *project* specifies the project name.
    The default project is ``QIN``.
    
    :param request: the HTML request
    :param collection_name: the AIRC collection name, e.g. ``Breast``
    :param subject_number: the study patient number
    """
    pk = request.GET.get('id')
    if pk:
        sbj = get_object_or_404(Subject, pk=pk)
    else:
        prj_name = request.GET.get('project') or 'QIN'
        sbj = get_object_or_404(Subject, project__name= prj_name,
                                collection__name=collection_name.capitalize,
                                number=subject_number)
    sessions = Session.objects.filter(subject=sbj)
    format = request.GET.get('format')
    context = dict(collection_name=collection_name, subject=sbj,
                   sessions=sessions, format=format)

    return render(request, 'qiprofile/subject.html', context)


def session(request, collection_name, subject_number, session_number):
    """
    Displays the given session image.
    If the request parameter *id* is set, then the session is looked
    up by this primary key. Otherwise, the lookup is by collection
    name, subject number and session number.
    
    The optional request parameter *project* specifies the project name.
    The default project is ``QIN``.
    
    :param request: the HTML request
    :param collection_name: the AIRC collection name, e.g. ``Breast``
    :param subject_number: the study patient number
    :param session_number: the MR session number
    """
    pk = request.GET.get('id')
    if pk:
        sess = get_object_or_404(Session, pk=pk)
    else:
        prj_name = request.GET.get('project') or 'QIN'
        sess = get_object_or_404(
            Session, subject__number=subject_number,
            subject__project__name=prj_name,
            subject__collection__name=collection_name.capitalize,
            number=session_number)
    context = dict(collection_name=collection_name,
                   subject_number=subject_number,
                   session=sess)

    return render(request, 'qiprofile/session.html', context)

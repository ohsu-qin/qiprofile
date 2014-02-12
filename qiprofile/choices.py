POS_NEG_CHOICES = [(True, 'Positive'), (False, 'Negative')]
"""The Boolean choices for Positive or Negative status."""

RACE_CHOICES = [('White', 'White'),
                ('Black or African American', 'Black'),
                ('Asian', 'Asian'),
                ('American Indian or Alaska Native', 'AIAN'),
                ('Native Hawaiian or Other Pacific Islander', 'NHOPI')]
"""The standard FDA race categories."""

ETHNICITY_CHOICES = [('Hispanic or Latino', 'HL'),
                     ('Not Hispanic or Latino', 'NHL')]
"""The standard FDA ethnicity categories."""


def max_length(choices):
    """
    Returns the size of the longest choice.
    
    :param: the available choice strings
    :return: the maximum length
    """
    return max((len(c) for c in choices))


def default_choices(*items):
    """
    Returns the default choices for the given list of items.
    Each item choice is the string representation of the item.
     
    Example:
    >>> from qiprofile import choices
    >>> choices.default_choices(None, True, 1, 'n/a')
    [(None, 'None'), (True, 'True), ('A choice', 'A choice'), (1, '1'), ('n/a', 'n/a')]
    
    :param items: the choice items
    :return: the {value: label} choices dictionary
    """
    return [(v, str(v)) for v in items]


def range_choices(start, stop, roman=False):
    """
    Returns the choices for the given exclusive range bounds.
     
    Example:

    >>> from qiprofile import choices
    >>> choices.range_choices(1, 4)
    [(1, '1'), (2, '2'), (3, '3')]

    >>> from qiprofile import choices
    >>> choices.range_choices(1, 5, roman=True)
    [(1, 'I'), (2, 'II'), (3, 'III'), (4, 'IV')]
    
    :param start: the first value in the range
    :param stop: one greater than the last value in the range
    :param roman: flag indicating whether the display value
        is a roman numeral
    :return: the {value: label} choices dictionary
    :raise ValueError: if the *roman* flag is set and start
        is less than one or stop is greater than five
    """
    if roman:
        formatter = _roman
    else:
        formatter = str
    return [(v, formatter(v)) for v in range(start, stop)]


def _roman(n):
    """
    :param n: the input integer
    :return the roman numeral
    :raise ValueError: if the input integer is not a
        positive integer less than five
    """
    if n not in range(1, 5):
        raise ValueError("The roman numeral converter is not supported for"
                         " the value %d" % n)
    if n == 4:
        return 'IV'
    else:
        return 'I' * n

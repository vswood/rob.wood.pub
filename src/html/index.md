---
permalink: /markdown.md
templateEngineOverride: false
---
{% extends "src/html/layout/default.html" %}
{% import "src/html/include/macros.html" as components %}

{% block body %}
  {% for item in collections.sortedHomeContent %}
    {{ components.contentSection(item.data.id, item.templateContent) }}
  {% endfor %}
{% endblock body %}

{% block scripts %}
{% endblock scripts %}

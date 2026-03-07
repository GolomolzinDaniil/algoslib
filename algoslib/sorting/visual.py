import os
import json

from jinja2 import Template

from .sub_sorting import bubble_sort


def visual_bubble_sort(
        data,
        output_name: str = 'bubble_sort.html',
        type_template: str = 'common'
    ) -> None:

    history = json.dumps(bubble_sort(data.copy()))
    initial_array = json.dumps(data)

    current_dir = os.path.dirname(os.path.abspath(__file__))

    path = os.path.join(current_dir, 'templates', f'{type_template}.html')

    with open(path, 'r', encoding='utf-8') as file:
        template_str = file.read()

    template = Template(template_str)

    final_html = template.render(history=history, initial_array=initial_array )

    with open(output_name, 'w', encoding='utf-8') as file:
        file.write(final_html)
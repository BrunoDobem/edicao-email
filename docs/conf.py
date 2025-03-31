# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

import os
import sys
sys.path.insert(0, os.path.abspath('..'))

project = 'Editor de Templates de Email'
copyright = '2024, Seu Nome'
author = 'Seu Nome'
release = '0.1.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'sphinx.ext.githubpages',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# -- Extension configuration ------------------------------------------------

# autodoc settings
autodoc_default_options = {
    'members': True,
    'member-order': 'bysource',
    'special-members': '__init__',
    'undoc-members': True,
    'exclude-members': '__weakref__'
}

# napoleon settings
napoleon_google_docstring = True
napoleon_numpy_docstring = True
napoleon_include_init_with_doc = True
napoleon_include_private_with_doc = True
napoleon_include_special_with_doc = True
napoleon_use_admonition_for_examples = True
napoleon_use_admonition_for_notes = True
napoleon_use_admonition_for_references = True
napoleon_use_ivar = True
napoleon_use_param = True
napoleon_use_rtype = True
napoleon_type_aliases = None

# -- Options for intersphinx extension ---------------------------------------
# https://www.sphinx-doc.org/en/master/usage/extensions/intersphinx.html#configuration

intersphinx_mapping = {
    'python': ('https://docs.python.org/3', None),
    'flask': ('https://flask.palletsprojects.com/en/2.0.x/', None),
}

# -- Options for todo extension ---------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/extensions/todo.html#configuration

todo_include_todos = True

# -- Options for coverage extension -----------------------------------------
# https://www.sphinx-doc.org/en/master/usage/extensions/coverage.html#configuration

coverage_skip_undoc_in_source = True
coverage_skip_missing_imports = True
coverage_skip_empty_docstring = True

# -- Options for linkcheck extension ----------------------------------------
# https://www.sphinx-doc.org/en/master/usage/extensions/linkcheck.html#configuration

linkcheck_ignore = [
    r'http://localhost',
    r'http://127.0.0.1',
]

# -- Options for sphinx.ext.viewcode ---------------------------------------
# https://www.sphinx-doc.org/en/master/usage/extensions/viewcode.html#configuration

viewcode_import = True
viewcode_autoimport = True

# -- Options for sphinx.ext.githubpages ------------------------------------
# https://www.sphinx-doc.org/en/master/usage/extensions/githubpages.html#configuration

github_pages_url = 'https://seu-usuario.github.io/editor-email/'

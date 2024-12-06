# jupyterlab-notebookparams

A JupyterLab extension that populates notebooks with URL parameters.

Functionality lifted from https://github.com/manics/jupyter-notebookparams and made into a jupyterlab extension.


## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install @dafeliton/jupyterlab-notebookparams
```

# Usage
Create a notebook cell that starts with the exact string # Parameters: Add parameters to the URL of a notebook, e.g. ```http://example.org/notebook.ipynb?a=1&b=False```. The content of the first cell starting with # Parameters: will be replaced with the passed parameters, e.g.

# Parameters:
a = 1
b = False
Add the parameter autorun=true to automatically run the notebook.

WARNING: This extension does not parse the parameter values so arbitrary code can be executed in the parameter value.

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```
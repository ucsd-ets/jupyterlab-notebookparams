import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  INotebookTracker, NotebookPanel, NotebookActions
} from '@jupyterlab/notebook';


const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-notebookparams',
  autoStart: true,
  requires: [INotebookTracker],
  activate: activateExtension
};

const PARAM_CELL_PARAMETERS = "# Parameters:";
const FILTERED_PARAMS = ["reset", "clone"];
let autorun = false;

/**
 * Generates parameter assignments from URL search parameters and the full URL.
 * @param params URLSearchParams object containing the URL parameters.
 * @param href The full URL of the notebook.
 * @param language The kernel language of the notebook (e.g., python, r).
 * @returns A string with parameter assignments.
 */
function generateParamAssignment(params: URLSearchParams, href: string, language: string): string {
  let text = "";
  
  // Process existing URL parameters
  for (const [key, value] of params) {
    if (FILTERED_PARAMS.includes(key)) {
      continue;
    }

    if (key === 'autorun') {
      autorun = (value === 'true');
    } else {
      let v = value;

      // Enclose value in quotes if it's not a number
      if (isNaN(Number(value))) {
        v = `"${value}"`;
      }

      // Assign based on the kernel language
      switch (language.toLowerCase()) {
        case 'r':
          text += `${key} <- ${v}\n`;
          break;
        default: // Default to Python-style assignment
          text += `${key} = ${v}\n`;
          break;
      }
    }
  }

  // Add the full URL as a parameter
  const fullUrl = href;
  switch (language.toLowerCase()) {
    case 'r':
      text += `full_url <- "${fullUrl}"\n`;
      break;
    default: // Default to Python-style assignment
      text += `full_url = "${fullUrl}"\n`;
      break;
  }

  return text;
}

/**
 * Activates the extension by setting parameters in the parameter cell.
 * @param app The JupyterFrontEnd application instance.
 * @param notebooks The notebook tracker.
 */
function activateExtension(app: JupyterFrontEnd, notebooks: INotebookTracker): void {
  console.log('JupyterLab extension jupyterlab-notebookparams is activated!');
  const href = window.location.href;

  notebooks.widgetAdded.connect((sender, panel: NotebookPanel) => {
    panel.sessionContext.ready.then(() => {
      for (let i = 0; i < panel.model.cells.length; i++) {
        const cell = panel.model.cells.get(i);
        if (cell.sharedModel.getSource().startsWith(PARAM_CELL_PARAMETERS)) {
          const searchParams = new URL(href).searchParams;
          const language = panel.model.defaultKernelLanguage || 'python'; // Default to Python if undefined
          const text = generateParamAssignment(searchParams, href, language);
          
          if (text) {
            cell.sharedModel.setSource(`${PARAM_CELL_PARAMETERS}\n${text}`);
            console.log(`jupyterlab-notebookparams: Setting parameters in cell ${i}`);
          }

          if (autorun) {
            // Set the active cell to the parameters cell
            panel.content.activeCellIndex = i;
            // Run only that cell
            NotebookActions.run(panel.content, panel.sessionContext).then(() => {
              console.log("jupyterlab-notebookparams: Autorun (parameters cell only) done.");
            });
          }
          break; // Exit after processing the parameter cell
        }
      }
    });
  });
}

// Export the extension as default
export default extension;

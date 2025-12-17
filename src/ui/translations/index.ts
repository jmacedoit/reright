import { propertiesLeaves } from "../../utils/types";

const translations = {
  en: {
    translation: {
      tray: {
        defaultRewrite: "Default rewrite",
        configure: "Configure Reright",
        quit: "Quit"
      },
      menu: {
        howTo: "How to use",
        rewrites: "Rewrites",
        settings: "Settings"
      },
      screens: {
        howto: {
          title: "How to use",
          intro:
            "Reright helps you transform text using AI-powered rewrites. Copy any text, trigger a rewrite, and paste the result. Here's how each mode works:",
          mode1: {
            label: "Mode 1",
            title: "Quick Rewrite (Default Command)",
            description:
              "The fastest way to transform text using your default rewrite command (<command>{{command}}</command>).",
            exampleNote: 'Example using a "fix" command:',
            step1:
              "<strong>Select and copy</strong> the text you want to rewrite",
            step2:
              "Press the global shortcut <shortcut></shortcut> to trigger the rewrite",
            step3: "<strong>Paste</strong> the transformed text",
            exampleInput: "teh quick browm fox jumpd over the lazzy dog",
            exampleOutput: "The quick brown fox jumped over the lazy dog."
          },
          mode2: {
            label: "Mode 2",
            title: "Command-Specific Rewrite",
            description:
              "Append a command word after <separator>{{separator}}</separator> to use a specific rewrite instead of the default.",
            step1:
              "<strong>Write</strong> your text, add <separator>{{separator}}</separator>, then the command word",
            step2:
              "<strong>Copy</strong> the entire text (including the command) and press <shortcut></shortcut>",
            step3: "<strong>Paste</strong> the enhanced result",
            exampleInput: "The quarterly results were good",
            exampleCommand: "enhance",
            exampleOutput:
              "The quarterly results demonstrated exceptional performance, exceeding projected targets across all key metrics.",
            note: "Available commands depend on your configured rewrites. Check the <strong>Rewrites</strong> tab to see all available command words."
          },
          mode3: {
            label: "Mode 3",
            title: "Ad-hoc Instructions",
            description:
              "Provide custom, one-time instructions after <separator>{{separator}}</separator> for complete flexibility.",
            step1:
              "<strong>Write</strong> your text, add <separator>{{separator}}</separator>, then your custom instructions",
            step2:
              "<strong>Copy</strong> everything and press <shortcut></shortcut>",
            step3: "<strong>Paste</strong> the customized result",
            exampleInput: "Hello John, I wanted to follow up on our meeting",
            exampleInstructions:
              "make this more formal and add a request for scheduling a call",
            exampleOutput:
              "Dear Mr. John,\n\nI hope this message finds you well. I am writing to follow up on our recent meeting. I would greatly appreciate the opportunity to schedule a call at your earliest convenience to discuss the next steps.\n\nBest regards",
            note: "Ad-hoc instructions are detected when your text after <separator>{{separator}}</separator> doesn't match any existing command word."
          },
          trayHint:
            "💡 <strong>Alternative:</strong> Instead of using the keyboard shortcut, you can also trigger rewrites from the <strong>tray menu</strong> in your system bar. This gives you quick access to all your configured rewrites and works the same way — just select your text, copy it, choose a rewrite from the tray menu, and paste the result."
        },
        settings: {
          title: "Settings",
          loading: "Loading settings...",
          form: {
            rewriteShortcut: {
              title: "Rewrite shortcut",
              hint: "The shortcut to rewrite the text",
              startRecordingLabel: "Start recording",
              stopRecordingLabel: "Stop recording",
              clearShortcutLabel: "Clear shortcut"
            },
            defaultCommand: {
              title: "Default command",
              hint: "Which command will be used when none is specified"
            },
            model: {
              title: "Model configuration",
              provider: {
                title: "Provider",
                hint: "Specify the model provider"
              },
              modelId: {
                title: "Model",
                hint: "Tip: pick a faster model for better UX"
              },
              apiKey: {
                title: "API key",
                placeholder: "sk-ziH...",
                hint: "You can find this on your specific provider dashboard"
              }
            },
            autostart: {
              title: "Autostart",
              hint: "Whether to start automatically when the system boots"
            }
          }
        },
        rewrites: {
          title: "Rewrites",
          table: {
            headers: {
              name: "Name",
              command: "Command",
              instructions: "Instructions",
              actions: "Actions"
            }
          },
          modal: {
            editButtonLabel: "Edit rewrite",
            deleteButtonLabel: "Delete rewrite",
            addTitle: "Add rewrite",
            editTitle: "Edit rewrite",
            addButton: "Add",
            saveButton: "Save",
            cancelButton: "Cancel"
          },
          deleteModal: {
            title: "Delete rewrite",
            description: 'Are you sure you want to delete "{{name}}"?',
            deleteButton: "Delete"
          },
          form: {
            name: {
              title: "Name",
              hint: "Friendly label for this rewrite"
            },
            commandWord: {
              title: "Command",
              hint: "Applying on: <code>{{example}}</code> will trigger this rewrite",
              uniqueError: "Command must be unique"
            },
            instructions: {
              title: "Instructions",
              hint: "How the model should transform the selected text"
            }
          },
          newButton: "New"
        }
      }
    }
  }
};

export default translations;

export const translationKeys = propertiesLeaves<
  typeof translations.en.translation
>(translations.en.translation);

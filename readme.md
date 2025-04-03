# Komodo Assistant: AI Plugin for Komodo IDE

The Komodo Assistant is an AI plugin designed to work within the Komodo IDE,
enhancing your coding experience by providing intelligent assistance,
refactoring suggestions, and real-time code analysis.

This plugin communicates with a language model via Ollama API to
generate helpful responses tailored to the Komodo IDE environment.


## Features

- **Code Refactoring:** Get personalized refactoring suggestions based on the current file's context.
- **Real-time Assistance:** Receive instant help with coding queries, tips, and tricks specific to Komodo IDE.
- **Code Analysis:** Gain insights into your code's structure, complexity, and potential improvements.
- **Seamless Integration:** The plugin is designed to work harmoniously within the Komodo IDE environment, providing helpful assistance without disrupting your workflow.


## Try asking:

- Who are you?
- What language is the current file written in?
- Describe the current file


## Prerequisites

- A running instance of Ollama with the `mistral-nemo` model available at `http://localhost:11434`.
- Komodo IDE with the AI Assistant plugin installed and configured to communicate with the Ollama API.


## Installation and Setup

1. Clone this repository into your local development environment.
2. Run either `./build.sh` or `./build.sh &>/dev/null && cp komodo-ai.xpi /home/$USER/.komodoide/12.0/XRE/extensions/komodo-ai@nshiell.com.xpi && /opt/komodo/bin/komodo`
4. Start or restart Komodo IDE to apply the changes and load the AI Assistant plugin.


## Usage

1. Open a file in Komodo IDE to enable the AI Assistant for that specific context.
2. Access the AI Assistant by invoking your preferred command showing the righ pane
3. Ask questionpress Ask (it is quite slow)


## License

The Komodo Assistant plugin is released under the terms of the
GNU General Public License version 3 (GPLv3). For more information,
see the [LICENSE](LICENSE) file in this repository.


## Credits

This AI plugin was created by Nicholas Shiell to enhance the Komodo IDE experience.
The plugin communicates with the `mistral-nemo` model via the Ollama API to generate helpful and relevant responses.

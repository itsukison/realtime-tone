# Senpai realtime Tone

A desktop application that provides real-time tone analysis and feedback for audio input. This tool helps users understand and analyze the emotional tone of speech in real-time, making it useful for practice sessions, presentations, and communication improvement.

## Installation

### Prerequisites

- Node.js
- Git
- Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/itsukison/realtime-tone.git
cd realtime-tone
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:
   - Create a `.env` file in the root directory
   - Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Running the Application

#### Development Mode

```bash
# Terminal 1
npm run dev -- --port 5180

# Terminal 2
NODE_ENV=development npm run electron:dev
```

#### Production Build

```bash
npm run build
```

Built application will be available in the `release` folder.

### Keyboard Shortcuts

- `Cmd/Ctrl + B`: Toggle window
- `Cmd/Ctrl + H`: Take screenshot
- `Cmd/Enter`: Get solution
- `Cmd/Ctrl + Arrow Keys`: Move window
- `Cmd + Q` (Mac) / `Ctrl + Q` (Windows/Linux): Quit application
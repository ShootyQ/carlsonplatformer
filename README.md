# Backyard Adventure

A static, touch-friendly platformer prototype with storybook character sprites, a scrolling grass field, and sky. No build or runtime dependencies.

## Run

Use Node.js 24 for checks and Python 3 for the local server:

```sh
npm test
npm run dev
```

Open port 5173 in your browser. Tap **Let’s play!** to start and request fullscreen and landscape orientation. Fullscreen and orientation locking depend on the browser (particularly on iPhone); when unsupported, rotate manually. Portrait mode pauses gameplay and displays a rotation prompt. The fullscreen button retries fullscreen.

Hold the bottom-left buttons to move. Hold crouch on the right to crouch or sneak; tap jump to jump. Keyboard: arrows or WASD, Space to jump. Simultaneous movement and jumping work with multitouch. There are no enemies, hazards, or objectives yet.

## Deploy

In GitHub repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. Push these files to `main`, or run the **Deploy game to GitHub Pages** workflow manually. The workflow runs physics tests and deploys only the static game files. No secrets or install step needed.

Artwork is a generated first pass; some edge artifacts, repeated poses, and registration shifts remain. Source sprites are retained unchanged. Animation timing and physics are separate so sprite polish can follow without changing jump behavior.

## Release 0.3.0

The bottom-center label shows the loaded game version. Entry scripts, imported modules, CSS, and artwork use versioned URLs to avoid mixing old and new releases. Crouch-walk registration matches held crouch using visible face features, and movement accelerates and decelerates rather than snapping to full speed.

## Release 0.3.1

Running now uses twelve newly drawn chronological poses (four columns, three rows), with intermediate knee bend and leg-swing poses. The cycle still follows distance traveled; the twelve-frame run uses independent frame layout and registration so crouch and jump sheets retain their scale.

# autovis-template
A Create-React-App template for building new Autovis visualizations.
This README file is a work in progress. Please expect more information to appear here soon.

## How to Install
1. Install node and npm: https://nodejs.org/en/download/
2. In the command line, run `npx create-react-app --template autovis my-project-name-here`
3. In the command line, run `cd my-project-name-here`
4. In the command line, run `yarn start`

## How to Use with Stems
- The main script file for produced songs with stems is `src/StudioTemplate.tsx`.
- Replace the included audio files with stems and a master mix from your own song, and update references to them in the main script file.
- Stems should all be the full duration of the master file. Export all stems from the same start point you're using to export master.
- Refer to the Three.JS docs for more information on manipulating 3d objects in autovis: https://threejs.org/docs/


## How to Use with Live Audio
- After firing up the site, click the button labelled "Switch to Live Input Setup".
- The main script file for produced songs with stems is `src/LiveTemplate.tsx`.
- Refer to the Three.JS docs for more information on manipulating 3d objects in autovis: https://threejs.org/docs/


Thank you so much for your interest! Please report any bugs you encounter on at https://github.com/TheActualWalko/autovis-template/issues

# layout-migrator

This script will traverse all the directories and subdirectories to find any `.json` file and modify its structure to support new button widget.

## How to run:

This code is intended to be run in `backend/public/` folder.

- Clone this repository
- Install the packages using `npm i`
- Create a backup of layouts folder (`backend/public/`)
- Either
- - run it using `node index.js` inside `/backend/public/` folder
- - or pass it as option: `node index.js --backendPublicFolder=path/to/backend/public/`

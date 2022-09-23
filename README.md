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

## Notes
- Note that while writing migrations, write in a manner that executing the same migration multple times does not corrupt data.
- Note that `props` of widgets are being kept in the database. You can not do any migrations on them here. Neither can you create or remove them.

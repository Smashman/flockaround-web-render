# `flockaround-web-render`

WIP project that uses Pixi.js to render [Flock Around](https://store.steampowered.com/app/3618030/Flock_Around/) sprites according to the configs used in the game.

## Development

### Requirements

- Node
- PNPM

## Setup

1. `pnpm i`
2. Copy a bird config from the Flock Around game files into `.config` in `index.html`.
3. `mkdir img`
4. Copy the relevant head and body spritesheets from the Flock Around game files into `img`. See the config for the path to the correct files. Place the files in the directory directly. Do not create any subdirectories.
5. Update `.head` and `.body` `src` attributes to match in `index.html`.
6. `pnpm dev`

## License

Copyright &copy; 2026 Ben Williams

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

A copy of the GNU General Public License can be found at http://www.gnu.org/licenses/.

For your convenience, a copy of this license is included.

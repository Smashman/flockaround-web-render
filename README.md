# `flockaround-web-render`

WIP project that uses Pixi.js to render [Flock Around](https://store.steampowered.com/app/3618030/Flock_Around/) sprites according to the configs used in the game.

## Development

### Requirements

- Node
- PNPM

## Setup

1. `pnpm i`
2. `mkdir configs`
3. Copy one or more bird configs from the Flock Around game files into `configs`.
4. `mkdir img`
5. Copy the relevant head and body spritesheets from the Flock Around game files into `img`. See the config for the path to the correct files. Place the files in the directory directly. Do not create any subdirectories.
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

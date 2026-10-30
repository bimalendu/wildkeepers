// A trimmed Phaser for production: the core build (no Arcade/Matter physics, tilemaps, particles, video, ...) plus the
// extra game objects this game uses: Rectangle, Container and Image. Swapped in for 'phaser' by the alias in vite.config.ts;
// the TypeScript types still come from the real package. If a new Phaser feature is needed, require it here.
import Phaser from 'phaser/src/phaser-core.js';
import 'phaser/src/gameobjects/shape/rectangle/RectangleFactory.js';
import 'phaser/src/gameobjects/container/ContainerFactory.js';
import 'phaser/src/gameobjects/image/ImageFactory.js';

export default Phaser;

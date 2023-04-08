import { renderByCompositionName } from '@pda/poster-renderer';

async function run() {
  const { outputPath, clear } = await renderByCompositionName(
    'spotify-player-v1',
    'png'
  );
  console.log(outputPath);
}
run();
import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// macOS에 Chrome이 있으면 사용(없으면 Remotion 내장 브라우저)
import fs from 'fs';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (fs.existsSync(CHROME)) Config.setBrowserExecutable(CHROME);
Config.setConcurrency(4);

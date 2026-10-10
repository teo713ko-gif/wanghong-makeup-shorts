import {Composition, registerRoot} from 'remotion';
import {Wanghong} from './Wanghong';
import data from './captions.json';
const Root = () => <Composition id="WanghongV2" component={Wanghong} durationInFrames={Math.round(data.duration*30)} fps={30} width={1080} height={1920}/>;
registerRoot(Root);

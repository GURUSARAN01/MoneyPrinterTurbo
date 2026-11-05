import React from 'react';
import {Composition} from 'remotion';
import prototype from '../manifests/zombie-flight.json';
import {durationInFrames, parseManifest} from './manifest';
import {Episode} from './Episode';

const manifest = parseManifest(prototype);
export const Root: React.FC = () => <Composition
  id="ZombieFlight" component={Episode} width={1080} height={1920} fps={30}
  durationInFrames={durationInFrames(manifest)} defaultProps={{manifest}}
  calculateMetadata={({props}) => {
    const validated = parseManifest(props.manifest);
    return {durationInFrames: durationInFrames(validated), width: validated.width, height: validated.height, fps: validated.fps, props: {manifest: validated}};
  }}
/>;

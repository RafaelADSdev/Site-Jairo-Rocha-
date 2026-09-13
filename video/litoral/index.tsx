import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {LitoralFilm} from './litoral-film';

const Root = () => <>
  <Composition id="LitoralLandscape" component={LitoralFilm} width={1280} height={720} fps={30} durationInFrames={660} />
  <Composition id="LitoralPortrait" component={LitoralFilm} width={720} height={960} fps={30} durationInFrames={660} />
</>;

registerRoot(Root);

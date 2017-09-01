# mipExploration
Showcase for mip selection in WebGl.

[Example](https://busyrev.github.com/mipExploration/)


Interest case about how video card selects wich mip level to use. It selects level depending on distance between sampler arguments from neighbour pixels.

Example picture created by this transform: 

```glsl
gl_FragColor = texture2D(uSampler, vec2(pow((vTextureCoord.s-0.5)*(vTextureCoord.s-0.5) + (vTextureCoord.t-0.5)*(vTextureCoord.t-0.5), 0.1), vTextureCoord.t));
```

[Official OpenGL docs](https://www.khronos.org/registry/OpenGL/specs/es/2.0/es_full_spec_2.0.pdf), see section 3.7.7

### How to build
```bash
npm install
npm run build
```
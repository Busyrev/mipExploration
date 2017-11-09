# mipExploration
Showcase for mip selection in WebGl.

[Example](https://busyrev.github.com/mipExploration/)


Interest case about how video card selects wich mip level to use. It selects level depending on distance between sampler arguments from neighbour pixels.

Example picture created by this transform: 

```glsl
gl_FragColor = texture2D(uSampler, vec2(pow((vTextureCoord.s-0.5)*(vTextureCoord.s-0.5) + (vTextureCoord.t-0.5)*(vTextureCoord.t-0.5), 0.1), vTextureCoord.t));
```

[Official OpenGL docs](https://www.khronos.org/registry/OpenGL/specs/es/2.0/es_full_spec_2.0.pdf), see section 3.7.7

Many example images posted by different users can be found in [this thread on Pikabu](https://pikabu.ru/story/v_firefox_58_poyavitsya_zashchita_ot_skryitoy_identifikatsii_polzovateley_pri_pomoshchi_canvas_5449626#comment_99034038)

### How to build
```bash
npm install
npm run build
```
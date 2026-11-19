# 3D mascot attempt (not used on the website)

`build_mascot.py` builds a 3D version of the mascot procedurally in Blender 5.3 (free, local):

```
blender -b --factory-startup --python build_mascot.py -- <out_dir>
```

Output: `rune-mascot.glb` (about 1.7 MB, about 70k triangles, 84 meshes). It contains six animation clips: Idle, Walk, Wave, Jump, Celebrate, Point.

**Verdict:** `compare.jpg` puts the original artwork (left) next to the renders. The model keeps the main traits: round glasses, navy hoodie with blue drawstrings, tablet, grey and white palette, and sneakers. It doesn't closely resemble the original:
- fur reads as smooth clay
- the head is cat-like rather than a wolf muzzle
- the arms are balloon-shaped and the hands are mittens
- the tail is tube-like rather than fluffy
- the proportions are toy-like

Following the brief, it is **not** used as the website mascot. The site keeps the original 2D artwork.
This folder isn't imported by the app and isn't part of the deployed site.

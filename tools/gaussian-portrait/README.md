# gaussian-portrait

Turns the home-page photo into a few thousand fitted Gaussians, so the site never
serves the real photo. Fitting uses [gsplat-mlx](https://github.com/RobotFlow-Labs/gsplat-mlx)
(the MLX port of gsplat) and follows gsplat's
[image fitting example](https://docs.gsplat.studio/main/examples/image.html).
It runs on the CPU, so no CUDA is needed.

## How it works

1. The photo is resized to 320 px wide (`--width`), optionally blurred first (`--blur`).
2. N 3D Gaussians sit in front of a pinhole camera, as in gsplat's `SimpleTrainer`.
   Each step:
   - gsplat-mlx `quat_scale_to_covar_preci` and `fully_fused_projection` turn them into 2D Gaussians.
   - gsplat-mlx `isect_tiles` lists which Gaussians touch each 16 px tile.
   - `render.pixel_pairs` expands those into Gaussian/pixel pairs.
   - gsplat-mlx `accumulate` alpha-composites them. This step is differentiable.
   - The result is composited over a **random background colour** each step, and Adam
     minimises the MSE against the photo. Random backgrounds stop the fit from leaving
     see-through gaps that only look right over one colour, so the Gaussians come out
     fully opaque and look the same on the website's transparent canvas.
3. The fitted 2D Gaussians are exported to `public/pictures/portrait.gsp`
   (about 310 KB). [`src/components/gaussian-portrait.tsx`](../../src/components/gaussian-portrait.tsx)
   draws them with WebGL.

## Setup

gsplat-mlx is cloned next to this folder and is not committed:

```bash
cd tools
git clone https://github.com/RobotFlow-Labs/gsplat-mlx
cd gaussian-portrait
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Run

Put the source photo in `input/`. That folder is git-ignored, so the photo stays private.

```bash
.venv/bin/python fit_portrait.py input/home_pic.jpeg \
    --out ../../public/pictures/portrait.gsp --preview previews/
```

With the defaults this takes about 13 minutes with `--device gpu` and roughly twice that on CPU. `previews/` gets `target.png`,
`result.png` and `training.gif`.

| Option | Default | Effect |
|---|---|---|
| `--blur` | 0 | Blur radius in px before fitting. Higher means less detail and more privacy. |
| `--num-gaussians` | 9000 | Fewer Gaussians give a more abstract, painterly result. |
| `--width` | 320 | Fitting resolution. |
| `--iters` | 1200 | Adam steps. |
| `--device` | cpu | `gpu` uses Apple's Metal GPU through MLX. |

## `.gsp` format

Little endian: `b"GSP1"`, `uint32 count`, `float32 width`, `float32 height`, then
per Gaussian 9 × float32: `x, y, cov_xx, cov_xy, cov_yy, r, g, b, opacity`
in fitted-image pixels. The Gaussians are sorted back to front.

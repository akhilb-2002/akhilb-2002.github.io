"""Fit Gaussians to an image with gsplat-mlx, following gsplat's examples/image_fitting.py.

Same setup as gsplat's SimpleTrainer: N 3D Gaussians in front of a pinhole camera
(90 deg FOV, 8 units away), optimised with Adam on an MSE loss. Positions and
colours start from the image rather than pure noise, and scales are stored as logs.
"""

from __future__ import annotations

import math
import struct
import time
from pathlib import Path

import mlx.core as mx
import mlx.optimizers as optim
import numpy as np
from PIL import Image, ImageFilter

from .render import pixel_pairs, project, render

MAGIC = b"GSP1"


def load_target(path: Path, width: int, blur: float) -> np.ndarray:
    """Load, resize to `width` px wide, and blur slightly. Returns [H, W, 3] in 0..1."""
    img = Image.open(path).convert("RGB")
    height = round(img.height * width / img.width)
    img = img.resize((width, height), Image.LANCZOS)
    if blur > 0:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(img, dtype=np.float32) / 255.0


def to_image(arr) -> Image.Image:
    return Image.fromarray((np.clip(np.array(arr), 0, 1) * 255).astype(np.uint8))


PAGE_BACKGROUND = (0xF0 / 255, 0xEF / 255, 0xEA / 255)  # site background (#f0efea)


class PortraitFitter:
    def __init__(self, target: np.ndarray, num_gaussians: int = 3000, seed: int = 0):
        rng = np.random.default_rng(seed)
        mx.random.seed(seed)
        self.target = mx.array(target)
        self.H, self.W = target.shape[:2]
        N = num_gaussians

        # camera, as in gsplat's example
        self.focal = 0.5 * self.W / math.tan(0.5 * (math.pi / 2))
        self.K = mx.array([[self.focal, 0, self.W / 2], [0, self.focal, self.H / 2], [0, 0, 1.0]])
        self.viewmat = mx.array([[1.0, 0, 0, 0], [0, 1.0, 0, 0], [0, 0, 1.0, 8.0], [0, 0, 0, 1.0]])
        z = 8.0

        # spread Gaussians over the image and colour them from it
        px = rng.uniform(0, self.W, N)
        py = rng.uniform(0, self.H, N)
        means = np.stack([(px - self.W / 2) * z / self.focal,
                          (py - self.H / 2) * z / self.focal,
                          rng.uniform(-1, 1, N)], -1)
        size_px = 0.7 * math.sqrt(self.W * self.H / N)
        log_scales = math.log(size_px * z / self.focal) + 0.1 * rng.standard_normal((N, 3))
        u, v, w = rng.uniform(size=(3, N))
        quats = np.stack([np.sqrt(1 - u) * np.sin(2 * np.pi * v), np.sqrt(1 - u) * np.cos(2 * np.pi * v),
                          np.sqrt(u) * np.sin(2 * np.pi * w), np.sqrt(u) * np.cos(2 * np.pi * w)], -1)
        sampled = np.clip(target[py.astype(int), px.astype(int)], 0.02, 0.98)

        self.params = {
            "means": mx.array(means, dtype=mx.float32),
            "log_scales": mx.array(log_scales, dtype=mx.float32),
            "quats": mx.array(quats, dtype=mx.float32),
            "rgbs": mx.array(np.log(sampled / (1 - sampled)), dtype=mx.float32),
            "opacities": mx.ones((N,)),
        }

    def _project(self, p):
        return project(p["means"], p["quats"], mx.exp(p["log_scales"]),
                       self.viewmat, self.K, self.W, self.H)

    def _pairs(self, p):
        radii, means2d, depths, conics = self._project(p)
        return pixel_pairs(radii, means2d, depths, conics,
                           mx.sigmoid(p["opacities"]), self.W, self.H)

    def _render(self, p, gauss_ids, pixel_ids, background=None):
        _, means2d, _, conics = self._project(p)
        return render(means2d, conics, mx.sigmoid(p["rgbs"]), mx.sigmoid(p["opacities"]),
                      gauss_ids, pixel_ids, self.W, self.H, background)

    def render(self, background=PAGE_BACKGROUND):
        """Render over the website's background colour, as the browser shows it."""
        return self._render(self.params, *self._pairs(self.params), mx.array(background))

    def train(self, iterations=1500, lr=0.01, log_every=100, on_frame=None):
        # A random background colour every step means see-through gaps never pay off,
        # so the Gaussians become fully opaque and look the same on any page colour.
        def loss_fn(p, gauss_ids, pixel_ids, background):
            out = self._render(p, gauss_ids, pixel_ids, background)
            return mx.mean((out - self.target) ** 2), out

        step = mx.value_and_grad(loss_fn)
        optimizer = optim.Adam(learning_rate=lr)
        start = time.time()
        for it in range(1, iterations + 1):
            gauss_ids, pixel_ids = self._pairs(self.params)
            background = mx.random.uniform(shape=(3,))
            (loss, out), grads = step(self.params, gauss_ids, pixel_ids, background)
            self.params = optimizer.apply_gradients(grads, self.params)
            mx.eval(self.params, optimizer.state, loss)

            if it % log_every == 0 or it == iterations:
                psnr = -10 * math.log10(loss.item())
                print(f"iter {it:5d}  loss {loss.item():.5f}  psnr {psnr:5.2f} dB  "
                      f"{time.time() - start:6.1f}s", flush=True)
            if on_frame is not None:
                on_frame(it, out)

    def export(self, path: Path) -> int:
        """Write the fitted 2D Gaussians for the browser renderer.

        Format (little endian): b"GSP1", uint32 count, float32 width, float32 height,
        then per Gaussian 9 x float32:
            x, y, cov_xx, cov_xy, cov_yy   (pixels of the fitted image)
            r, g, b, opacity               (0..1)
        sorted back-to-front, so drawing in order with "over" blending reproduces
        gsplat's front-to-back compositing.
        """
        radii, means2d, depths, conics = self._project(self.params)
        radii, means2d, depths, conics = (np.array(x[0]) for x in (radii, means2d, depths, conics))
        rgb = np.array(mx.sigmoid(self.params["rgbs"]))
        op = np.array(mx.sigmoid(self.params["opacities"]))

        a, b, c = conics[:, 0], conics[:, 1], conics[:, 2]
        det = a * c - b * b
        cov = np.stack([c, -b, a], -1) / np.where(det > 0, det, 1)[:, None]

        visible = (radii > 0).all(-1) & (op >= 1 / 255) & (det > 0)
        rows = np.concatenate([means2d, cov, rgb, op[:, None]], -1)[visible]
        rows = rows[np.argsort(-depths[visible], kind="stable")]

        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            f.write(MAGIC)
            f.write(struct.pack("<Iff", rows.shape[0], float(self.W), float(self.H)))
            f.write(rows.astype("<f4").tobytes())
        return rows.shape[0]

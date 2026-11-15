"""Differentiable rendering of Gaussians with gsplat-mlx.

Pipeline (all gsplat-mlx functions except step 3):
  1. quat_scale_to_covar_preci   3D covariance from quaternion + scale
  2. fully_fused_projection      3D Gaussians -> 2D means / conics / depths
  3. pixel_pairs (here)          expand gsplat-mlx `isect_tiles` (tile, gaussian)
                                 hits into (gaussian, pixel) pairs, depth-sorted
  4. accumulate                  differentiable front-to-back alpha compositing

gsplat-mlx's own differentiable `rasterization()` loops over every Gaussian in
Python, which is too slow for thousands of Gaussians; `accumulate()` is its
vectorised path and only needs the pair list from step 3.
"""

from __future__ import annotations

import math

import mlx.core as mx
import numpy as np

from gsplat_mlx.core.accumulate import accumulate
from gsplat_mlx.core.constants import ALPHA_THRESHOLD
from gsplat_mlx.core.covariance import quat_scale_to_covar_preci
from gsplat_mlx.core.intersection import isect_tiles
from gsplat_mlx.core.projection import fully_fused_projection


def project(means, quats, scales, viewmat, K, width, height):
    """3D Gaussians -> (radii, means2d, depths, conics), each with a camera dim of 1."""
    quats = quats / mx.linalg.norm(quats, axis=-1, keepdims=True)
    covars, _ = quat_scale_to_covar_preci(quats, scales, compute_preci=False, triu=False)
    radii, means2d, depths, conics, _ = fully_fused_projection(
        means, covars, viewmat[None], K[None], width, height,
        eps2d=0.3, near_plane=0.01, far_plane=1e10,
    )
    return radii, means2d, depths, conics


def pixel_pairs(radii, means2d, depths, conics, opacities, width, height, tile_size=16):
    """(gaussian_ids, pixel_ids) for every Gaussian/pixel pair that is visible,
    grouped by pixel and front-to-back inside each pixel. Not differentiated."""
    tw, th = math.ceil(width / tile_size), math.ceil(height / tile_size)
    _, isect_ids, flatten_ids = isect_tiles(
        means2d, radii, depths, tile_size, tw, th, sort=True
    )
    isect_ids = np.array(isect_ids)
    gauss = np.array(flatten_ids).astype(np.int64)
    # isect_ids = image | tile | depth, already sorted by tile then depth
    tile_ids = (isect_ids >> 32) & ((1 << (tw * th).bit_length()) - 1)

    # expand each (tile, gaussian) hit to the tile's pixels
    ly, lx = np.mgrid[0:tile_size, 0:tile_size]
    px = ((tile_ids % tw) * tile_size)[:, None] + lx.ravel()[None]
    py = ((tile_ids // tw) * tile_size)[:, None] + ly.ravel()[None]
    gauss = np.repeat(gauss, tile_size * tile_size)
    px, py = px.ravel(), py.ravel()

    # drop pixels outside the image and pairs whose alpha would be ~0
    m2d = np.array(means2d[0])
    con = np.array(conics[0])
    op = np.array(opacities)
    dx = px + 0.5 - m2d[gauss, 0]
    dy = py + 0.5 - m2d[gauss, 1]
    c = con[gauss]
    sigma = 0.5 * (c[:, 0] * dx * dx + c[:, 2] * dy * dy) + c[:, 1] * dx * dy
    keep = (px < width) & (py < height) & (sigma >= 0) & (op[gauss] * np.exp(-sigma) >= ALPHA_THRESHOLD)
    gauss, pixel_ids = gauss[keep], (py * width + px)[keep]

    # group by pixel; a stable sort keeps the depth order inside each pixel
    order = np.argsort(pixel_ids, kind="stable")
    return mx.array(gauss[order].astype(np.int32)), mx.array(pixel_ids[order].astype(np.int32))


def render(means2d, conics, colors, opacities, gauss_ids, pixel_ids, width, height, background=None):
    """Composite with gsplat-mlx `accumulate` over `background` (an RGB colour,
    black if None). Returns [H, W, 3]."""
    image_ids = mx.zeros_like(gauss_ids)
    img, alphas = accumulate(
        means2d, conics, opacities[None], colors[None],
        gauss_ids, pixel_ids, image_ids, width, height,
    )
    img = img[0]
    if background is not None:
        img = img + (1 - alphas[0]) * background
    return img

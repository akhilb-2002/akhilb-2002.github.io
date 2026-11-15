"""Fit Gaussians to a (slightly blurred) photo with gsplat-mlx and export them for the website.

    .venv/bin/python fit_portrait.py input/home_pic.jpeg \
        --out ../../public/pictures/portrait.gsp --preview previews/

Runs on the CPU by default (no CUDA needed). `--device gpu` uses Apple's Metal GPU via MLX.
"""

import argparse
from pathlib import Path

import mlx.core as mx

from gaussian_portrait import PortraitFitter, load_target, to_image


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image", type=Path, help="source photo")
    ap.add_argument("--out", type=Path, required=True, help="output .gsp file")
    ap.add_argument("--preview", type=Path, help="folder for target / result / progress images")
    ap.add_argument("--width", type=int, default=320, help="fitting resolution (px wide)")
    ap.add_argument("--blur", type=float, default=0.0, help="Gaussian blur radius (px) applied before fitting")
    ap.add_argument("--num-gaussians", type=int, default=9000)
    ap.add_argument("--iters", type=int, default=1200)
    ap.add_argument("--lr", type=float, default=0.01)
    ap.add_argument("--device", choices=["cpu", "gpu"], default="cpu")
    ap.add_argument("--seed", type=int, default=0)
    args = ap.parse_args()

    mx.set_default_device(mx.cpu if args.device == "cpu" else mx.gpu)

    target = load_target(args.image, args.width, args.blur)
    print(f"target {target.shape[1]}x{target.shape[0]}, blur {args.blur}px, "
          f"{args.num_gaussians} gaussians, {args.iters} iters on {args.device}")

    fitter = PortraitFitter(target, args.num_gaussians, args.seed)

    frames = []

    def on_frame(it, out):
        if args.preview and (it == 1 or it % max(1, args.iters // 30) == 0):
            frames.append(to_image(out))

    fitter.train(args.iters, args.lr, on_frame=on_frame)

    n = fitter.export(args.out)
    print(f"wrote {n} gaussians -> {args.out} ({args.out.stat().st_size / 1024:.0f} KB)")

    if args.preview:
        args.preview.mkdir(parents=True, exist_ok=True)
        to_image(target).save(args.preview / "target.png")
        to_image(fitter.render()).save(args.preview / "result.png")
        if frames:
            frames[0].save(args.preview / "training.gif", save_all=True,
                           append_images=frames[1:], duration=80, loop=0)
        print(f"previews -> {args.preview}")


if __name__ == "__main__":
    main()

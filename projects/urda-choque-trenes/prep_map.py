"""Project Spain's provinces (and Portugal, for the peninsula's shape) to SVG paths.

    python3 -I prep_map.py <spain-provinces.geojson> <ne_50m_admin_0_countries.geojson> > work/map.json

Equirectangular projection centred on 40°N; output units are pixels in a 1000-wide box.
"""
import json
import math
import sys

LON0, LAT0, SCALE = -3.7, 40.0, 92.0          # 92 px per degree of latitude
KX = math.cos(math.radians(LAT0))
SKIP = {"Las Palmas", "Santa Cruz De Tenerife", "Ceuta", "Melilla"}


def proj(lon, lat):
    return (500 + (lon - LON0) * KX * SCALE, 420 - (lat - LAT0) * SCALE)


def simplify(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, -1.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x2 * y1 - y2 * x1) / norm
        if d > dmax:
            i, dmax = k, d
    if dmax <= eps:
        return [pts[0], pts[-1]]
    return simplify(pts[: i + 1], eps)[:-1] + simplify(pts[i:], eps)


def rings(geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for poly in polys:
        yield poly[0]  # outer ring only


def path(geom, eps=0.35, min_len=4):
    out = []
    for ring in rings(geom):
        pts = [proj(*p[:2]) for p in ring]
        far = max(range(len(pts)), key=lambda k: math.dist(pts[0], pts[k]))   # closed ring: split it
        pts = simplify(pts[: far + 1], eps)[:-1] + simplify(pts[far:], eps)
        if len(pts) < min_len:
            continue
        out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(out)


def main():
    es = json.load(open(sys.argv[1]))
    ne = json.load(open(sys.argv[2]))
    provinces = [{"name": f["properties"]["name"], "d": path(f["geometry"])}
                 for f in es["features"] if f["properties"]["name"] not in SKIP]
    portugal = next(f for f in ne["features"] if f["properties"].get("ADMIN") == "Portugal")
    neighbours = {}
    for name in ("France", "Morocco", "Andorra"):
        f = next(f for f in ne["features"] if f["properties"].get("ADMIN") == name)
        neighbours[name] = path(f["geometry"], eps=0.5)
    places = {
        "Madrid": (-3.6895, 40.4065), "Sevilla": (-5.975, 37.392), "Toledo": (-4.0245, 39.8628),
        "Urda": (-3.7147, 39.4097), "Ciudad Real": (-3.927, 38.985), "Córdoba": (-4.789, 37.888),
        "Mora": (-3.774, 39.685), "Orgaz": (-3.877, 39.647), "Los Yébenes": (-3.871, 39.580),
    }
    # Approximate course of the Madrid–Sevilla high-speed line (illustrative, not surveyed).
    line = [(-3.6895, 40.4065), (-3.72, 40.30), (-3.80, 40.10), (-3.82, 39.85), (-3.80, 39.66),
            (-3.74, 39.47), (-3.72, 39.41), (-3.80, 39.15), (-3.927, 38.985), (-4.11, 38.69),
            (-4.35, 38.40), (-4.789, 37.888), (-5.30, 37.60), (-5.975, 37.392)]
    json.dump({
        "provinces": provinces,
        "portugal": path(portugal["geometry"], eps=0.5),
        "neighbours": neighbours,
        "places": {k: [round(c, 1) for c in proj(*v)] for k, v in places.items()},
        "line": [[round(c, 1) for c in proj(*p)] for p in line],
    }, sys.stdout, ensure_ascii=False)


main()

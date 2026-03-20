import { useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { alpha2ToNumeric } from "i18n-iso-countries";
import worldTopology from "world-atlas/countries-110m.json";
import { buildCountryTotalsMap } from "./syntheticCountryActivity.js";

const MAP_W = 960;
const MAP_H = 480;

function fillColor(value, min, max) {
  if (max <= min) return "rgb(207, 232, 252)";
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = Math.round(232 - t * 221);
  const g = Math.round(244 - t * 149);
  const b = Math.round(252 - t * 87);
  return `rgb(${r},${g},${b})`;
}

/**
 * @param {object} props
 * @param {string} [props.userCountryAlpha2] — from ipapi / localStorage
 * @param {string} props.mapCaption — short line under heading
 * @param {string} props.tooltipTotalLabel — e.g. “Est. total users” for hover/title context
 * @param {string} props.legendLow
 * @param {string} props.legendHigh
 * @param {string} props.youLabel — shown when user's country is known
 */
export function WorldActivityMap({ userCountryAlpha2, mapCaption, tooltipTotalLabel, legendLow, legendHigh, youLabel }) {
  const [hover, setHover] = useState(null);

  const { land, path, activity } = useMemo(() => {
    const landFeatures = feature(worldTopology, worldTopology.objects.countries);
    const projection = geoNaturalEarth1()
      .rotate([0, 0])
      .fitExtent(
        [
          [4, 4],
          [MAP_W - 4, MAP_H - 4],
        ],
        landFeatures,
      );
    const pathGen = geoPath(projection);
    const act = buildCountryTotalsMap(landFeatures.features);
    return { land: landFeatures, path: pathGen, activity: act };
  }, []);

  const userNumeric =
    userCountryAlpha2 && typeof userCountryAlpha2 === "string"
      ? alpha2ToNumeric(userCountryAlpha2.trim().toUpperCase())
      : undefined;
  const userIdStr = userNumeric != null ? String(userNumeric) : null;

  return (
    <div className="world-activity-map-wrap">
      <div className="world-activity-map-caption">{mapCaption}</div>
      {userIdStr && (
        <div className="world-activity-map-you" role="status">
          {youLabel}
        </div>
      )}
      <svg
        className="world-activity-map-svg"
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={mapCaption}
      >
        {land.features.map((geo, idx) => {
          const idStr = geo.id != null ? String(geo.id) : "";
          const count = activity.counts.get(idStr) ?? 0;
          const { min, max } = activity;
          const fill = fillColor(count, min, max);
          const isYou = userIdStr && idStr === userIdStr;
          return (
            <path
              key={idStr ? `c-${idStr}` : `c-idx-${idx}`}
              d={path(geo) || ""}
              fill={fill}
              stroke={isYou ? "rgba(180, 120, 0, 0.95)" : "rgba(255,255,255,0.55)"}
              strokeWidth={isYou ? 1.35 : 0.45}
              className={`world-activity-country${isYou ? " is-you" : ""}`}
              onMouseEnter={() =>
                setHover({
                  name: geo.properties?.name || "",
                  count,
                })
              }
              onMouseLeave={() => setHover(null)}
            >
              <title>
                {geo.properties?.name || "—"} — {tooltipTotalLabel}: {count.toLocaleString()}
              </title>
            </path>
          );
        })}
      </svg>
      {hover && (
        <div className="world-activity-map-tooltip" role="tooltip">
          <strong>{hover.name}</strong>
          <span className="world-activity-map-tooltip-metric">
            {tooltipTotalLabel}: {hover.count.toLocaleString()}
          </span>
        </div>
      )}
      <div className="world-activity-map-legend" aria-hidden="true">
        <span className="world-activity-legend-swatch world-activity-legend-low" />
        <span>{legendLow}</span>
        <span className="world-activity-legend-gradient" />
        <span>{legendHigh}</span>
        <span className="world-activity-legend-swatch world-activity-legend-high" />
      </div>
    </div>
  );
}

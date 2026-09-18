import React, { useEffect, useRef, useState, useId } from 'react';
import * as d3 from 'd3';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Play,
  Pause,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Layers,
  X,
  Sliders,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export interface RiskFactor {
  rank: number;
  label: string;
  percentage: number;
  category: 'DEVICE' | 'LOCATION' | 'VELOCITY' | 'BENEFICIARY' | 'BEHAVIOR' | 'BASELINE' | 'NETWORK';
  detail: string;
}

export interface FraudRiskGaugeD3Props {
  score?: number;
  minScore?: number;
  maxScore?: number;
  size?: number;
  interactive?: boolean;
  onScoreChange?: (score: number) => void;
  showControls?: boolean;
  showTelemetry?: boolean;
  defaultShowSidePanel?: boolean;
}

interface HistoryDataPoint {
  minutesAgo: number; // e.g. -30, -27, ..., 0
  label: string;
  score: number;
  timeString: string;
}

// Generate realistic 30-minute historical trajectory for historical context
const generateHistoryPoints = (targetScore: number): HistoryDataPoint[] => {
  const points: HistoryDataPoint[] = [];
  const intervals = [30, 27, 24, 21, 18, 15, 12, 9, 6, 3, 0];
  const now = Date.now();

  intervals.forEach((minsAgo) => {
    let ptScore: number;
    if (minsAgo === 0) {
      ptScore = targetScore;
    } else if (targetScore >= 70) {
      // High threat: was quiet/nominal baseline until a sharp breakout 9-12m ago
      if (minsAgo > 15) {
        ptScore = Math.max(12, Math.round(18 + Math.sin(minsAgo) * 3));
      } else if (minsAgo > 6) {
        ptScore = Math.round(26 + ((15 - minsAgo) / 9) * 38 + Math.sin(minsAgo) * 4);
      } else {
        ptScore = Math.round(64 + ((6 - minsAgo) / 6) * (targetScore - 64));
      }
    } else if (targetScore >= 30) {
      // Moderate threat: steady behavioral deviation drift upwards
      const progress = (30 - minsAgo) / 30;
      ptScore = Math.round(16 + progress * (targetScore - 16) + Math.sin(minsAgo) * 3);
    } else {
      // Safe / Low threat: consistently calm baseline with natural micro-variations
      ptScore = Math.max(8, Math.min(29, Math.round(targetScore + Math.sin(minsAgo * 0.9) * 3.5)));
    }

    const timestamp = new Date(now - minsAgo * 60 * 1000);
    const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    points.push({
      minutesAgo: -minsAgo,
      label: minsAgo === 0 ? 'Now' : `-${minsAgo}m`,
      score: Math.max(0, Math.min(100, ptScore)),
      timeString: timeStr,
    });
  });

  return points;
};

// Generate top 3 contributing factors to the current score
export const getTopRiskFactors = (score: number): RiskFactor[] => {
  if (score >= 70) {
    return [
      {
        rank: 1,
        label: 'Unrecognized Device Signature',
        percentage: 38,
        category: 'DEVICE',
        detail: 'Hardware UUID mismatch & headless browser fingerprint detected',
      },
      {
        rank: 2,
        label: 'Geographic Distance Drift (+1,850 km)',
        percentage: 34,
        category: 'LOCATION',
        detail: 'IP geocoding indicates physically impossible transit velocity',
      },
      {
        rank: 3,
        label: 'Novel Beneficiary + Velocity Anomaly',
        percentage: 22,
        category: 'BENEFICIARY',
        detail: 'First-time counterparty added within 5m of high-value transfer',
      },
    ];
  } else if (score >= 30) {
    return [
      {
        rank: 1,
        label: 'Unverified Counterparty Account',
        percentage: 46,
        category: 'BENEFICIARY',
        detail: 'Account is not in 90-day trusted payee registry',
      },
      {
        rank: 2,
        label: 'Off-Hours Transaction Window',
        percentage: 31,
        category: 'BEHAVIOR',
        detail: 'Initiated at 03:14 AM outside typical user operating hours',
      },
      {
        rank: 3,
        label: 'Velocity Surge (3 txns / hr)',
        percentage: 17,
        category: 'VELOCITY',
        detail: 'Short-term burst above typical rolling baseline',
      },
    ];
  } else {
    return [
      {
        rank: 1,
        label: 'Baseline Statistical Dispersion',
        percentage: 54,
        category: 'BASELINE',
        detail: 'Nominal variance within trained Gaussian model bounds',
      },
      {
        rank: 2,
        label: 'Cellular IP Subnet Rotation',
        percentage: 28,
        category: 'NETWORK',
        detail: 'Carrier dynamic IP change within authorized domestic region',
      },
      {
        rank: 3,
        label: 'Standard Amount Fluctuation',
        percentage: 14,
        category: 'VELOCITY',
        detail: 'Transaction size is consistent with standard grocery/retail cadence',
      },
    ];
  }
};

export const FraudRiskGaugeD3: React.FC<FraudRiskGaugeD3Props> = ({
  score: initialScore = 24,
  minScore = 0,
  maxScore = 100,
  size = 280,
  interactive = true,
  onScoreChange,
  showControls = true,
  showTelemetry = true,
  defaultShowSidePanel = false,
}) => {
  const [currentScore, setCurrentScore] = useState<number>(initialScore);
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>(() =>
    generateHistoryPoints(initialScore)
  );
  const [hoveredPoint, setHoveredPoint] = useState<HistoryDataPoint | null>(null);

  // Tooltip and Side Panel states
  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'sparkline' | 'factors'>('sparkline');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(defaultShowSidePanel);
  const [hoveredFactor, setHoveredFactor] = useState<RiskFactor | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const sparklineSvgRef = useRef<SVGSVGElement | null>(null);
  const prevScoreRef = useRef<number>(initialScore);
  const prevInitialScoreRef = useRef<number>(initialScore);
  const currentScoreRef = useRef<number>(initialScore);
  const uniqueId = useId().replace(/:/g, '-');

  // Keep currentScoreRef in sync
  useEffect(() => {
    currentScoreRef.current = currentScore;
  }, [currentScore]);

  // Sync with prop if it changes externally
  useEffect(() => {
    if (prevInitialScoreRef.current !== initialScore) {
      prevInitialScoreRef.current = initialScore;
      setCurrentScore(initialScore);
      setHistoryData(generateHistoryPoints(initialScore));
    }
  }, [initialScore]);

  // Live telemetry pulse simulation (subtle realistic fluctuations around baseline)
  useEffect(() => {
    if (!isLiveStream) return;

    const interval = setInterval(() => {
      const prev = currentScoreRef.current;
      // Jitter by -2 to +2, clamped to [0, 100]
      const jitter = Math.floor(Math.random() * 5) - 2;
      const next = Math.max(0, Math.min(100, prev + jitter));

      setCurrentScore(next);
      setLastUpdated(new Date().toLocaleTimeString());

      // Update latest history point to match jitter smoothly
      setHistoryData((oldHistory) => {
        if (!oldHistory.length) return oldHistory;
        const updated = [...oldHistory];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          ...updated[lastIdx],
          score: next,
          timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return updated;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveStream]);

  // Determine threat category
  const getThreatCategory = (val: number) => {
    if (val < 30) {
      return {
        label: 'LOW RISK',
        color: '#22c55e', // Vibrant Green
        glowColor: 'rgba(34, 197, 94, 0.45)',
        status: 'AUTHENTIC & SAFE',
        icon: ShieldCheck,
        action: 'ALLOW',
      };
    }
    if (val < 70) {
      return {
        label: 'MEDIUM RISK',
        color: '#eab308', // Vibrant Yellow
        glowColor: 'rgba(234, 179, 8, 0.45)',
        status: 'SUSPICIOUS PATTERN',
        icon: Activity,
        action: 'STEP-UP 2FA',
      };
    }
    return {
      label: 'HIGH RISK',
      color: '#ef4444', // Crimson Red
      glowColor: 'rgba(239, 68, 68, 0.55)',
      status: 'CRITICAL ANOMALY',
      icon: ShieldAlert,
      action: 'AUTONOMOUS PAUSE',
    };
  };

  const threat = getThreatCategory(currentScore);
  const riskFactors = getTopRiskFactors(currentScore);

  // Compute 30-minute trend context
  const startScore30m = historyData[0]?.score ?? currentScore;
  const trendDelta = currentScore - startScore30m;
  const trendColor =
    trendDelta > 5
      ? currentScore >= 70
        ? '#ef4444'
        : '#eab308'
      : trendDelta < -5
      ? '#22c55e'
      : '#06b6d4';

  // Handler when user selects a preset or drags gauge
  const handleScoreUpdate = (newScore: number) => {
    prevInitialScoreRef.current = newScore;
    setCurrentScore(newScore);
    setHistoryData(generateHistoryPoints(newScore));
    if (onScoreChange) {
      onScoreChange(newScore);
    }
  };

  // 1. Render / Update Main D3 Radial Gauge
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean redraw

    const width = size;
    const height = size * 0.88;
    const margin = 18;
    const radius = Math.min(width, height * 1.6) / 2 - margin;

    // Angle configuration for 240-degree radial gauge (-120 deg to +120 deg)
    const startAngle = -Math.PI * 0.68;
    const endAngle = Math.PI * 0.68;
    const totalAngle = endAngle - startAngle;

    // Scales
    const scale = d3.scaleLinear().domain([minScore, maxScore]).range([startAngle, endAngle]);

    // Container Group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height * 0.68})`);

    // Definitions (Glow Filters & Gradients)
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', `d3-gauge-glow-${uniqueId}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '4.5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arc Gradient: Emerald -> Amber -> Red
    const gradient = defs
      .append('linearGradient')
      .attr('id', `d3-gauge-gradient-${uniqueId}`)
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#22c55e');
    gradient.append('stop').attr('offset', '50%').attr('stop-color', '#eab308');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#ef4444');

    // 1. Outer decorative HUD ring
    const outerRingRadius = radius + 10;
    const outerArc = d3
      .arc()
      .innerRadius(outerRingRadius - 1)
      .outerRadius(outerRingRadius)
      .startAngle(startAngle - 0.05)
      .endAngle(endAngle + 0.05);

    g.append('path')
      .attr('d', outerArc({} as any) || '')
      .attr('fill', '#1e293b')
      .attr('opacity', 0.6);

    // 2. Background Track Arc (Dark Slate Track)
    const innerRadius = radius - 16;
    const backgroundArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(8);

    g.append('path')
      .attr('d', backgroundArc({} as any) || '')
      .attr('fill', '#09101d')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.2);

    // 3. Segmented Zone Indicators Behind Arc
    const zones = [
      { from: 0, to: 30, color: '#22c55e', opacity: 0.22, label: 'LOW' },
      { from: 30, to: 70, color: '#eab308', opacity: 0.22, label: 'MED' },
      { from: 70, to: 100, color: '#ef4444', opacity: 0.25, label: 'HIGH' },
    ];

    zones.forEach((zone) => {
      const zoneArc = d3
        .arc()
        .innerRadius(innerRadius + 2)
        .outerRadius(radius - 2)
        .startAngle(scale(zone.from))
        .endAngle(scale(zone.to));

      g.append('path')
        .attr('d', zoneArc({} as any) || '')
        .attr('fill', zone.color)
        .attr('opacity', zone.opacity);
    });

    // 4. Tick Marks and Labels
    const majorTicks = [0, 20, 40, 60, 80, 100];
    const minorTicks = [10, 30, 50, 70, 90];

    // Minor ticks
    minorTicks.forEach((tick) => {
      const angle = scale(tick) - Math.PI / 2;
      const x1 = Math.cos(angle) * (innerRadius - 2);
      const y1 = Math.sin(angle) * (innerRadius - 2);
      const x2 = Math.cos(angle) * (innerRadius - 7);
      const y2 = Math.sin(angle) * (innerRadius - 7);

      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#475569')
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    });

    // Major ticks with numbers
    majorTicks.forEach((tick) => {
      const angle = scale(tick) - Math.PI / 2;
      const isCritical = tick >= 70;
      const tickColor = tick < 30 ? '#22c55e' : tick < 70 ? '#eab308' : '#ef4444';

      const x1 = Math.cos(angle) * innerRadius;
      const y1 = Math.sin(angle) * innerRadius;
      const x2 = Math.cos(angle) * (innerRadius - 10);
      const y2 = Math.sin(angle) * (innerRadius - 10);

      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', tickColor)
        .attr('stroke-width', 1.8)
        .attr('opacity', 0.85);

      const labelRadius = innerRadius - 22;
      const lx = Math.cos(angle) * labelRadius;
      const ly = Math.sin(angle) * labelRadius;

      g.append('text')
        .attr('x', lx)
        .attr('y', ly + 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', 'bold')
        .attr('fill', tickColor)
        .attr('opacity', isCritical ? 0.95 : 0.75)
        .text(tick);
    });

    // 5. Foreground Filled Risk Arc (Animated with D3 transition & interpolation)
    const foregroundArcGenerator = d3
      .arc<{ endAngle: number }>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle(startAngle)
      .cornerRadius(8);

    const prevAngle = scale(prevScoreRef.current);
    const targetAngle = scale(currentScore);

    const foregroundPath = g
      .append('path')
      .datum({ endAngle: prevAngle })
      .attr('d', foregroundArcGenerator as any)
      .attr('fill', `url(#d3-gauge-gradient-${uniqueId})`)
      .attr('filter', `url(#d3-gauge-glow-${uniqueId})`);

    foregroundPath
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (d: { endAngle: number }) {
        const interpolate = d3.interpolate(d.endAngle, targetAngle);
        return function (t: number) {
          d.endAngle = interpolate(t);
          return foregroundArcGenerator(d) || '';
        };
      });

    // 6. High-Tech Animated Needle / Pointer
    const needleLength = radius - 24;
    const needleGroup = g.append('g').attr('class', 'needle-group');

    // Needle path: sleek tapered pointer
    needleGroup
      .append('path')
      .attr(
        'd',
        `M -4,0 L -1.5,-${needleLength} L 0,-${needleLength + 4} L 1.5,-${needleLength} L 4,0 Z`
      )
      .attr('fill', threat.color)
      .attr('filter', `url(#d3-gauge-glow-${uniqueId})`)
      .attr('opacity', 0.95);

    // Center pivot hub (glowing futuristic ring)
    needleGroup
      .append('circle')
      .attr('r', 12)
      .attr('fill', '#040814')
      .attr('stroke', threat.color)
      .attr('stroke-width', 2.5);

    needleGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', threat.color)
      .attr('filter', `url(#d3-gauge-glow-${uniqueId})`);

    // Needle rotation angle (degrees)
    const prevDegrees = (prevScoreRef.current / maxScore) * 240 - 120;
    const targetDegrees = (currentScore / maxScore) * 240 - 120;

    needleGroup
      .attr('transform', `rotate(${prevDegrees})`)
      .transition()
      .duration(750)
      .ease(d3.easeElasticOut.amplitude(1).period(0.6))
      .attr('transform', `rotate(${targetDegrees})`);

    // 7. Interactive Click / Drag Arc Overlay (when interactive=true)
    if (interactive) {
      const clickOverlayArc = d3
        .arc()
        .innerRadius(innerRadius - 10)
        .outerRadius(radius + 15)
        .startAngle(startAngle)
        .endAngle(endAngle);

      const overlay = g
        .append('path')
        .attr('d', clickOverlayArc({} as any) || '')
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer');

      const handlePointerUpdate = (event: any) => {
        const [mx, my] = d3.pointer(event, g.node());
        let rad = Math.atan2(my, mx) + Math.PI / 2;
        if (rad > Math.PI) rad -= 2 * Math.PI;

        const clampedRad = Math.max(startAngle, Math.min(endAngle, rad));
        const normalized = (clampedRad - startAngle) / totalAngle;
        const newScore = Math.round(normalized * 100);

        handleScoreUpdate(newScore);
      };

      overlay.on('click', handlePointerUpdate);
      overlay.on('mousemove', (event) => {
        if (event.buttons === 1) {
          handlePointerUpdate(event);
        }
      });
    }

    prevScoreRef.current = currentScore;
  }, [currentScore, size, minScore, maxScore, interactive, uniqueId]);

  // 2. Render / Update D3 Sparkline Trend Indicator (Last 30 Minutes)
  useEffect(() => {
    if (!sparklineSvgRef.current || !historyData.length) return;

    const sparkSvg = d3.select(sparklineSvgRef.current);
    sparkSvg.selectAll('*').remove();

    const width = 280;
    const height = 54;
    const margin = { top: 6, right: 10, bottom: 8, left: 10 };

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([-30, 0])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    const defs = sparkSvg.append('defs');

    // Sparkline Gradient
    const sparkGradient = defs
      .append('linearGradient')
      .attr('id', `sparkline-gradient-${uniqueId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    sparkGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', threat.color)
      .attr('stop-opacity', 0.42);

    sparkGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', threat.color)
      .attr('stop-opacity', 0.0);

    // Filter glow for sparkline
    const sparkFilter = defs
      .append('filter')
      .attr('id', `sparkline-glow-${uniqueId}`)
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    sparkFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'blur');

    const sparkMerge = sparkFilter.append('feMerge');
    sparkMerge.append('feMergeNode').attr('in', 'blur');
    sparkMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Reference guideline at 70 (Interception threshold)
    sparkSvg
      .append('line')
      .attr('x1', margin.left)
      .attr('y1', yScale(70))
      .attr('x2', width - margin.right)
      .attr('y2', yScale(70))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0.5);

    // Reference guideline at 30 (Moderate threshold)
    sparkSvg
      .append('line')
      .attr('x1', margin.left)
      .attr('y1', yScale(30))
      .attr('x2', width - margin.right)
      .attr('y2', yScale(30))
      .attr('stroke', '#eab308')
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', '2 4')
      .attr('opacity', 0.35);

    // D3 Area generator
    const areaGenerator = d3
      .area<HistoryDataPoint>()
      .x((d) => xScale(d.minutesAgo))
      .y0(yScale(0))
      .y1((d) => yScale(d.score))
      .curve(d3.curveMonotoneX);

    sparkSvg
      .append('path')
      .datum(historyData)
      .attr('d', areaGenerator)
      .attr('fill', `url(#sparkline-gradient-${uniqueId})`);

    // D3 Line generator
    const lineGenerator = d3
      .line<HistoryDataPoint>()
      .x((d) => xScale(d.minutesAgo))
      .y((d) => yScale(d.score))
      .curve(d3.curveMonotoneX);

    sparkSvg
      .append('path')
      .datum(historyData)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', threat.color)
      .attr('stroke-width', 2)
      .attr('filter', `url(#sparkline-glow-${uniqueId})`);

    // Data points (dots)
    sparkSvg
      .selectAll('.spark-dot')
      .data(historyData)
      .enter()
      .append('circle')
      .attr('class', 'spark-dot')
      .attr('cx', (d) => xScale(d.minutesAgo))
      .attr('cy', (d) => yScale(d.score))
      .attr('r', (d) => (d.minutesAgo === 0 ? 3.5 : 2))
      .attr('fill', (d) => (d.minutesAgo === 0 ? threat.color : '#0a101d'))
      .attr('stroke', (d) => (d.minutesAgo === 0 ? '#ffffff' : threat.color))
      .attr('stroke-width', (d) => (d.minutesAgo === 0 ? 1.5 : 1));

    // Outer pulsating halo for the "Now" endpoint
    sparkSvg
      .append('circle')
      .attr('cx', xScale(0))
      .attr('cy', yScale(currentScore))
      .attr('r', 6.5)
      .attr('fill', threat.color)
      .attr('opacity', 0.35)
      .attr('filter', `url(#sparkline-glow-${uniqueId})`);

    // Interactive hover overlay across sparkline
    const bisectMinute = d3.bisector((d: HistoryDataPoint) => d.minutesAgo).center;

    sparkSvg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', function (event) {
        const coords = d3.pointer(event, this);
        const mx = coords[0];
        if (typeof mx === 'number' && !isNaN(mx)) {
          const hoveredMin = xScale.invert(mx);
          const index = Math.max(0, Math.min(historyData.length - 1, bisectMinute(historyData, hoveredMin)));
          const point = historyData[index] || null;
          setHoveredPoint(point);
        }
      })
      .on('mouseleave', function () {
        setHoveredPoint(null);
      });
  }, [historyData, threat.color, currentScore, uniqueId]);

  return (
    <div
      id="d3-fraud-risk-gauge-container"
      className={`glass-panel rounded-2xl p-4 sm:p-5 border border-cyan-500/30 relative overflow-hidden bg-gradient-to-b from-[#080f20]/90 to-[#040814]/95 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col justify-between transition-all duration-300 ${
        isSidePanelOpen ? 'xl:flex-row xl:items-start xl:gap-5' : 'items-center'
      }`}
    >
      {/* Background ambient HUD glow corresponding to risk level */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: threat.glowColor }}
      />
      <div
        className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: threat.glowColor }}
      />

      {/* Main Column (Gauge + Sparkline + Controls) */}
      <div className={`flex flex-col items-center w-full ${isSidePanelOpen ? 'xl:w-[300px] flex-shrink-0' : ''}`}>
        {/* Header telemetry banner */}
        <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: threat.color }}
            />
            <span className="text-xs font-cyber font-bold tracking-wider text-slate-200 uppercase">
              Real-Time Fraud Risk Score
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              D3
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tooltip Popover Button */}
            <div className="relative">
              <button
                id="gauge-explain-factors-btn"
                onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                onMouseEnter={() => setIsTooltipOpen(true)}
                className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-colors ${
                  isTooltipOpen
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
                }`}
                title="View top 3 risk factors tooltip"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[10px] font-bold">Factors</span>
              </button>

              {/* FLOATING HOVER / CLICK TOOLTIP (Top 3 Contributing Factors) */}
              {isTooltipOpen && (
                <div
                  className="absolute right-0 top-9 w-72 sm:w-80 p-3.5 rounded-xl glass-panel bg-[#091122]/98 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] z-50 text-left font-mono backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
                  onMouseLeave={() => setIsTooltipOpen(false)}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-cyber font-bold text-slate-100">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Top 3 Risk Contributors</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTooltipOpen(false);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 mb-2">
                    Score attribution breakdown for current {threat.label} ({currentScore}/100):
                  </div>

                  <div className="space-y-2">
                    {riskFactors.map((factor) => (
                      <div
                        key={factor.rank}
                        className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-1.5 truncate pr-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              #{factor.rank}
                            </span>
                            <span className="text-slate-200 font-semibold text-[11px] truncate">
                              {factor.label}
                            </span>
                          </div>
                          <span
                            className="font-bold text-xs"
                            style={{ color: threat.color }}
                          >
                            {factor.percentage}%
                          </span>
                        </div>

                        {/* Visual contribution bar */}
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${factor.percentage}%`,
                              backgroundColor: threat.color,
                              boxShadow: `0 0 8px ${threat.glowColor}`,
                            }}
                          />
                        </div>

                        <p className="text-[9px] text-slate-400 leading-tight">
                          {factor.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Residual Model Variance: ~6%</span>
                    <button
                      onClick={() => {
                        setIsTooltipOpen(false);
                        setIsSidePanelOpen(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Dock Side Panel</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Side Panel Button */}
            <button
              id="gauge-toggle-side-panel-btn"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-colors ${
                isSidePanelOpen
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-300'
              }`}
              title="Dock/Undock Top 3 Factors Side Panel"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-[10px] font-bold">
                {isSidePanelOpen ? 'Close' : 'Panel'}
              </span>
            </button>

            {/* Streaming toggle */}
            <button
              onClick={() => setIsLiveStream(!isLiveStream)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors ${
                isLiveStream
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle continuous streaming inference"
            >
              {isLiveStream ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
              <span>{isLiveStream ? 'LIVE' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* D3 SVG Canvas Area (Radial Gauge) */}
        <div className="relative flex items-center justify-center my-1 z-10">
          <svg
            ref={svgRef}
            width={size}
            height={size * 0.82}
            className="overflow-visible select-none drop-shadow-md"
          />

          {/* Center Floating Value Readout */}
          <div
            className="absolute bottom-1 flex flex-col items-center select-none"
            style={{ width: size }}
          >
            <div className="flex items-baseline gap-1 pointer-events-none">
              <span
                className="text-4xl sm:text-5xl font-cyber font-extrabold tracking-tight transition-colors duration-500"
                style={{
                  color: threat.color,
                  textShadow: `0 0 20px ${threat.glowColor}`,
                }}
              >
                {currentScore}
              </span>
              <span className="text-sm font-mono text-slate-500 font-bold">/100</span>
            </div>

            <button
              onClick={() => setIsTooltipOpen((prev) => !prev)}
              className="mt-1 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border transition-all duration-500 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              style={{
                backgroundColor: `${threat.color}15`,
                borderColor: threat.color,
                color: threat.color,
                boxShadow: `0 0 12px ${threat.glowColor}`,
              }}
              title="Click to view top 3 contributing factors"
            >
              <span>{threat.label} · {threat.action}</span>
              <Info className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        {/* Bottom Tab Toggle (Sparkline vs Top 3 Factors) when side panel is docked/closed */}
        {!isSidePanelOpen && (
          <div className="w-full mt-2 pt-2 border-t border-slate-800/80 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setActiveBottomTab('sparkline')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                    activeBottomTab === 'sparkline'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-3 h-3" />
                  <span>30-Min Trend</span>
                </button>
                <button
                  onClick={() => setActiveBottomTab('factors')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                    activeBottomTab === 'factors'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Top 3 Factors</span>
                </button>
              </div>

              {/* Trend Delta badge or Factors count */}
              {activeBottomTab === 'sparkline' ? (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors duration-500"
                  style={{
                    backgroundColor: `${trendColor}15`,
                    borderColor: `${trendColor}45`,
                    color: trendColor,
                  }}
                >
                  {trendDelta > 5 ? (
                    <>
                      <TrendingUp className="w-3 h-3" />
                      <span>+{trendDelta} pts</span>
                    </>
                  ) : trendDelta < -5 ? (
                    <>
                      <TrendingDown className="w-3 h-3" />
                      <span>{trendDelta} pts</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3 h-3" />
                      <span>Stable</span>
                    </>
                  )}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  Explainable AI (XAI)
                </span>
              )}
            </div>

            {/* TAB 1: D3 30-MIN SPARKLINE */}
            {activeBottomTab === 'sparkline' && (
              <div className="space-y-1" id="d3-sparkline-trend-section">
                <div className="relative w-full bg-[#050b18]/80 rounded-xl border border-slate-800/90 p-2 overflow-hidden shadow-inner">
                  <svg
                    ref={sparklineSvgRef}
                    className="w-full h-14 overflow-visible select-none"
                    viewBox="0 0 280 54"
                    preserveAspectRatio="none"
                  />

                  {/* Interactive Hover Readout Badge */}
                  {hoveredPoint && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/95 border border-cyan-500/40 text-[10px] font-mono text-slate-200 pointer-events-none flex items-center gap-1.5 shadow-lg">
                      <span className="text-cyan-400">{hoveredPoint.label}</span>
                      <span className="text-slate-500">({hoveredPoint.timeString})</span>
                      <span className="text-white font-bold font-cyber">Risk: {hoveredPoint.score}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1">
                  <span>-30m ({startScore30m})</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
                    <span>Threshold 70</span>
                  </span>
                  <span
                    className="font-bold transition-colors"
                    style={{ color: threat.color }}
                  >
                    Now ({currentScore})
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: INLINE TOP 3 FACTORS LIST */}
            {activeBottomTab === 'factors' && (
              <div className="space-y-1.5 font-mono text-xs">
                {riskFactors.map((factor) => (
                  <div
                    key={factor.rank}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5 truncate pr-1">
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          #{factor.rank}
                        </span>
                        <span className="text-slate-200 font-bold truncate">
                          {factor.label}
                        </span>
                      </div>
                      <span
                        className="font-bold text-xs"
                        style={{ color: threat.color }}
                      >
                        {factor.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${factor.percentage}%`,
                          backgroundColor: threat.color,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {factor.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 30-Minute Sparkline always visible when side panel is open */}
        {isSidePanelOpen && (
          <div className="w-full mt-2 pt-2 border-t border-slate-800/80 relative z-10" id="d3-sparkline-trend-section">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                <History className="w-3 h-3 text-cyan-400" />
                <span>30-Min Trend</span>
              </span>
              <span
                className="text-[10px] font-mono font-bold"
                style={{ color: trendColor }}
              >
                {trendDelta >= 0 ? `+${trendDelta}` : trendDelta} pts
              </span>
            </div>

            <div className="relative w-full bg-[#050b18]/80 rounded-xl border border-slate-800/90 p-2 overflow-hidden shadow-inner">
              <svg
                ref={sparklineSvgRef}
                className="w-full h-12 overflow-visible select-none"
                viewBox="0 0 280 54"
                preserveAspectRatio="none"
              />
            </div>
          </div>
        )}

        {/* Telemetry Row */}
        {showTelemetry && (
          <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 font-mono text-[11px] relative z-10">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[9px] uppercase">Telemetry</span>
              <span className="text-slate-200 font-bold">{lastUpdated}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[9px] uppercase">Intervention</span>
              <span
                className="font-bold truncate block"
                style={{ color: threat.color }}
              >
                {threat.action}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[9px] uppercase">Confidence</span>
              <span className="text-cyan-300 font-bold">98.6%</span>
            </div>
          </div>
        )}

        {/* Risk Classification Spectrum Legend */}
        <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 relative z-10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="font-bold">Risk Classification Guide:</span>
            <span className="text-[9px] text-cyan-400/80 font-mono">Real-time Policy</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
            <div
              className={`p-1.5 rounded-lg border transition-all ${
                currentScore < 30
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Low (Green)</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">0 – 29 Safe</div>
            </div>

            <div
              className={`p-1.5 rounded-lg border transition-all ${
                currentScore >= 30 && currentScore < 70
                  ? 'bg-yellow-950/60 border-yellow-500/60 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 font-bold text-yellow-400">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span>Med (Yellow)</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">30 – 69 Verify</div>
            </div>

            <div
              className={`p-1.5 rounded-lg border transition-all ${
                currentScore >= 70
                  ? 'bg-red-950/60 border-red-500/60 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 font-bold text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span>High (Red)</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">70 – 100 Pause</div>
            </div>
          </div>
        </div>

        {/* Interactive Scenario Presets */}
        {showControls && (
          <div className="w-full mt-2.5 pt-2 border-t border-slate-800/60 relative z-10">
            <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Simulate Threat Level:</span>
              <span className="text-[9px] text-slate-500">Click preset or drag needle</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                id="gauge-preset-low-btn"
                onClick={() => handleScoreUpdate(16)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                  currentScore < 30
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-emerald-300 hover:border-emerald-500/40'
                }`}
              >
                🟢 Low (16)
              </button>
              <button
                id="gauge-preset-medium-btn"
                onClick={() => handleScoreUpdate(52)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                  currentScore >= 30 && currentScore < 70
                    ? 'bg-yellow-500/25 text-yellow-300 border-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-yellow-300 hover:border-yellow-500/40'
                }`}
              >
                🟡 Medium (52)
              </button>
              <button
                id="gauge-preset-high-btn"
                onClick={() => handleScoreUpdate(92)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                  currentScore >= 70
                    ? 'bg-red-500/25 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-red-300 hover:border-red-500/40'
                }`}
              >
                🔴 High (92)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED SIDE PANEL: TOP 3 CONTRIBUTING FACTORS (when isSidePanelOpen is true) */}
      {isSidePanelOpen && (
        <div
          id="gauge-factors-side-panel"
          className="w-full lg:w-[280px] mt-4 lg:mt-0 p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col justify-between font-mono animate-in fade-in slide-in-from-left-2 duration-200"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-cyber font-bold text-slate-100 uppercase tracking-wider">
                  Top 3 Contributing Factors
                </span>
              </div>
              <button
                onClick={() => setIsSidePanelOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
                title="Collapse side panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[10px] text-slate-400 mb-3 leading-relaxed">
              Explainable AI (XAI) feature attribution for current score{' '}
              <span className="font-bold text-slate-200">{currentScore}/100</span>:
            </div>

            {/* List of Top 3 Factors with Labels and Percentages */}
            <div className="space-y-3">
              {riskFactors.map((factor) => (
                <div
                  key={factor.rank}
                  onMouseEnter={() => setHoveredFactor(factor)}
                  onMouseLeave={() => setHoveredFactor(null)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    hoveredFactor?.rank === factor.rank
                      ? 'bg-slate-900 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-[#060c18] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-[9px] font-bold">
                        {factor.rank}
                      </span>
                      <span className="text-[11px] font-bold text-slate-200 leading-tight">
                        {factor.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold font-cyber ml-1"
                      style={{ color: threat.color }}
                    >
                      {factor.percentage}%
                    </span>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${factor.percentage}%`,
                        backgroundColor: threat.color,
                        boxShadow: `0 0 10px ${threat.glowColor}`,
                      }}
                    />
                  </div>

                  <p className="text-[9px] text-slate-400 leading-tight">
                    {factor.detail}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between text-[8px] text-slate-500 uppercase">
                    <span>Category: {factor.category}</span>
                    <span className="text-cyan-400">Weight: high</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[9px] text-slate-500 flex items-center justify-between">
            <span>Model attribution: SHAP values</span>
            <span className="text-emerald-400">Residual: 6%</span>
          </div>
        </div>
      )}
    </div>
  );
};

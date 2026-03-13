"use client";

import React, { useMemo, useState } from "react";
import PptxGenJS from "pptxgenjs";


export default function JP8218CampCalculator() {
  const { useMemo, useState } = React;

  const campOptions = [75, 150, 500, 1500];
  const durationOptions = [7, 30, 180];
  const environments = {
    temperate: {
      label: "Temperate",
      waterPerPerson: 60,
      foodPerPerson: 2.5,
      dieselPerPerson: 4.2,
      solidWastePerPerson: 1.2,
      footprintFactor: 1.0,
      setupFactor: 1.0,
    },
    tropical: {
      label: "Tropical",
      waterPerPerson: 80,
      foodPerPerson: 2.5,
      dieselPerPerson: 4.8,
      solidWastePerPerson: 1.2,
      footprintFactor: 1.08,
      setupFactor: 1.1,
    },
    desert: {
      label: "Desert",
      waterPerPerson: 75,
      foodPerPerson: 2.5,
      dieselPerPerson: 5.1,
      solidWastePerPerson: 1.25,
      footprintFactor: 1.12,
      setupFactor: 1.15,
    },
  };

  const roundUp = (value) => Math.ceil(value);
  const fmt = (value) => new Intl.NumberFormat("en-AU").format(Math.round(value));

  function buildModel(campSize, duration, environmentKey) {
    const env = environments[environmentKey];
    const personnel = campSize;

    const accomPerModule = 15;
    const salPerUnit = 40;
    const kitchenPerPeople = 150;
    const waterPlantPerLpd = 25000;
    const storageContainerPerPeople = 12;
    const warehouseModules = personnel >= 500 ? roundUp(personnel / 300) : 0;
    const maintenanceShelters = personnel >= 500 ? roundUp(personnel / 250) : 0;
    const officeModules = roundUp(personnel / 150);

    const accommodationModules = roundUp(personnel / accomPerModule);
    const salUnits = roundUp(personnel / salPerUnit);
    const kitchenModules = roundUp(personnel / kitchenPerPeople);

    const waterPerDay = personnel * env.waterPerPerson;
    const foodPerDayKg = personnel * env.foodPerPerson;
    const dieselPerDay = personnel * env.dieselPerPerson;
    const wastePerDayKg = personnel * env.solidWastePerPerson;

    const waterTreatmentUnits = roundUp(waterPerDay / waterPlantPerLpd);
    const peakLoadKw = personnel * (1.8 * env.footprintFactor);
    const generatorSizeKw = 150;
    const generators = Math.max(2, roundUp((peakLoadKw * 1.25) / generatorSizeKw));

    const containerEstimate = roundUp(
      accommodationModules * 1.4 +
      salUnits * 0.8 +
      kitchenModules * 3.5 +
      waterTreatmentUnits * 2.5 +
      generators * 0.9 +
      officeModules * 1.1 +
      maintenanceShelters * 3.0 +
      warehouseModules * 5.0 +
      personnel / storageContainerPerPeople
    );

    const trucks = roundUp(containerEstimate * 0.72);
    const c17Sorties = Math.max(1, roundUp(containerEstimate / 24));
    const seaLiftDeckEq = roundUp(containerEstimate / 60);
    const setupHours = roundUp((personnel / 18) * env.setupFactor + generators * 2 + kitchenModules * 4);

    const areaSqm = roundUp(
      (accommodationModules * 45 +
        salUnits * 22 +
        kitchenModules * 120 +
        officeModules * 55 +
        maintenanceShelters * 280 +
        warehouseModules * 300) * env.footprintFactor
    );

    return {
      environmentLabel: env.label,
      duration,
      personnel,
      accommodationModules,
      kitchenModules,
      salUnits,
      generators,
      waterTreatmentUnits,
      officeModules,
      warehouseModules,
      maintenanceShelters,
      waterPerDay,
      foodPerDayKg,
      dieselPerDay,
      wastePerDayKg,
      peakLoadKw,
      containerEstimate,
      trucks,
      c17Sorties,
      seaLiftDeckEq,
      setupHours,
      areaSqm,
      totals: {
        water: waterPerDay * duration,
        food: foodPerDayKg * duration,
        diesel: dieselPerDay * duration,
        waste: wastePerDayKg * duration,
      },
    };
  }

  const [primary, setPrimary] = useState({ campSize: 150, duration: 30, environment: "temperate" });
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [secondary, setSecondary] = useState({ campSize: 500, duration: 30, environment: "tropical" });

  const primaryModel = useMemo(
    () => buildModel(primary.campSize, primary.duration, primary.environment),
    [primary]
  );
  const secondaryModel = useMemo(
    () => buildModel(secondary.campSize, secondary.duration, secondary.environment),
    [secondary]
  );

  const MetricCard = ({ title, value, subtext }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {subtext ? <div className="mt-1 text-sm text-slate-500">{subtext}</div> : null}
    </div>
  );

  const ScenarioControls = ({ title, value, onChange }) => (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Scenario</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Camp size</span>
          <select
            value={value.campSize}
            onChange={(e) => onChange({ ...value, campSize: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {campOptions.map((option) => (
              <option key={option} value={option}>{option} personnel</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Duration</span>
          <select
            value={value.duration}
            onChange={(e) => onChange({ ...value, duration: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {durationOptions.map((option) => (
              <option key={option} value={option}>{option} days</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Environment</span>
          <select
            value={value.environment}
            onChange={(e) => onChange({ ...value, environment: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {Object.entries(environments).map(([key, env]) => (
              <option key={key} value={key}>{env.label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );

  const ScenarioSummary = ({ title, model, accent }) => (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            {model.personnel} personnel • {model.duration} days • {model.environmentLabel}
          </h3>
        </div>
        <div className={`h-3 w-16 rounded-full ${accent}`} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Containers" value={fmt(model.containerEstimate)} subtext="Deployment load" />
        <MetricCard title="Trucks" value={fmt(model.trucks)} subtext="Convoy estimate" />
        <MetricCard title="C-17 sorties" value={fmt(model.c17Sorties)} subtext="Heavy airlift equivalent" />
        <MetricCard title="Setup time" value={`${fmt(model.setupHours)} hrs`} subtext="Initial establishment" />
      </div>
    </div>
  );

  const ComparisonRow = ({ label, a, b, suffix = "", higherIsWorse = true }) => {
    const delta = b - a;
    const direction = delta === 0 ? "No change" : delta > 0 ? `+${fmt(delta)} ${suffix}` : `-${fmt(Math.abs(delta))} ${suffix}`;
    const tone = delta === 0 ? "text-slate-500" : higherIsWorse ? (delta > 0 ? "text-rose-600" : "text-emerald-600") : (delta > 0 ? "text-emerald-600" : "text-rose-600");

    return (
      <div className="grid grid-cols-12 gap-3 border-b border-slate-100 py-3 text-sm last:border-b-0">
        <div className="col-span-4 text-slate-600">{label}</div>
        <div className="col-span-2 text-right font-medium text-slate-900">{fmt(a)} {suffix}</div>
        <div className="col-span-2 text-right font-medium text-slate-900">{fmt(b)} {suffix}</div>
        <div className={`col-span-4 text-right font-medium ${tone}`}>{direction}</div>
      </div>
    );
  };

  const InsightPill = ({ children }) => (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{children}</div>
  );

  const insights = useMemo(() => {
    const items = [];
    const deltaContainers = secondaryModel.containerEstimate - primaryModel.containerEstimate;
    const deltaWater = secondaryModel.waterPerDay - primaryModel.waterPerDay;
    const deltaDiesel = secondaryModel.dieselPerDay - primaryModel.dieselPerDay;

    if (deltaContainers !== 0) {
      items.push(
        `Scenario B changes the deployment burden by ${fmt(Math.abs(deltaContainers))} containers compared with Scenario A.`
      );
    }
    if (deltaWater !== 0) {
      items.push(
        `Daily water demand shifts by ${fmt(Math.abs(deltaWater))} litres. That is usually where naive camp concepts start to fall apart.`
      );
    }
    if (deltaDiesel !== 0) {
      items.push(
        `Daily diesel demand moves by ${fmt(Math.abs(deltaDiesel))} litres, which directly affects convoy size, storage and resilience.`
      );
    }
    if (secondaryModel.environmentLabel !== primaryModel.environmentLabel) {
      items.push(
        `Environment alone changes the footprint and setup assumptions. That is the point: the same brochure solution is not the same operational solution.`
      );
    }
    return items.slice(0, 4);
  }, [primaryModel, secondaryModel]);

  const exportBriefingSlide = async () => {
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "ChatGPT";
    pptx.company = "DECNet";
    pptx.subject = "JP8218 Deployable Camp Calculator";
    pptx.title = "JP8218 briefing slide";
    pptx.lang = "en-AU";
    pptx.theme = {
      headFontFace: "Aptos",
      bodyFontFace: "Aptos",
      lang: "en-AU",
    };

    const slide = pptx.addSlide();
    slide.background = { color: "F8FAFC" };

    slide.addText("JP8218 deployable camp briefing slide", {
      x: 0.4,
      y: 0.25,
      w: 6.8,
      h: 0.35,
      fontSize: 22,
      bold: true,
      color: "0F172A",
      margin: 0,
    });

    slide.addText(
      `Scenario A: ${primaryModel.personnel} personnel | ${primaryModel.duration} days | ${primaryModel.environmentLabel}`,
      {
        x: 0.4,
        y: 0.7,
        w: 5.8,
        h: 0.22,
        fontSize: 10,
        color: "475569",
        margin: 0,
      }
    );

    if (compareEnabled) {
      slide.addText(
        `Scenario B: ${secondaryModel.personnel} personnel | ${secondaryModel.duration} days | ${secondaryModel.environmentLabel}`,
        {
          x: 6.5,
          y: 0.7,
          w: 5.8,
          h: 0.22,
          fontSize: 10,
          color: "475569",
          margin: 0,
          align: "right",
        }
      );
    }

    const addCard = (x, y, w, h, title, value, note, fill = "FFFFFF") => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w,
        h,
        rectRadius: 0.08,
        line: { color: "E2E8F0", pt: 1 },
        fill: { color: fill },
      });
      slide.addText(title, {
        x: x + 0.16,
        y: y + 0.08,
        w: w - 0.32,
        h: 0.2,
        fontSize: 9,
        color: "64748B",
        margin: 0,
      });
      slide.addText(value, {
        x: x + 0.16,
        y: y + 0.26,
        w: w - 0.32,
        h: 0.28,
        fontSize: 18,
        bold: true,
        color: "0F172A",
        margin: 0,
      });
      if (note) {
        slide.addText(note, {
          x: x + 0.16,
          y: y + h - 0.22,
          w: w - 0.32,
          h: 0.14,
          fontSize: 7.5,
          color: "64748B",
          margin: 0,
        });
      }
    };

    addCard(0.4, 1.0, 2.8, 0.95, "Containers", fmt(primaryModel.containerEstimate), "Indicative ISO-equivalent load");
    addCard(3.35, 1.0, 2.8, 0.95, "Trucks", fmt(primaryModel.trucks), "Approximate convoy requirement");
    addCard(6.3, 1.0, 2.8, 0.95, "C-17 sorties", fmt(primaryModel.c17Sorties), "Heavy airlift equivalent");
    addCard(9.25, 1.0, 2.1, 0.95, "Setup time", `${fmt(primaryModel.setupHours)} hrs`, "Initial establishment");

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.4,
      y: 2.15,
      w: 5.4,
      h: 2.2,
      rectRadius: 0.08,
      line: { color: "E2E8F0", pt: 1 },
      fill: { color: "FFFFFF" },
    });
    slide.addText("Primary scenario demand and footprint", {
      x: 0.56,
      y: 2.26,
      w: 3.2,
      h: 0.2,
      fontSize: 12,
      bold: true,
      color: "0F172A",
      margin: 0,
    });

    const primaryTableRows = [
      ["Accommodation modules", fmt(primaryModel.accommodationModules)],
      ["Kitchen modules", fmt(primaryModel.kitchenModules)],
      ["SAL units", fmt(primaryModel.salUnits)],
      ["Generators", fmt(primaryModel.generators)],
      ["Water treatment units", fmt(primaryModel.waterTreatmentUnits)],
      ["Operational footprint", `${fmt(primaryModel.areaSqm)} m²`],
      ["Daily water", `${fmt(primaryModel.waterPerDay)} L`],
      ["Daily diesel", `${fmt(primaryModel.dieselPerDay)} L`],
    ];

    primaryTableRows.forEach((row, idx) => {
      const yy = 2.55 + idx * 0.21;
      slide.addText(row[0], {
        x: 0.62,
        y: yy,
        w: 2.8,
        h: 0.16,
        fontSize: 9,
        color: "334155",
        margin: 0,
      });
      slide.addText(row[1], {
        x: 3.55,
        y: yy,
        w: 1.8,
        h: 0.16,
        fontSize: 9,
        bold: true,
        color: "0F172A",
        margin: 0,
        align: "right",
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.0,
      y: 2.15,
      w: 5.35,
      h: 2.2,
      rectRadius: 0.08,
      line: { color: "E2E8F0", pt: 1 },
      fill: { color: "FFFFFF" },
    });
    slide.addText(compareEnabled ? "Scenario comparison" : "Duration totals", {
      x: 6.16,
      y: 2.26,
      w: 2.8,
      h: 0.2,
      fontSize: 12,
      bold: true,
      color: "0F172A",
      margin: 0,
    });

    if (compareEnabled) {
      const comparisonRows = [
        ["Containers", primaryModel.containerEstimate, secondaryModel.containerEstimate],
        ["Trucks", primaryModel.trucks, secondaryModel.trucks],
        ["C-17 sorties", primaryModel.c17Sorties, secondaryModel.c17Sorties],
        ["Setup time (hrs)", primaryModel.setupHours, secondaryModel.setupHours],
        ["Daily water (L)", primaryModel.waterPerDay, secondaryModel.waterPerDay],
        ["Daily diesel (L)", primaryModel.dieselPerDay, secondaryModel.dieselPerDay],
        ["Footprint (m²)", primaryModel.areaSqm, secondaryModel.areaSqm],
      ];

      slide.addText("Metric", { x: 6.22, y: 2.56, w: 1.6, h: 0.16, fontSize: 8, bold: true, color: "64748B", margin: 0 });
      slide.addText("A", { x: 8.15, y: 2.56, w: 0.6, h: 0.16, fontSize: 8, bold: true, color: "64748B", margin: 0, align: "right" });
      slide.addText("B", { x: 8.95, y: 2.56, w: 0.6, h: 0.16, fontSize: 8, bold: true, color: "64748B", margin: 0, align: "right" });
      slide.addText("Delta", { x: 9.75, y: 2.56, w: 1.15, h: 0.16, fontSize: 8, bold: true, color: "64748B", margin: 0, align: "right" });

      comparisonRows.forEach((row, idx) => {
        const yy = 2.8 + idx * 0.22;
        const delta = row[2] - row[1];
        slide.addText(String(row[0]), { x: 6.22, y: yy, w: 1.75, h: 0.16, fontSize: 8.5, color: "334155", margin: 0 });
        slide.addText(fmt(row[1]), { x: 8.05, y: yy, w: 0.7, h: 0.16, fontSize: 8.5, bold: true, color: "0F172A", margin: 0, align: "right" });
        slide.addText(fmt(row[2]), { x: 8.85, y: yy, w: 0.7, h: 0.16, fontSize: 8.5, bold: true, color: "0F172A", margin: 0, align: "right" });
        slide.addText(`${delta > 0 ? "+" : ""}${fmt(delta)}`, { x: 9.75, y: yy, w: 1.15, h: 0.16, fontSize: 8.5, bold: true, color: delta > 0 ? "DC2626" : delta < 0 ? "059669" : "64748B", margin: 0, align: "right" });
      });
    } else {
      const totalRows = [
        ["Water", `${fmt(primaryModel.totals.water)} L`],
        ["Food", `${fmt(primaryModel.totals.food)} kg`],
        ["Diesel", `${fmt(primaryModel.totals.diesel)} L`],
        ["Solid waste", `${fmt(primaryModel.totals.waste)} kg`],
      ];
      totalRows.forEach((row, idx) => {
        const yy = 2.75 + idx * 0.28;
        slide.addText(row[0], { x: 6.22, y: yy, w: 2.0, h: 0.18, fontSize: 9, color: "334155", margin: 0 });
        slide.addText(row[1], { x: 8.9, y: yy, w: 2.0, h: 0.18, fontSize: 9, bold: true, color: "0F172A", margin: 0, align: "right" });
      });
    }

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.4,
      y: 4.55,
      w: 10.95,
      h: 2.35,
      rectRadius: 0.08,
      line: { color: "E2E8F0", pt: 1 },
      fill: { color: "FFFFFF" },
    });
    slide.addText("Key observations", {
      x: 0.56,
      y: 4.68,
      w: 2.5,
      h: 0.2,
      fontSize: 12,
      bold: true,
      color: "0F172A",
      margin: 0,
    });

    const observationLines = (compareEnabled ? insights : [
      `This scenario implies an indicative deployment load of ${fmt(primaryModel.containerEstimate)} containers and ${fmt(primaryModel.trucks)} trucks.`,
      `Daily sustainment demand is approximately ${fmt(primaryModel.waterPerDay)} litres of water and ${fmt(primaryModel.dieselPerDay)} litres of diesel.`,
      `The model is suitable for early discussion only. It is not a compliant engineering, commercial or transport certification tool.`,
    ]).slice(0, 4);

    observationLines.forEach((line, idx) => {
      slide.addText(`• ${line}`, {
        x: 0.7,
        y: 5.0 + idx * 0.36,
        w: 10.2,
        h: 0.24,
        fontSize: 10,
        color: "334155",
        margin: 0,
        breakLine: false,
      });
    });

    slide.addText("Source: DECNet concept model | Indicative planning output only", {
      x: 0.45,
      y: 7.05,
      w: 4.4,
      h: 0.16,
      fontSize: 7,
      color: "64748B",
      margin: 0,
    });

    const fileName = `jp8218-briefing-slide-${primaryModel.personnel}p${compareEnabled ? `-vs-${secondaryModel.personnel}p` : ""}.pptx`;
    await pptx.writeFile({ fileName });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">DECNet concept tool</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                JP8218 deployable camp calculator
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Indicative planning model for deployment footprint and sustainment demand. The useful upgrade is not more decoration. It is side-by-side scenario comparison so teams can test trade-offs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={compareEnabled}
                onChange={(e) => setCompareEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Enable scenario comparison
            </label>
            <button
              onClick={exportBriefingSlide}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Export briefing slide
            </button>
          </div>
          </div>
        </div>

        <ScenarioControls title="Scenario A" value={primary} onChange={setPrimary} />
        {compareEnabled ? <ScenarioControls title="Scenario B" value={secondary} onChange={setSecondary} /> : null}

        <ScenarioSummary title="Scenario A" model={primaryModel} accent="bg-slate-800" />
        {compareEnabled ? <ScenarioSummary title="Scenario B" model={secondaryModel} accent="bg-sky-500" /> : null}

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Scenario comparison</h2>
                <div className="text-sm text-slate-500">A versus B</div>
              </div>

              {compareEnabled ? (
                <div className="mt-5">
                  <div className="grid grid-cols-12 gap-3 border-b border-slate-200 pb-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <div className="col-span-4">Metric</div>
                    <div className="col-span-2 text-right">Scenario A</div>
                    <div className="col-span-2 text-right">Scenario B</div>
                    <div className="col-span-4 text-right">Delta</div>
                  </div>
                  <ComparisonRow label="Containers" a={primaryModel.containerEstimate} b={secondaryModel.containerEstimate} />
                  <ComparisonRow label="Trucks" a={primaryModel.trucks} b={secondaryModel.trucks} />
                  <ComparisonRow label="C-17 sorties" a={primaryModel.c17Sorties} b={secondaryModel.c17Sorties} />
                  <ComparisonRow label="Setup time" a={primaryModel.setupHours} b={secondaryModel.setupHours} suffix="hrs" />
                  <ComparisonRow label="Daily water" a={primaryModel.waterPerDay} b={secondaryModel.waterPerDay} suffix="L" />
                  <ComparisonRow label="Daily diesel" a={primaryModel.dieselPerDay} b={secondaryModel.dieselPerDay} suffix="L" />
                  <ComparisonRow label="Daily food" a={primaryModel.foodPerDayKg} b={secondaryModel.foodPerDayKg} suffix="kg" />
                  <ComparisonRow label="Footprint" a={primaryModel.areaSqm} b={secondaryModel.areaSqm} suffix="m²" />
                  <ComparisonRow label="Generators" a={primaryModel.generators} b={secondaryModel.generators} />
                  <ComparisonRow label="Water treatment units" a={primaryModel.waterTreatmentUnits} b={secondaryModel.waterTreatmentUnits} />
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                  Comparison is switched off. That is fine for a demo, but the real value starts when you compare two options and expose what changes under the hood.
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Primary scenario subsystem estimate</h2>
                <div className="text-sm text-slate-500">Indicative modular breakdown</div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard title="Accommodation modules" value={fmt(primaryModel.accommodationModules)} subtext="Assumed at 15 personnel per module" />
                <MetricCard title="Kitchen modules" value={fmt(primaryModel.kitchenModules)} subtext="Assumed at 1 per 150 personnel" />
                <MetricCard title="SAL units" value={fmt(primaryModel.salUnits)} subtext="Assumed at 1 per 40 personnel" />
                <MetricCard title="Generators" value={fmt(primaryModel.generators)} subtext={`${fmt(primaryModel.peakLoadKw)} kW estimated peak load`} />
                <MetricCard title="Water treatment units" value={fmt(primaryModel.waterTreatmentUnits)} subtext="Assumed at 25,000 L/day per unit" />
                <MetricCard title="HQ / office modules" value={fmt(primaryModel.officeModules)} subtext="Scaled with population" />
                <MetricCard title="Warehouse modules" value={fmt(primaryModel.warehouseModules)} subtext="300 m² per module where applicable" />
                <MetricCard title="Maintenance shelters" value={fmt(primaryModel.maintenanceShelters)} subtext="Only added for larger operating nodes" />
                <MetricCard title="Operational footprint" value={`${fmt(primaryModel.areaSqm)} m²`} subtext="Built-up operating area only" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Comparison insights</h2>
              <div className="mt-4 space-y-3">
                {compareEnabled ? insights.map((item, idx) => <InsightPill key={idx}>{item}</InsightPill>) : <InsightPill>Enable Scenario B to generate comparison insights.</InsightPill>}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Primary scenario totals</h2>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Water</span>
                  <span className="font-semibold text-slate-900">{fmt(primaryModel.totals.water)} L</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Food</span>
                  <span className="font-semibold text-slate-900">{fmt(primaryModel.totals.food)} kg</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Diesel</span>
                  <span className="font-semibold text-slate-900">{fmt(primaryModel.totals.diesel)} L</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Solid waste</span>
                  <span className="font-semibold text-slate-900">{fmt(primaryModel.totals.waste)} kg</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Assumptions</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  This model is intentionally simple. It is built for early discussion, not compliance, pricing, or engineering certification.
                </p>
                <p>
                  Transport figures are ISO-equivalent approximations only. Air and sea lift equivalents are broad planning proxies.
                </p>
                <p>
                  Larger camps trigger warehousing and maintenance elements because forward logistics nodes have a different burden to a small temporary camp.
                </p>
                <p>
                  The mistake would be treating one scenario as “the answer”. The better use is comparing options and exposing what really changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

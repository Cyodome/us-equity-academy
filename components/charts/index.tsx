"use client";

import { C01, C02, C03, C04 } from "./part1";
import { C05, C06, C07, C08, C09, C10, C11, C12, C25, C30 } from "./part2";
import { C13, C14, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C26, C27, C28, C29 } from "./part3";

const registry: Record<string, () => React.ReactElement> = {
  c01_trading_hours: C01,
  c02_fx_effect: C02,
  c03_index_constituents: C03,
  c04_dotcom_drawdown: C04,
  c05_eps_growth: C05,
  c06_operating_leverage: C06,
  c07_per_sensitivity: C07,
  c08_dupont: C08,
  c09_nova_scenarios: C09,
  c10_fcf_bridge: C10,
  c11_dcf_sensitivity: C11,
  c12_leverage_stress: C12,
  c13_compound: C13,
  c14_contribution: C14,
  c15_drawdown_recovery: C15,
  c16_fee_drag: C16,
  c17_stop_gap: C17,
  c18_trailing_stop: C18,
  c19_ladder_buy: C19,
  c20_portfolio_pies: C20,
  c21_accumulation: C21,
  c22_econ_calendar: C22,
  c23_indicators_now: C23,
  c24_order_book: C24,
  c25_rate_per_chain: C25,
  c26_depth_chart: C26,
  c27_quadrant: C27,
  c28_deployment_plan: C28,
  c29_risk_profiles: C29,
  c30_fcf_allocation: C30,
};

export const chartIds = Object.keys(registry);

export function Chart({ id }: { id: string }) {
  const C = registry[id];
  if (!C) return <p className="text-down">図（{id}）が見つかりません</p>;
  return <C />;
}

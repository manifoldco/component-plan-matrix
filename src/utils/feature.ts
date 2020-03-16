import { Connection } from '@manifoldco/manifold-init-types/types/v0';
import { ProductQuery, PlanFeatureType } from '../types/graphql';

export function defaultFeatureValue(
  feature: ProductQuery['product']['plans']['edges'][0]['node']['configurableFeatures']['edges'][0]['node']
) {
  switch (feature.type) {
    case PlanFeatureType.String:
      return feature.featureOptions[0].value;
    case PlanFeatureType.Number:
      return feature.numericDetails.min;
    case PlanFeatureType.Boolean:
      return false; // prefer false by default
    default:
      return undefined;
  }
}

// keep track of controllers
const controllers: { [planID: string]: AbortController | undefined } = {};

export async function fetchPlanCost(
  connection: Connection,
  {
    planID,
    selection,
  }: {
    planID: string;
    selection: { [featureLabel: string]: string | number | boolean | undefined };
  }
) {
  // request in-flight? cancel it
  let controller = controllers[planID];
  if (controller) {
    controller.abort();
  }

  try {
    controller = new AbortController();
    controllers[planID] = controller;
    const req = { features: selection };
    const res = await connection.gateway.post<{ cost: number }, typeof req>(
      `/id/plan/${planID}/cost`,
      req
    );
    // const res: { cost: number } = await fetch(`${url}/id/plan/${planID}/cost`, {
    //   method: 'POST',
    //   headers: { Connection: 'keep-alive', 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ features: selection }),
    //   signal: controller.signal,
    // }).then(body => body.json());

    delete controllers[planID]; // unset controller after finish

    if (res && typeof res.cost === 'number') {
      return res.cost;
    }

    return undefined;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

import { FunctionalComponent, h } from '@stencil/core';

const DEFAULT_PLANS = 3;
const DEFAULT_FEATURES = 5;

// note: &nbsp; characters are used to take up space without flashing unstyled text while loading

const SkeletonLoader: FunctionalComponent = () => (
  <div
    class="mp"
    style={{
      '--table-columns': `${1 + DEFAULT_PLANS}`,
      '--table-rows': `${1 + DEFAULT_FEATURES + 1}`,
    }}
  >
    <div
      class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Sticky ManifoldPlanTable__Cell--TH ManifoldPlanTable__Cell--THead"
      data-column-first
      data-row-first
    ></div>
    {Array.from(new Array(DEFAULT_FEATURES)).map(() => (
      <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Sticky ManifoldPlanTable__Cell--TH">
        <div class="ManifoldPlanTable__Skeleton">
                                                        
        </div>
      </div>
    ))}
    <div
      class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Sticky ManifoldPlanTable__Cell--TH"
      data-column-first
      data-row-last
    ></div>
    {Array.from(new Array(DEFAULT_PLANS)).map((_, plan) => [
      <div
        class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--THead ManifoldPlanTable__Cell--THead ManifoldPlanTable__Cell--TH"
        data-row-first
        data-column-last={plan === DEFAULT_PLANS - 1 || undefined}
      >
        <div class="ManifoldPlanTable__Skeleton">                     </div>
      </div>,
      Array.from(new Array(DEFAULT_FEATURES)).map(() => (
        <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
          <div class="ManifoldPlanTable__Skeleton">                        </div>
        </div>
      )),
      <div
        class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body ManifoldPlanTable__Cell__bbs"
        data-row-last
        data-column-last={plan === DEFAULT_PLANS - 1 || undefined}
      ></div>,
    ])}
  </div>
);

export default SkeletonLoader;

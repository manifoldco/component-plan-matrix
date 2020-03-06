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
      class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th mp--cell__thead mp--cell__bts"
      data-column-first
      data-row-first
    ></div>
    {Array.from(new Array(DEFAULT_FEATURES)).map(() => (
      <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th">
        <div class="mp--skeleton">                                              </div>
      </div>
    ))}
    <div
      class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__bbs mp--cell__al mp--cell__th"
      data-column-first
      data-row-last
    ></div>
    {Array.from(new Array(DEFAULT_PLANS)).map((_, plan) => [
      <div
        class="mp--cell mp--cell__bts mp--cell__thead mp--cell__thead mp--cell__th"
        data-row-first
        data-column-last={plan === DEFAULT_PLANS - 1 || undefined}
      >
        <div class="mp--skeleton">                     </div>
      </div>,
      Array.from(new Array(DEFAULT_FEATURES)).map(() => (
        <div class="mp--cell mp--cell__body">
          <div class="mp--skeleton">                        </div>
        </div>
      )),
      <div
        class="mp--cell mp--cell__body mp--cell__bbs"
        data-row-last
        data-column-last={plan === DEFAULT_PLANS - 1 || undefined}
      ></div>,
    ])}
  </div>
);

export default SkeletonLoader;
